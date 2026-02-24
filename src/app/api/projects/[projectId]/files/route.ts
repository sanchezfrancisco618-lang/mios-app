import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { storageService } from '@/server/services/storage';

export async function GET(req: Request, { params }: { params: { projectId: string } }) {
    const files = await prisma.fileAsset.findMany({
        where: { projectId: params.projectId },
        orderBy: { uploadedAt: 'desc' }
    });
    return NextResponse.json(files);
}

export async function POST(req: Request, { params }: { params: { projectId: string } }) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const discipline = formData.get('discipline') as string || 'GENERAL';
        const revisionLabel = formData.get('revisionLabel') as string || 'Rev 0';
        const source = formData.get('source') as string || 'Manual Upload';

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert Web File to Node Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to Storage
        const { url, sha256 } = await storageService.uploadFile(buffer, file.name, params.projectId);

        // Check for exact duplicates in DB
        const existing = await prisma.fileAsset.findFirst({
            where: { projectId: params.projectId, sha256 }
        });

        if (existing) {
            // For phase 3A, if exact file was already uploaded, optionally reject or update its metadata. We will return 409 Conflict for now.
            return NextResponse.json({ error: "File exactly matching this content already exists in this project", file: existing }, { status: 409 });
        }

        // Identify Extension
        let fileType = "OTHER";
        if (file.name.toLowerCase().endsWith('.pdf')) fileType = "PDF";
        if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) fileType = "XLSX";

        // Save metadata to DB
        const fileAsset = await prisma.fileAsset.create({
            data: {
                projectId: params.projectId,
                filename: file.name,
                fileType,
                discipline,
                revisionLabel,
                source,
                url,
                sha256
            }
        });

        return NextResponse.json(fileAsset, { status: 201 });
    } catch (error) {
        console.error("File upload failed:", error);
        return NextResponse.json({ error: "File upload failed" }, { status: 500 });
    }
}
