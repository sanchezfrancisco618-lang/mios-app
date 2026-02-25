import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { geminiDrawingParser } from '@/server/services/geminiDrawingParser';
import { createEventLog } from '@/server/services/dbLogic';

export async function POST(req: Request, { params }: { params: { projectId: string, fileId: string } }) {
    try {
        const file = await prisma.fileAsset.findUnique({
            where: { id: params.fileId, projectId: params.projectId }
        });

        if (!file) return NextResponse.json({ message: "File not found" }, { status: 404 });

        // Call the Google Gemini parser to analyze the drawing file
        const results = await geminiDrawingParser(params.fileId, params.projectId);

        await createEventLog(params.projectId, "system", "DRAWING_PARSED_PHASE3B", "FileAsset", params.fileId, results);

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error("Failed to parse drawing:", error);
        return NextResponse.json({ message: "Internal server error during analysis" }, { status: 500 });
    }
}
