import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

const schema = z.object({
    rowIds: z.array(z.string())
});

export async function POST(req: Request, { params }: { params: { runId: string } }) {
    const body = await req.json();
    const { rowIds } = schema.parse(body);

    await prisma.extractionRow.updateMany({
        where: {
            id: { in: rowIds },
            runId: params.runId
        },
        data: { status: "REJECTED" }
    });

    return NextResponse.json({ success: true, count: rowIds.length });
}
