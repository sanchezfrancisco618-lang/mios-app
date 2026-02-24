import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: Request, { params }: { params: { runId: string } }) {
    const rows = await prisma.extractionRow.findMany({
        where: { runId: params.runId }
    });
    return NextResponse.json(rows);
}
