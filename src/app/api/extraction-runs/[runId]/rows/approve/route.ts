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
        data: { status: "APPROVED" }
    });

    // Since we don't know the exact project ID directly from runId simply without a query, 
    // we do a quick fetch
    const run = await prisma.extractionRun.findUnique({ where: { id: params.runId } });
    if (run) {
        await prisma.eventLog.create({
            data: {
                projectId: run.projectId, actor: "system", eventType: "ROWS_APPROVED",
                entityType: "ExtractionRun", entityId: run.id, payload: JSON.stringify({ count: rowIds.length })
            }
        });
    }

    return NextResponse.json({ success: true, count: rowIds.length });
}
