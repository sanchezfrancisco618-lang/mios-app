"use client";

import { useAppStore } from "@/lib/store";
import { DocumentUploadPanel } from "@/components/shared/DocumentUploadPanel";

export default function SpecsPage() {
    const { project } = useAppStore();

    if (!project) return null;

    return (
        <div className="flex flex-col h-full w-full bg-background-dark p-6 space-y-6">
            <div className="shrink-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">Specifications</h1>
                <p className="text-sm text-slate-400">Upload and verify project spec books to auto-extract compliance rules.</p>
            </div>
            <div className="flex-1 overflow-hidden">
                <DocumentUploadPanel
                    documentType="specs"
                    initialDocuments={[
                        { id: "1", name: "2024-DMV-HVAC-Mechanical-Specs-Div23.pdf", type: "specs", date: "Oct 12, 2023", status: "idle" },
                        { id: "2", name: "Plumbing-Code-Requirements-Div22.pdf", type: "specs", date: "Oct 12, 2023", status: "idle" }
                    ]}
                />
            </div>
        </div>
    );
}
