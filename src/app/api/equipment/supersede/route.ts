import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getTradeFromCategory, checkDuplicateProbability } from '@/server/services/normalization';
import { createEventLog } from '@/server/services/dbLogic';
import { z } from 'zod';

const schema = z.object({
    rowId: z.string(),
    projectId: z.string()
});

export async function POST(req: Request) {
    const body = await req.json();
    const parsedRowId = schema.parse(body).rowId;

    const row = await prisma.extractionRow.findUnique({ where: { id: parsedRowId } });
    if (!row) return NextResponse.json({ message: "Row not found" }, { status: 404 });

    const projectId = row.projectId; // Derived properly

    const existingEquipmentList = await prisma.equipment.findMany({ where: { projectId } });
    let targetEq = null;
    for (const eq of existingEquipmentList) {
        if (eq.tagNormalized === row.tagNormalized || checkDuplicateProbability(eq.tagNormalized, row.tagNormalized, eq.location, row.location)) {
            targetEq = eq;
            break;
        }
    }

    if (!targetEq) {
        return NextResponse.json({ message: "Original equipment to supersede not found" }, { status: 404 });
    }

    const trade = getTradeFromCategory(row.category);
    const controlsRequired = trade === "HVAC" || trade === "CONTROLS";

    // Atomicity: Execute the supersede update safely
    const finalEq = await prisma.$transaction(async (tx) => {
        const updatedEq = await tx.equipment.update({
            where: { id: targetEq.id },
            data: {
                category: row.category,
                trade,
                level: row.level,
                location: row.location,
                qty: row.qty,
                controlsRequired
            }
        });

        const snapshotData = { ...updatedEq, airflowCfm: row.airflowCfm, gpm: row.gpm, voltage: row.voltage, phase: row.phase, specSection: row.specSection };

        // Append explicit Revision containing specs
        const newRev = await tx.equipmentRevision.create({
            data: {
                projectId,
                equipmentId: targetEq.id,
                supersedesRevisionId: targetEq.activeRevisionId,
                sourceRunId: row.runId,
                source: "EXTRACTION",
                airflowCfm: row.airflowCfm,
                gpm: row.gpm,
                voltage: row.voltage,
                phase: row.phase,
                specSection: row.specSection,
                snapshot: JSON.stringify(snapshotData)
            }
        });

        // Set pointer
        await tx.equipment.update({
            where: { id: targetEq.id },
            data: { activeRevisionId: newRev.id }
        });

        // Lock extraction row
        await tx.extractionRow.update({
            where: { id: row.id },
            data: { status: "COMMITTED" }
        });

        await tx.eventLog.create({
            data: {
                projectId,
                actor: "system",
                eventType: "EQUIPMENT_SUPERSEDED_PHASE4",
                entityType: "Equipment",
                entityId: targetEq.id,
                payload: JSON.stringify({ supersededByRow: row.id, newRevisionId: newRev.id })
            }
        });

        return updatedEq;
    });

    return NextResponse.json(finalEq);
}
