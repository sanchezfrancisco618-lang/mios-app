import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { mockSubmittalParser } from '@/server/services/mockSubmittalParser';
import { createEventLog } from '@/server/services/dbLogic';

export async function POST(req: Request, { params }: { params: { projectId: string, submittalId: string } }) {
    const submittal = await prisma.submittal.findUnique({
        where: { id: params.submittalId, projectId: params.projectId }
    });

    if (!submittal) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Call the mock parser to populate Requirements and Deviations
    const results = await mockSubmittalParser(params.submittalId);

    await createEventLog(params.projectId, "system", "SUBMITTAL_PARSED_PHASE7", "Submittal", params.submittalId, results);

    // Return updated submittal payload
    const updated = await prisma.submittal.findUnique({
        where: { id: params.submittalId },
        include: { requirements: true, deviations: true }
    });

    return NextResponse.json(updated, { status: 200 });
}
