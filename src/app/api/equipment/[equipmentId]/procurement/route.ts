import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requiredReleaseCalc, riskEngine, createEventLog } from '@/server/services/dbLogic';
import { z } from 'zod';

const schema = z.object({
    neededOnSite: z.string().nullable().optional(),
    procurementStatus: z.string().optional(),
    leadTimeWeeks: z.number().nullable().optional(),
    vendor: z.string().nullable().optional(),
    poNumber: z.string().nullable().optional(),
    shipStatus: z.string().nullable().optional(),
    neededOnSiteSource: z.string().nullable().optional()
});

export async function PATCH(req: Request, { params }: { params: { equipmentId: string } }) {
    const body = await req.json();
    const parsed = schema.parse(body);

    const current = await prisma.equipment.findUnique({
        where: { id: params.equipmentId },
        include: { activeRevision: true }
    });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const VALID_STATES = ["NOT_RELEASED", "RELEASED", "ORDERED", "APPROVED", "FABRICATION", "SHIPPED", "DELIVERED", "INSTALLED", "TURNED_OVER"];

    let newNeededOnSite = current.neededOnSite;
    let newLeadTime = current.leadTimeWeeks;
    let newStatus = current.procurementStatus;

    if (parsed.neededOnSite !== undefined) {
        if (parsed.neededOnSite) {
            newNeededOnSite = new Date(parsed.neededOnSite);
        } else {
            newNeededOnSite = null;
        }
    }
    if (parsed.leadTimeWeeks !== undefined && parsed.leadTimeWeeks !== null) newLeadTime = parsed.leadTimeWeeks;

    // Phase 4: State Machine Enforcement
    if (parsed.procurementStatus !== undefined && parsed.procurementStatus !== current.procurementStatus) {
        const currentIndex = VALID_STATES.indexOf(current.procurementStatus);
        const nextIndex = VALID_STATES.indexOf(parsed.procurementStatus);

        if (nextIndex === -1) {
            return NextResponse.json({ error: "Invalid target state" }, { status: 400 });
        }

        // Cannot jump forward more than 1 state at a time. Backwards jumps (e.g., cancellations) are permitted.
        if (nextIndex > currentIndex + 1) {
            return NextResponse.json({ error: "Illegal state transition. Cannot skip states." }, { status: 400 });
        }

        newStatus = parsed.procurementStatus;
    }

    const newVendor = parsed.vendor !== undefined ? parsed.vendor : current.vendor;
    const newPo = parsed.poNumber !== undefined ? parsed.poNumber : current.poNumber;
    const newShipStatus = parsed.shipStatus !== undefined ? parsed.shipStatus : current.shipStatus;
    const newSource = parsed.neededOnSiteSource !== undefined ? parsed.neededOnSiteSource : current.neededOnSiteSource;

    const reqRel = newNeededOnSite && newLeadTime != null ? requiredReleaseCalc(newNeededOnSite, newLeadTime) : null;

    // Phase 2: Transactional Integrity
    const updated = await prisma.$transaction(async (tx) => {
        const eq = await tx.equipment.update({
            where: { id: params.equipmentId },
            data: {
                neededOnSite: newNeededOnSite,
                leadTimeWeeks: newLeadTime,
                procurementStatus: newStatus,
                requiredRelease: reqRel,
                vendor: newVendor,
                poNumber: newPo,
                shipStatus: newShipStatus,
                neededOnSiteSource: newSource
            }
        });

        const activeRev = current.activeRevision;

        const rev = await tx.equipmentRevision.create({
            data: {
                projectId: eq.projectId,
                equipmentId: eq.id,
                supersedesRevisionId: current.activeRevisionId,
                source: "MANUAL",
                airflowCfm: activeRev?.airflowCfm,
                gpm: activeRev?.gpm,
                voltage: activeRev?.voltage,
                phase: activeRev?.phase,
                specSection: activeRev?.specSection,
                snapshot: JSON.stringify(eq)
            }
        });

        await tx.equipment.update({
            where: { id: eq.id },
            data: { activeRevisionId: rev.id }
        });

        await tx.eventLog.create({
            data: {
                projectId: eq.projectId,
                actor: "system",
                eventType: "PROCUREMENT_INFO_UPDATED",
                entityType: "Equipment",
                entityId: eq.id,
                payload: JSON.stringify({ neededOnSite: newNeededOnSite, leadTimeWeeks: newLeadTime, status: newStatus })
            }
        });

        return eq;
    });

    // Run standalone risk engine asynchronously to cleanly separate core transaction commit limits
    await riskEngine(updated.projectId);

    return NextResponse.json(updated);
}
