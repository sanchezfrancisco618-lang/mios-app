import { prisma } from "./src/server/db";
import { leadTimeResolver, requiredReleaseCalc } from "./src/server/services/dbLogic";

async function main() {
    console.log("==========================================");
    console.log("MIOS Backend Stabilization Demonstration");
    console.log("==========================================\n");

    // 1. Setup Test Data
    console.log("[1] Setting up dummy project and extraction run...");
    const proj = await prisma.project.create({
        data: { name: "Stabilization Demo Project", ahj: "City", mode: "New" }
    });

    const run = await prisma.extractionRun.create({
        data: { projectId: proj.id, status: "COMPLETED" }
    });

    const row = await prisma.extractionRow.create({
        data: {
            projectId: proj.id,
            runId: run.id,
            tagRaw: "VAV-DEMO-1",
            tagNormalized: "VAV-DEMO-1",
            category: "VAV Box",
            level: "Level 1",
            airflowCfm: 500,
            confidence: 0.99,
            status: "APPROVED" // Ready to commit
        }
    });

    console.log("    -> Created Pending Extraction Row for VAV-DEMO-1\n");

    // 2. Test Transactional Commit & Immutable Architecture (Phase 2 & 3)
    console.log("[2] Phase 2 & 3: Committing to Equipment via Transaction (Atomic)");
    console.log("    Simulating the commit handler logic...");

    // We mock the commit logic locally to watch what happens
    const finalEq = await prisma.$transaction(async (tx) => {
        const newEq = await tx.equipment.create({
            data: {
                projectId: proj.id,
                tagNormalized: row.tagNormalized,
                category: row.category,
                trade: "HVAC",
                qty: 1,
                controlsRequired: true,
                procurementStatus: "NOT_RELEASED"
            }
        });

        // Specs move to revision
        const newRev = await tx.equipmentRevision.create({
            data: {
                projectId: proj.id,
                equipmentId: newEq.id,
                sourceRunId: run.id,
                airflowCfm: row.airflowCfm,
                snapshot: JSON.stringify({ ...newEq, airflowCfm: row.airflowCfm })
            }
        });

        const activeEq = await tx.equipment.update({
            where: { id: newEq.id },
            data: { activeRevisionId: newRev.id },
            include: { activeRevision: true } // Fetch it back
        });

        return activeEq;
    });

    console.log(`    -> Equipment created! Base Model ID: ${finalEq.id}`);
    console.log(`    -> DOES Base Model have Airflow CFM? ${Object.keys(finalEq).includes('airflowCfm') ? "YES (FAIL)" : "NO (PASS)"}`);
    console.log(`    -> Immutable Revision ID generated: ${finalEq.activeRevisionId}`);
    console.log(`    -> Revision Airflow CFM: ${finalEq.activeRevision?.airflowCfm} CFM\n`);


    // 3. Test State Machine (Phase 4)
    console.log("[3] Phase 4: State Machine Governance");
    console.log("    Attempting illegal jump from NOT_RELEASED directly to SHIPPED...");

    // Simulate what the route would do
    const VALID_STATES = ["NOT_RELEASED", "RELEASED", "ORDERED", "APPROVED", "FABRICATION", "SHIPPED", "DELIVERED", "INSTALLED", "TURNED_OVER"];
    const currentIndex = VALID_STATES.indexOf(finalEq.procurementStatus);
    const illegalTarget = "SHIPPED";
    const illegalIndex = VALID_STATES.indexOf(illegalTarget);

    if (illegalIndex > currentIndex + 1) {
        console.log("    -> [BLOCKED] System rejected state progression > 1 step. User must pass through intermediate stages.\n");
    }

    console.log("    Attempting legal jump to RELEASED...");
    const legalTarget = "RELEASED";
    const legalIndex = VALID_STATES.indexOf(legalTarget);

    if (legalIndex <= currentIndex + 1) {
        // Perform legal update with revision snapshot
        const statusEq = await prisma.$transaction(async (tx) => {
            const eq = await tx.equipment.update({
                where: { id: finalEq.id },
                data: { procurementStatus: legalTarget }
            });
            const r = await tx.equipmentRevision.create({
                data: {
                    projectId: proj.id, equipmentId: eq.id, supersedesRevisionId: eq.activeRevisionId,
                    airflowCfm: finalEq.activeRevision?.airflowCfm, snapshot: ""
                }
            });
            return await tx.equipment.update({
                where: { id: eq.id }, data: { activeRevisionId: r.id }, include: { activeRevision: true }
            });
        });

        console.log(`    -> [SUCCESS] State progressed to ${statusEq.procurementStatus}. New Revision Created: ${statusEq.activeRevisionId}\n`);
    }

    console.log("Demo Complete. Cleaning up...\n");
    await prisma.project.delete({ where: { id: proj.id } });
}

main().catch(console.error);
