import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function DELETE(
    request: Request,
    { params }: { params: { projectId: string; fileId: string; pageNumber: string; markupId: string } }
) {
    try {
        await prisma.markup.delete({
            where: { id: params.markupId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting markup:", error);
        return NextResponse.json({ error: "Failed to delete markup" }, { status: 500 });
    }
}
