import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const rfis = await prisma.rfi.findMany({
        where: { projectId: params.projectId },
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(rfis);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const rfi = await prisma.rfi.create({
        data: {
            projectId: params.projectId,
            number: body.number,
            subject: body.subject,
            question: body.question,
            status: "OPEN"
        }
    });
    return NextResponse.json(rfi, { status: 201 });
}
