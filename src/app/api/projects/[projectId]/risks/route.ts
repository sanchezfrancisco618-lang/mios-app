import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

const schema = z.object({
    severity: z.string(),
    category: z.string(),
    trigger: z.string(),
    owner: z.string().optional(),
    equipmentId: z.string().optional()
});

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const risks = await prisma.risk.findMany({
        where: { projectId: params.projectId }
    });
    return NextResponse.json(risks);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const parsed = schema.parse(body);

    const risk = await prisma.risk.create({
        data: {
            projectId: params.projectId,
            severity: parsed.severity,
            category: parsed.category,
            trigger: parsed.trigger,
            status: "OPEN",
            owner: parsed.owner,
            equipmentId: parsed.equipmentId
        }
    });

    return NextResponse.json(risk, { status: 201 });
}
