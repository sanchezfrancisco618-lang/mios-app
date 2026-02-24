import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const eq = await prisma.equipment.findMany({
        where: { projectId: params.projectId }
    });
    return NextResponse.json(eq);
}
