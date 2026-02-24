import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { z } from 'zod';

export async function GET() {
    const projects = await prisma.project.findMany();
    return NextResponse.json(projects);
}

export async function POST(req: Request) {
    const body = await req.json();
    const schema = z.object({
        name: z.string(),
        ahj: z.string(),
        mode: z.string(),
        scope_hvac: z.boolean().default(false),
        scope_plumbing: z.boolean().default(false),
        scope_controls: z.boolean().default(false),
    });

    const parsed = schema.parse(body);
    const p = await prisma.project.create({ data: parsed });
    return NextResponse.json(p, { status: 201 });
}
