import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const inspections = await prisma.inspection.findMany({
        where: { projectId: params.projectId },
        orderBy: { windowStart: 'asc' }
    });
    return NextResponse.json(inspections);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const inspection = await prisma.inspection.create({
        data: {
            projectId: params.projectId,
            name: body.name,
            ahj: body.ahj,
            trade: body.trade,
            windowStart: new Date(body.windowStart),
            windowEnd: new Date(body.windowEnd),
            status: body.status || "NOT_REQUESTED"
        }
    });
    return NextResponse.json(inspection, { status: 201 });
}
