import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

const schema = z.object({
    targetRowId: z.string(), // row to keep
    sourceRowIds: z.array(z.string()) // rows to merge into target and mark as MERGED
});

export async function POST(req: Request, { params }: { params: { runId: string } }) {
    const body = await req.json();
    const { targetRowId, sourceRowIds } = schema.parse(body);

    await prisma.extractionRow.updateMany({
        where: { id: { in: sourceRowIds }, runId: params.runId },
        data: {
            status: "MERGED",
            mergedIntoRowId: targetRowId
        }
    });

    const run = await prisma.extractionRun.findUnique({ where: { id: params.runId } });
    if (run) {
        await prisma.eventLog.create({
            data: {
                projectId: run.projectId, actor: "system", eventType: "ROWS_MERGED",
                entityType: "ExtractionRun", entityId: run.id, payload: JSON.stringify({ targetRowId, sourceRowIds })
            }
        });
    }

    return NextResponse.json({ success: true, mergedCount: sourceRowIds.length });
}
