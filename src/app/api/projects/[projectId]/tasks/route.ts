import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

const schema = z.object({
    taskName: z.string(),
    taskCode: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    status: z.string().default('NOT_STARTED'),
    equipmentId: z.string().nullable().optional(),
    isControlsMilestone: z.boolean().default(false),
    controlGateType: z.string().nullable().optional()
});

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const tasks = await prisma.scheduleTask.findMany({
        where: { projectId: params.projectId },
        include: {
            equipment: true,
            predecessors: { include: { predecessor: true } },
            successors: { include: { successor: true } }
        },
        orderBy: { startDate: 'asc' }
    });

    return NextResponse.json(tasks);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const parsed = schema.parse(body);

    const newTask = await prisma.scheduleTask.create({
        data: {
            projectId: params.projectId,
            taskName: parsed.taskName,
            taskCode: parsed.taskCode,
            startDate: new Date(parsed.startDate),
            endDate: new Date(parsed.endDate),
            status: parsed.status,
            equipmentId: parsed.equipmentId,
            isControlsMilestone: parsed.isControlsMilestone,
            controlGateType: parsed.controlGateType
        }
    });

    // If this task is linked to equipment, re-eval risks since schedule changed
    if (parsed.equipmentId) {
        const { riskEngine } = await import('@/server/services/dbLogic');
        await riskEngine(params.projectId);
    }

    return NextResponse.json(newTask, { status: 201 });
}
