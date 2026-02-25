import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

// GET the calibration data for this specific page of the PDF
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
            return NextResponse.json(null);
        }

        return NextResponse.json(drawingPage);

    } catch (error) {
        console.error("Error fetching drawing page:", error);
        return NextResponse.json({ error: "Failed to fetch drawing page data" }, { status: 500 });
    }
}

// POST to upsert the calibration data
export async function POST(
    request: Request,
    { params }: { params: { projectId: string; fileId: string; pageNumber: string } }
) {
    try {
        const body = await request.json();
        const { scaleX, scaleY, unit, precision } = body;
        const pageNum = parseInt(params.pageNumber, 10);

        // Find existing to know if we're creating or updating
        let drawingPage = await prisma.drawingPage.findFirst({
            where: {
                fileAssetId: params.fileId,
                pageNumber: pageNum
            }
        });

        if (drawingPage) {
            // Update
            drawingPage = await prisma.drawingPage.update({
                where: { id: drawingPage.id },
                data: { scaleX, scaleY, unit, precision }
            });
        } else {
            // Create
            drawingPage = await prisma.drawingPage.create({
                data: {
                    fileAssetId: params.fileId,
                    pageNumber: pageNum,
                    scaleX,
                    scaleY,
                    unit,
                    precision
                }
            });
        }

        return NextResponse.json(drawingPage);

    } catch (error) {
        console.error("Error saving drawing page scale:", error);
        return NextResponse.json({ error: "Failed to save scale." }, { status: 500 });
    }
}
