"use client";

import { useAppStore } from "@/lib/store";
import { DocumentUploadPanel } from "@/components/shared/DocumentUploadPanel";

export default function RfisPage() {
    const { project } = useAppStore();

    if (!project) return null;

    return (
        <div className="flex flex-col h-full w-full bg-background-dark p-6 space-y-6">
            <div className="shrink-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">Requests for Information (RFIs)</h1>
                <p className="text-sm text-slate-400">Manage, generate, and auto-verify design queries.</p>
            </div>
            <div className="flex-1 overflow-hidden">
                <DocumentUploadPanel documentType="rfis" />
            </div>
        </div>
    );
}
