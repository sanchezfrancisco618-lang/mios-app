import { prisma } from "../db";

export const mockSubmittalParser = async (submittalId: string) => {
    // deterministic mock dataset for submittal parsing
    const reqs = [
        { type: "SPECIFICATION", description: "Must include scroll compressors with R-410A refrigerant.", sourceRef: "Spec 23 74 13 - 2.1.A" },
        { type: "SCHEDULE", description: "Cooling capacity: 120,000 BTU/hr (10 Tons) at 95F ambient.", sourceRef: "M-601" },
        { type: "SPECIFICATION", description: "Unit shall have hail guards installed on condenser coils.", sourceRef: "Spec 23 74 13 - 2.2.B" },
        { type: "DRAWING_NOTE", description: "Coordinate curb size with existing roof opening (curb adapter required).", sourceRef: "M-101 Note 3" }
    ];

    // Delete existing tracking to allow re-parsing
    await prisma.requirement.deleteMany({ where: { submittalId } });
    await prisma.submittalDeviation.deleteMany({ where: { submittalId } });

    // Seed mock requirements
    for (const r of reqs) {
        await prisma.requirement.create({
            data: {
                submittalId,
                type: r.type,
                description: r.description,
                sourceRef: r.sourceRef,
                isCompliant: true // Default to compliant until analysis proves otherwise
            }
        });
    }

    // Simulate an AI identifying a deviation
    // E.g., The submittal shows R-32, but spec requires R-410A.
    const deviation1 = await prisma.submittalDeviation.create({
        data: {
            submittalId,
            description: "Product data indicates R-32 refrigerant, but specification 23 74 13 - 2.1.A requires R-410A.",
            riskLevel: "HIGH",
            status: "OPEN"
        }
    });

    const deviation2 = await prisma.submittalDeviation.create({
        data: {
            submittalId,
            description: "No hail guards are listed in the provided accessories list.",
            riskLevel: "MEDIUM",
            status: "OPEN"
        }
    });

    // Mark corresponding requirements as non-compliant
    const spec1 = await prisma.requirement.findFirst({ where: { submittalId, description: "Must include scroll compressors with R-410A refrigerant." } });
    if (spec1) await prisma.requirement.update({ where: { id: spec1.id }, data: { isCompliant: false } });

    const spec2 = await prisma.requirement.findFirst({ where: { submittalId, description: "Unit shall have hail guards installed on condenser coils." } });
    if (spec2) await prisma.requirement.update({ where: { id: spec2.id }, data: { isCompliant: false } });

    // Update Submittal status flags
    await prisma.submittal.update({
        where: { id: submittalId },
        data: { isComplete: true, returnedOn: new Date() }
    });

    return { success: true, parsed: reqs.length, deviations: 2 };
};
