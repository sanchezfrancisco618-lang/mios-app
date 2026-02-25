import { prisma } from "../db";
import { tagNormalize } from "./normalization";
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const extractionSchema = z.object({
    equipment: z.array(z.object({
        tagRaw: z.string(),
        category: z.string(),
        level: z.string().optional(),
        location: z.string().optional(),
        cfm: z.number().optional(),
        gpm: z.number().optional(),
        voltage: z.number().optional(),
        phase: z.number().optional(),
        specSection: z.string().optional(),
        confidence: z.number().min(0).max(1)
    }))
});

export const geminiExtractor = async (runId: string, projectId: string, fileIds: string[]) => {
    // In a real implementation, you would download the PDF/images for `fileIds` from Firebase/Vercel Blob 
    // and pass the Buffer/Base64 to Gemini's multi-modal endpoint.
    // For this demonstration step without attached PDFs, we pass a simulated context prompt.
    const promptContext = `
        Analyze the provided construction file context (simulated).
        Extract all HVAC and plumbing equipment schedules you can find.
        For each piece of equipment, extract its tag, category, location, and technical parameters like CFM/Voltage.
        Assign a confidence score between 0.0 and 1.0 based on how clear the text is.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-2.5-flash'),
            schema: extractionSchema,
            prompt: promptContext,
        });

        for (const m of object.equipment) {
            const norm = tagNormalize(m.tagRaw);
            await prisma.extractionRow.create({
                data: {
                    runId,
                    projectId,
                    sourceFileId: fileIds.length > 0 ? fileIds[0] : null,
                    tagRaw: m.tagRaw,
                    tagNormalized: norm,
                    category: m.category,
                    level: m.level || null,
                    location: m.location || null,
                    qty: 1,
                    airflowCfm: m.cfm || null,
                    gpm: m.gpm || null,
                    voltage: m.voltage || null,
                    phase: m.phase || null,
                    specSection: m.specSection || null,
                    confidence: m.confidence,
                    status: "PENDING",
                    pageNumber: 1,
                    boundingBox: JSON.stringify({ x: 0, y: 0, w: 0, h: 0 }),
                    snippetUrl: "/placeholder-snippet.jpg"
                }
            });
        }

        const lowConfidenceCount = object.equipment.filter(m => m.confidence < 0.85).length;

        await prisma.extractionRun.update({
            where: { id: runId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                summary: JSON.stringify({ detected: object.equipment.length, lowConfidence: lowConfidenceCount })
            }
        });

    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        await prisma.extractionRun.update({
            where: { id: runId },
            data: { status: "FAILED", completedAt: new Date() }
        });
    }
};
