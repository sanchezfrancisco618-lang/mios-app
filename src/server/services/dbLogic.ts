import { prisma } from "../db";
import { getStandardLeadTime } from "./normalization";
import { format, differenceInDays } from "date-fns";
import crypto from "crypto";

export const leadTimeResolver = async (projectId: string, category: string, equipmentOverride?: number | null): Promise<number> => {
    if (equipmentOverride !== null && equipmentOverride !== undefined) return equipmentOverride;
    // look for project level override
    const ov = await prisma.projectLeadTimeOverride.findFirst({
        where: { projectId, category }
    });
    if (ov) return ov.leadTimeWeeks;
    // standard fallback
    return getStandardLeadTime(category);
};

export const requiredReleaseCalc = (neededOnSite: Date | string | null, leadTimeWeeks: number): Date | null => {
    if (!neededOnSite) return null;
    const d = new Date(neededOnSite);
    d.setDate(d.getDate() - (leadTimeWeeks * 7));
    return d;
};

export const riskEngine = async (projectId: string) => {
    const today = new Date();

    // 1) Find Equipment with missed releases (Idempotent evaluation)
    const eqData = await prisma.equipment.findMany({ where: { projectId } });

    for (const eq of eqData) {
        const triggerDesc = "Missed required release date";
        const isNotReleased = !["RELEASED", "ORDERED", "APPROVED", "FABRICATION", "SHIPPED", "DELIVERED", "INSTALLED", "TURNED_OVER"].includes(eq.procurementStatus);

        const isMissed = eq.requiredRelease && eq.requiredRelease < today && isNotReleased;

        const existing = await prisma.risk.findFirst({
            where: { projectId, equipmentId: eq.id, category: "PROCUREMENT", trigger: triggerDesc }
        });

        if (isMissed) {
            if (!existing) {
                await prisma.risk.create({
                    data: { projectId, severity: "HIGH", category: "PROCUREMENT", trigger: triggerDesc, status: "OPEN", owner: "system", equipmentId: eq.id }
                });
            } else if (existing.status !== "OPEN") {
                await prisma.risk.update({ where: { id: existing.id }, data: { status: "OPEN" } });
            }
        } else {
            if (existing && existing.status === "OPEN") {
                await prisma.risk.update({ where: { id: existing.id }, data: { status: "MITIGATED" } });
            }
        }
    }

    // 2) Inspections in <14 days not requested
    const upcomingInps = await prisma.inspection.findMany({
        where: {
            projectId,
            status: "NOT_REQUESTED",
            windowStart: { lte: new Date(today.getTime() + 14 * 24 * 3600 * 1000) }
        }
    });
    for (const insp of upcomingInps) {
        const trigger = `Inspection ${insp.name} in <14 days not requested`;
        const existing = await prisma.risk.findFirst({
            where: { projectId, category: "INSPECTION", trigger }
        });
        if (!existing) {
            await prisma.risk.create({
                data: { projectId, severity: "MED", category: "INSPECTION", trigger, status: "OPEN", owner: "system" }
            });
        }
    }

    // 3) Controls predecessor missing (Phase 6B logic)
    const controlsEq = await prisma.equipment.findMany({
        where: { projectId, controlsRequired: true },
        include: { scheduleTasks: { include: { predecessors: { include: { predecessor: true } } } } }
    });

    for (const eq of controlsEq) {
        let hasControlsPredecessor = false;

        // Loop through linked install tasks
        for (const task of eq.scheduleTasks) {
            // Check if any predecessor is marked as a Controls Milestone
            const controlsPreds = task.predecessors.filter(p => p.predecessor.isControlsMilestone);
            if (controlsPreds.length > 0) {
                hasControlsPredecessor = true;
                break;
            }
        }

        const riskTrigger = "Controls predecessor missing from Schedule";
        const existing = await prisma.risk.findFirst({
            where: { projectId, equipmentId: eq.id, category: "CONTROLS", trigger: riskTrigger }
        });

        if (!hasControlsPredecessor && !existing) {
            await prisma.risk.create({
                data: { projectId, severity: "HIGH", category: "CONTROLS", trigger: riskTrigger, status: "OPEN", owner: "system", equipmentId: eq.id }
            });
        } else if (hasControlsPredecessor && existing && existing.status === "OPEN") {
            // Mitigate it automatically since the schedule was fixed
            await prisma.risk.update({
                where: { id: existing.id },
                data: { status: "MITIGATED" }
            });
        }
    }
};

export const createEventLog = async (projectId: string, actor: string, eventType: string, entityType: string, entityId: string, payload: any) => {
    await prisma.eventLog.create({
        data: {
            projectId, actor, eventType, entityType, entityId, payload: JSON.stringify(payload)
        }
    });
};
