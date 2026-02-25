import { prisma } from "../db";
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const analysisSchema = z.object({
    requirements: z.array(z.object({
        type: z.enum(["SPECIFICATION", "SCHEDULE", "DRAWING_NOTE"]),
        description: z.string(),
        sourceRef: z.string().optional(),
        isCompliant: z.boolean()
    })),
    deviations: z.array(z.object({
        description: z.string(),
        riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"])
    }))
});

export const geminiSubmittalParser = async (submittalId: string) => {
    // 1. Fetch submittal info
    const submittal = await prisma.submittal.findUnique({
        where: { id: submittalId },
        include: { requirements: true, deviations: true }
    });

    if (!submittal) throw new Error("Submittal not found");

    // In a full implementation, you'd fetch the actual PDF text/images here from your Storage.
    // For this demonstration, we pass the metadata to Gemini to analyze.
    const promptContext = `
        Analyze the following construction submittal data:
        Title: ${submittal.title}
        Trade: ${submittal.trade}
        Revision: ${submittal.revision}

        Please extract the core technical requirements and identify any potential deviations or risks.
        Return the structured analysis.
    `;

    // 2. Call Gemini
    const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        schema: analysisSchema,
        prompt: promptContext,
    });

    // 3. Clear existing requirements/deviations to rewrite the analysis
    await prisma.requirement.deleteMany({ where: { submittalId } });
    await prisma.submittalDeviation.deleteMany({ where: { submittalId } });

    // 4. Save new Requirements
    for (const r of object.requirements) {
        await prisma.requirement.create({
            data: {
                submittalId,
                type: r.type,
                description: r.description,
                sourceRef: r.sourceRef || null,
                isCompliant: r.isCompliant
            }
        });
    }

    // 5. Save new Deviations
    for (const d of object.deviations) {
        await prisma.submittalDeviation.create({
            data: {
                submittalId,
                description: d.description,
                riskLevel: d.riskLevel,
                status: "OPEN"
            }
        });
    }

    // 6. Update Submittal status flags
    await prisma.submittal.update({
        where: { id: submittalId },
        data: {
            isComplete: true,
            returnedOn: new Date(),
            status: object.deviations.length > 0 ? "REVISE_RESUBMIT" : "APPROVED"
        }
    });

    return {
        success: true,
        parsed: object.requirements.length,
        deviations: object.deviations.length
    };
};
