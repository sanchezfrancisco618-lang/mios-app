import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: Request, { params }: { params: { projectId: string; fileId: string } }) {
    try {
        await prisma.fileAsset.delete({
            where: { id: params.fileId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting file:", error);
        return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
    }
}
