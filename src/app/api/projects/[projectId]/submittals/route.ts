import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

const schema = z.object({
    number: z.string(),
    title: z.string(),
    trade: z.string(),
    status: z.string().default("DRAFT"),
    revision: z.string().default("0"),
    submittedOn: z.string().nullable().optional()
});

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const submittals = await prisma.submittal.findMany({
        where: { projectId: params.projectId },
        include: {
            requirements: true,
            deviations: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(submittals);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const parsed = schema.parse(body);

    const submittal = await prisma.submittal.create({
        data: {
            projectId: params.projectId,
            number: parsed.number,
            title: parsed.title,
            trade: parsed.trade,
            status: parsed.status,
            revision: parsed.revision,
            submittedOn: parsed.submittedOn ? new Date(parsed.submittedOn) : null
        },
        include: {
            requirements: true,
            deviations: true
        }
    });

    return NextResponse.json(submittal, { status: 201 });
}
