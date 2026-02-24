"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, FileLock2, Search, Zap, Construction, ShieldCheck, ScanLine } from "lucide-react";

export interface UploadedFile {
    id: string;
    name: string;
    type: string;
    date: string;
    status: "idle" | "scanning" | "compliant" | "issues";
    aiReport?: any;
}

interface DocumentUploadPanelProps {
    documentType: "specs" | "drawings" | "submittals" | "rfis";
    initialDocuments?: UploadedFile[];
}

export function DocumentUploadPanel({ documentType, initialDocuments = [] }: DocumentUploadPanelProps) {
    const [documents, setDocuments] = useState<UploadedFile[]>(initialDocuments);
    const [selectedDoc, setSelectedDoc] = useState<UploadedFile | null>(null);

    // Simulate the automatic OCR and Verification pipeline
    const handleUploadSimulate = () => {
        const newDoc: UploadedFile = {
            id: Math.random().toString(36).substring(7),
            name: `SIMULATED-${documentType.toUpperCase()}-UPLOAD.pdf`,
            type: documentType,
            date: new Date().toLocaleDateString(),
            status: "scanning"
        };

        setDocuments(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);

        // Simulate AI Pipeline Delay
        setTimeout(() => {
            setDocuments(prev => prev.map(d => {
                if (d.id === newDoc.id) {
                    return {
                        ...d,
                        status: "issues",
                        aiReport: {
                            persona: "Senior MEP Project Manager (DMV Region Expert)",
                            summary: "I've reviewed this mock document. Some issues were detected based on simulated rules.",
                            checkedAgainst: ["2024-DMV-HVAC-Mechanical-Specs-Div23.pdf"],
                            matches: [
                                "Basic formatting looks correct.",
                            ],
                            deviations: [
                                "Simulated Deviation: Missing required signature block.",
                            ]
                        }
                    };
                }
                return d;
            }));

            // Re-select to update the AI panel view
            setSelectedDoc(prev => ({ ...prev, status: "issues" } as UploadedFile));
        }, 3500); // 3.5s "scanning" time
    };

    // Auto-update selectedDoc when its status changes in the main array
    useEffect(() => {
        if (selectedDoc) {
            const updated = documents.find(d => d.id === selectedDoc.id);
            if (updated && updated.status !== selectedDoc.status) {
                setSelectedDoc(updated);
            }
        }
    }, [documents, selectedDoc]);

    return (
        <div className="flex h-full w-full overflow-hidden bg-background-dark font-display text-slate-100 rounded-xl border border-white/10">
            {/* Main Documents Workspace */}
            <div className="flex-1 flex flex-col h-full border-r border-white/10 relative">
                {/* Dropzone & List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Simulated Upload Area */}
                    <div
                        onClick={handleUploadSimulate}
                        className="w-full rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
                    >
                        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-200">Drag & Drop Documents Here</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Click here to simulate uploading a file. The AI will immediately OCR, learn, and cross-reference it.
                        </p>
                    </div>

                    {/* Document List */}
                    <div className="space-y-3">
                        {documents.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 text-sm font-semibold">No documents uploaded in this category yet.</div>
                        ) : (
                            documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    onClick={() => setSelectedDoc(doc)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${selectedDoc?.id === doc.id
                                        ? "border-primary/50 bg-primary/10"
                                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.06]"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${doc.status === "scanning" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                                            doc.status === "issues" ? "bg-red-500/20 text-red-400" :
                                                "bg-white/10 text-slate-300"
                                            }`}>
                                            {doc.status === "scanning" ? <Search className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{doc.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Uploaded {doc.date}</p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    {doc.status === "scanning" && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                            <Zap className="h-3 w-3" /> Auto-Verifying...
                                        </span>
                                    )}
                                    {doc.status === "issues" && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            <AlertTriangle className="h-3 w-3" /> Issues Found
                                        </span>
                                    )}
                                    {doc.status === "idle" && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            <FileLock2 className="h-3 w-3" /> Learned
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: AI Verification Panel */}
            <div className="w-[350px] shrink-0 bg-surface-dark flex flex-col h-full overflow-y-auto">
                <div className="p-6 border-b border-white/10 bg-primary/5">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-1">
                        <ShieldCheck className="h-4 w-4" />
                        AI Verification Engine
                    </div>
                    <h2 className="text-lg font-extrabold text-white">Document Analysis</h2>
                </div>

                {!selectedDoc ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <ScanLine className="h-12 w-12 text-white/10 mb-4" />
                        <p className="text-sm font-medium">Select a document to view its AI Verification Report or Compliance Data.</p>
                    </div>
                ) : selectedDoc.status === "scanning" ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="relative size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                            <Search className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">OCRing & Learning Document...</h3>
                        <p className="text-sm text-slate-400 max-w-[250px] mx-auto">
                            The Senior PM AI is reading <span className="text-slate-200 font-semibold">{selectedDoc.name}</span> and cross-referencing it against DMV building codes, uploaded specs, and drawings.
                        </p>
                    </div>
                ) : selectedDoc.aiReport ? (
                    <div className="flex-1 p-6 space-y-6">

                        {/* Persona Introduction */}
                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                <Construction className="h-16 w-16 text-primary" />
                            </div>
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                                <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest">{selectedDoc.aiReport.persona}</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed relative z-10">
                                "{selectedDoc.aiReport.summary}"
                            </p>
                        </div>

                        {/* Checked Against */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Cross-Referenced Against</h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedDoc.aiReport.checkedAgainst.map((file: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs font-medium text-slate-300 flex items-center gap-1.5">
                                        <FileLock2 className="h-3 w-3 text-slate-500" />
                                        {file}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Deviations */}
                        {selectedDoc.aiReport.deviations.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="h-4 w-4" />
                                    Critical Deviations (Action Required)
                                </h4>
                                {selectedDoc.aiReport.deviations.map((dev: string, i: number) => (
                                    <div key={i} className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg flex items-start gap-3">
                                        <div className="mt-0.5 size-4 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold">!</span>
                                        </div>
                                        <p className="text-sm text-slate-200 leading-relaxed font-semibold">
                                            {dev}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Matches */}
                        {selectedDoc.aiReport.matches.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-accent-teal uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Verified Compliant Items
                                </h4>
                                <ul className="space-y-2">
                                    {selectedDoc.aiReport.matches.map((match: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                                            <span className="text-accent-teal mt-0.5">✓</span>
                                            {match}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <button className="w-full py-3 rounded-lg bg-red-500 text-white font-bold shadow-[0_5px_15px_-3px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-transform">
                                Reject Document
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 p-8 text-center">
                        <p className="text-sm text-slate-400">File is uploaded and learned. Ready for extraction or queries.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
