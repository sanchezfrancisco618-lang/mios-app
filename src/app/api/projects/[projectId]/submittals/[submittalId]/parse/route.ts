import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { geminiSubmittalParser } from '@/server/services/geminiSubmittalParser';
import { createEventLog } from '@/server/services/dbLogic';

export async function POST(req: Request, { params }: { params: { projectId: string, submittalId: string } }) {
    const submittal = await prisma.submittal.findUnique({
        where: { id: params.submittalId, projectId: params.projectId }
    });

    if (!submittal) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Call the real Google Gemini parser to analyze the submittal
    const results = await geminiSubmittalParser(params.submittalId);

    await createEventLog(params.projectId, "system", "SUBMITTAL_PARSED_PHASE7", "Submittal", params.submittalId, results);

    // Return updated submittal payload
    const updated = await prisma.submittal.findUnique({
        where: { id: params.submittalId },
        include: { requirements: true, deviations: true }
    });

    return NextResponse.json(updated, { status: 200 });
}
