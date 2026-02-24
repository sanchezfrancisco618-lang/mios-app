import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { projectId: string; submittalId: string } }) {
    try {
        const body = await request.json();
        const { status } = body;

        const submittal = await prisma.submittal.update({
            where: { id: params.submittalId },
            data: { status }
        });

        return NextResponse.json(submittal);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update submittal" }, { status: 500 });
    }
}
