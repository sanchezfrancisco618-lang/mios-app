import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { geminiExtractor } from '@/server/services/geminiExtractor';

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

    // Fire and forget the Gemini extractor so it doesn't block the API response
    geminiExtractor(run.id, params.projectId, fileIds).catch(console.error);

    return NextResponse.json(run, { status: 201 });
}
