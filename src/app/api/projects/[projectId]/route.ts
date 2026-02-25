import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    let p = await prisma.project.findUnique({
        where: { id: params.projectId }
    });

    if (!p && params.projectId === 'P-1001') {
        p = await prisma.project.create({
            data: {
                id: 'P-1001',
                name: "Howard County MD Public School",
                ahj: "HCPSS Dept of Facilities",
                mode: "Existing",
                scope_hvac: true,
                scope_plumbing: true
            }
        });
    }

    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const openRisks = await prisma.risk.count({ where: { projectId: params.projectId, status: "OPEN" } });
    const missedReleasesCount = await prisma.equipment.count({
        where: {
            projectId: params.projectId,
            requiredRelease: { lt: new Date() },
            procurementStatus: { notIn: ["RELEASED", "ORDERED", "FAB", "SHIPPED", "DELIVERED", "INSTALLED", "STARTED_UP", "TABBED", "TURNED_OVER"] }
        }
    });

    const inspections14Days = await prisma.inspection.count({
        where: {
            projectId: params.projectId,
            windowStart: { lte: new Date(Date.now() + 14 * 24 * 3600 * 1000) }
        }
    });

    const submittalsAwaitingReturn = await prisma.submittal.count({
        where: { projectId: params.projectId, status: "SUBMITTED" }
    });

    return NextResponse.json({
        ...p,
        stats: {
            openRisks,
            missedReleases: missedReleasesCount,
            inspections14Days,
            submittalsAwaitingReturn
        }
    });
}

export async function PATCH(req: Request, { params }: { params: { projectId: string } }) {
    try {
        const body = await req.json();
        const { name, ahj, mode } = body;

        const updated = await prisma.project.update({
            where: { id: params.projectId },
            data: {
                ...(name && { name }),
                ...(ahj && { ahj }),
                ...(mode && { mode })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Failed to update project settings:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
