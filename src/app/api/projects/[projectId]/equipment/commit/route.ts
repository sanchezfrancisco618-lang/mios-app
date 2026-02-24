import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getTradeFromCategory, checkDuplicateProbability } from '@/server/services/normalization';
import { leadTimeResolver, riskEngine, createEventLog } from '@/server/services/dbLogic';
import { z } from 'zod';

const schema = z.object({
    runId: z.string(),
    rowIds: z.array(z.string()).optional() // empty = commit all approved
});

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const { runId, rowIds } = schema.parse(body);

    const whereClause: any = { runId, projectId: params.projectId, status: "APPROVED" };
    if (rowIds && rowIds.length > 0) {
        whereClause.id = { in: rowIds };
    }

    const approvedRows = await prisma.extractionRow.findMany({ where: whereClause });

    if (approvedRows.length === 0) return NextResponse.json({ message: "No rows to commit" }, { status: 400 });

    const results: any[] = [];
    const conflicts: any[] = [];

    const currentEquipment = await prisma.equipment.findMany({ where: { projectId: params.projectId } });

    // Ensure all commits happen atomically
    await prisma.$transaction(async (tx) => {
        for (const row of approvedRows) {
            let isDuplicate = false;
            let matchedEq = null;
            for (const eq of currentEquipment) {
                if (eq.tagNormalized === row.tagNormalized || checkDuplicateProbability(eq.tagNormalized, row.tagNormalized, eq.location, row.location)) {
                    isDuplicate = true;
                    matchedEq = eq;
                    break;
                }
            }

            if (isDuplicate) {
                conflicts.push({
                    pendingRow: row,
                    existingEquipment: matchedEq
                });
                continue;
            }

            const trade = getTradeFromCategory(row.category);
            const controlsRequired = trade === "HVAC" || trade === "CONTROLS";
            const leadTimeWeeks = await leadTimeResolver(params.projectId, row.category);

            // Phase 3 & 4: Immutable Architecture with Transactions
            const newEq = await tx.equipment.create({
                data: {
                    projectId: params.projectId,
                    tagNormalized: row.tagNormalized,
                    category: row.category,
                    trade,
                    level: row.level,
                    location: row.location,
                    qty: row.qty,
                    controlsRequired,
                    procurementStatus: "NOT_RELEASED",
                    neededOnSite: null,
                    leadTimeWeeks,
                    requiredRelease: null
                }
            });

            // The physical specs live strictly on the revision
            const snapshotPayload = { ...newEq, airflowCfm: row.airflowCfm, gpm: row.gpm, voltage: row.voltage, phase: row.phase, specSection: row.specSection };
            const newRev = await tx.equipmentRevision.create({
                data: {
                    projectId: params.projectId,
                    equipmentId: newEq.id,
                    sourceRunId: runId, // Source traceability
                    source: "EXTRACTION",
                    airflowCfm: row.airflowCfm,
                    gpm: row.gpm,
                    voltage: row.voltage,
                    phase: row.phase,
                    specSection: row.specSection,
                    snapshot: JSON.stringify(snapshotPayload)
                }
            });

            // Seal the current active revision pointing back to the equipment
            await tx.equipment.update({
                where: { id: newEq.id },
                data: { activeRevisionId: newRev.id }
            });

            // Mark row committed
            await tx.extractionRow.update({
                where: { id: row.id },
                data: { status: "COMMITTED" }
            });

            results.push(newEq);
        }

        // Inline event log to guarantee transaction inclusion
        await tx.eventLog.create({
            data: {
                projectId: params.projectId,
                actor: "system",
                eventType: "EQUIPMENT_COMMITTED_PHASE4",
                entityType: "ExtractionRun",
                entityId: runId,
                payload: JSON.stringify({ committed: results.length, conflicts: conflicts.length })
            }
        });
    });

    // Run risk engine outside transaction so it doesn't hold DB locks unnecessarily
    await riskEngine(params.projectId);

    return NextResponse.json({
        message: "Commit complete",
        committedCount: results.length,
        conflicts
    });
}
