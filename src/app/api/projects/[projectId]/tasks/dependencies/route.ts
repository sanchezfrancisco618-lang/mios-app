import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

const schema = z.object({
    predecessorId: z.string(),
    successorId: z.string(),
    type: z.string().default("FS"),
    lagDays: z.number().default(0)
});

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = schema.parse(body);

    const dependency = await prisma.taskDependency.create({
        data: {
            predecessorId: parsed.predecessorId,
            successorId: parsed.successorId,
            type: parsed.type,
            lagDays: parsed.lagDays
        }
    });

    return NextResponse.json(dependency, { status: 201 });
}
