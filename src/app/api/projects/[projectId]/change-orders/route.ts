import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const cos = await prisma.changeOrder.findMany({
        where: { projectId: params.projectId },
        orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(cos);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    const body = await req.json();
    const co = await prisma.changeOrder.create({
        data: {
            projectId: params.projectId,
            title: body.title,
            description: body.description,
            amount: parseFloat(body.amount),
            status: "PROPOSED"
        }
    });
    return NextResponse.json(co, { status: 201 });
}
