import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(
    request: Request,
    { params }: { params: { projectId: string; fileId: string; pageNumber: string } }
) {
    try {
        const pageNum = parseInt(params.pageNumber, 10);

        let drawingPage = await prisma.drawingPage.findFirst({
            where: {
                fileAssetId: params.fileId,
                pageNumber: pageNum
            }
        });

        if (!drawingPage) {
            return NextResponse.json([]);
        }

        const markups = await prisma.markup.findMany({
            where: { drawingPageId: drawingPage.id }
        });

        return NextResponse.json(markups);

    } catch (error) {
        console.error("Error fetching markups:", error);
        return NextResponse.json({ error: "Failed to fetch markups" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { projectId: string; fileId: string; pageNumber: string } }
) {
    try {
        const body = await request.json();
        const { type, geometry, color, strokeWidth } = body;
        const pageNum = parseInt(params.pageNumber, 10);

        // Ensure drawing page exists
        let drawingPage = await prisma.drawingPage.findFirst({
            where: { fileAssetId: params.fileId, pageNumber: pageNum }
        });

        if (!drawingPage) {
            drawingPage = await prisma.drawingPage.create({
                data: {
                    fileAssetId: params.fileId,
                    pageNumber: pageNum
                }
            });
        }

        const markup = await prisma.markup.create({
            data: {
                drawingPageId: drawingPage.id,
                type,
                geometry,
                color,
                strokeWidth
            }
        });

        return NextResponse.json(markup);

    } catch (error) {
        console.error("Error creating markup:", error);
        return NextResponse.json({ error: "Failed to create markup" }, { status: 500 });
    }
}
