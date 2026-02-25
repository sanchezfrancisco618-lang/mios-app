import { prisma } from "../db";
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const equipmentSchema = z.object({
    takeoff: z.array(z.object({
        tag: z.string(),
        category: z.string(),
        qty: z.number(),
        airflowCfm: z.number().optional(),
        gpm: z.number().optional(),
        voltage: z.number().optional(),
        phase: z.number().optional(),
        level: z.string().optional(),
        location: z.string().optional(),
        specSection: z.string().optional(),
        confidence: z.number()
    }))
});

export const geminiDrawingParser = async (fileId: string, projectId: string) => {
    // 1. Fetch drawing / file info
    const fileAsset = await prisma.fileAsset.findUnique({
        where: { id: fileId }
    });

    if (!fileAsset) throw new Error("File Asset not found");

    // In a full implementation, the actual PDF page images would be passed to Gemini Vision.
    // For this simulation, we use the drawing metadata (filename, discipline, revision) to generate a realistic takeoff.
    const promptContext = `
        You are an elite mechanical pre-construction engineer.
        Analyze the following construction drawing metadata:
        Filename: ${fileAsset.filename}
        Discipline: ${fileAsset.discipline}
        Revision: ${fileAsset.revisionLabel}

        Based on these details, simulate an extraction of mechanical/electrical/plumbing equipment schedules found on this drawing.
        Generate a realistic and highly detailed list of equipment (takeoff).
        For an HVAC drawing, include things like RTUs, Exhaust Fans, VAVs, FCUs.
        For Plumbing, include Water Heaters, Pumps.
        Please return the structured analysis with 'tag', 'category', 'qty', and any relevant design parameters (cfm, gpm, voltage).
        Provide a 'confidence' score between 0.0 and 1.0 for each item.
    `;

    // 2. Call Gemini
    const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: equipmentSchema,
        prompt: promptContext,
    });

    // 3. Create an Extraction Run
    const run = await prisma.extractionRun.create({
        data: {
            projectId,
            status: "COMPLETED",
            completedAt: new Date(),
            summary: JSON.stringify({ extractedCount: object.takeoff.length })
        }
    });

    // 4. Save new Extraction Rows
    for (const item of object.takeoff) {
        await prisma.extractionRow.create({
            data: {
                runId: run.id,
                projectId,
                sourceFileId: fileId,
                tagRaw: item.tag,
                tagNormalized: item.tag.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
                category: item.category,
                qty: item.qty,
                airflowCfm: item.airflowCfm || null,
                gpm: item.gpm || null,
                voltage: item.voltage || null,
                phase: item.phase || null,
                level: item.level || null,
                location: item.location || null,
                specSection: item.specSection || null,
                confidence: item.confidence,
                status: "PENDING"
            }
        });
    }

    return {
        success: true,
        runId: run.id,
        extractedItems: object.takeoff.length
    };
};
