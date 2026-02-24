import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { mockExtractor } from '@/server/services/mockExtractor';

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    // simulate extracting from latest files
    const files = await prisma.fileAsset.findMany({ where: { projectId: params.projectId } });
    const fileIds = files.map((f: { id: string }) => f.id);

    const run = await prisma.extractionRun.create({
        data: {
            projectId: params.projectId,
            status: "RUNNING",
        }
    });

    // fire and forget mock extractor (or await it for simplicity)
    await mockExtractor(run.id, params.projectId, fileIds);

    return NextResponse.json(run, { status: 201 });
}
