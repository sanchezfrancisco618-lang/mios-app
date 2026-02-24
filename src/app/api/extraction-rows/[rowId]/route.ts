import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { tagNormalize } from '@/server/services/normalization';
import { z } from 'zod';

const schema = z.object({
    tagRaw: z.string().optional(),
    category: z.string().optional(),
    level: z.string().nullable().optional(),
    voltage: z.number().nullable().optional(),
    specSection: z.string().nullable().optional(),
    qty: z.number().nullable().optional()
});

export async function PATCH(req: Request, { params }: { params: { rowId: string } }) {
    const body = await req.json();
    const parsed = schema.parse(body);

    const dataToUpdate: any = { ...parsed };
    if (dataToUpdate.tagRaw) {
        dataToUpdate.tagNormalized = tagNormalize(dataToUpdate.tagRaw);
    }

    const updated = await prisma.extractionRow.update({
        where: { id: params.rowId },
        data: dataToUpdate
    });

    return NextResponse.json(updated);
}
