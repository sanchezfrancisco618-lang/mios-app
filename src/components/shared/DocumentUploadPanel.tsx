"use client";

import { useState, useCallback, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { UploadCloud, FileText, CheckCircle2, ShieldCheck, ScanLine, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    const { activeProjectId, initData } = useAppStore();
    const [documents, setDocuments] = useState<UploadedFile[]>(initialDocuments);
    const [selectedDoc, setSelectedDoc] = useState<UploadedFile | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [number, setNumber] = useState("");
    const [trade, setTrade] = useState("Multiple");
    const [revision, setRevision] = useState("0");

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            setPendingFile(file);
            setTitle(file.name.replace(/\.[^/.]+$/, "")); // default to filename without extension
            setNumber(`DOC-${Math.floor(Math.random() * 1000)}`);
            setIsUploadModalOpen(true);
        }
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsHovering(false);
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setPendingFile(file);
            setTitle(file.name.replace(/\.[^/.]+$/, "")); // default to filename without extension
            setNumber(`DOC-${Math.floor(Math.random() * 1000)}`);
            setIsUploadModalOpen(true);
            // Reset input value to allow selecting the same file again if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const handleActualUpload = async () => {
        if (!activeProjectId || !pendingFile) return;
        setIsUploading(true);

        try {
            let realId = Math.random().toString(36).substring(7);

            if (documentType === "submittals") {
                // Post to submittals API
                const res = await fetch(`/api/projects/${activeProjectId}/submittals`, {
                    method: 'POST',
                    body: JSON.stringify({ title, number, trade, status: "SUBMITTED", revision }),
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    realId = data.id;
                }
            } else {
                // For specs/drawings/rfis post to files API
                const formData = new FormData();
                formData.append("file", pendingFile);
                formData.append("discipline", trade);
                formData.append("revisionLabel", revision);

                const res = await fetch(`/api/projects/${activeProjectId}/files`, {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json();
                    realId = data.id;
                }
            }

            // Refresh application state
            await initData();

            // Add a placeholder to local list so user sees immediate feedback
            const newDoc: UploadedFile = {
                id: realId,
                name: pendingFile.name,
                type: documentType,
                date: new Date().toLocaleDateString(),
                status: "idle"
            };
            setDocuments(prev => [newDoc, ...prev]);

            // Reset modal
            setIsUploadModalOpen(false);
            setPendingFile(null);
        } catch (error) {
            console.error("Failed to upload document:", error);
            alert("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const runExplicitAIAnalysis = async () => {
        if (!selectedDoc || !activeProjectId) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            let endpoint = "";
            if (documentType === "submittals") {
                endpoint = `/api/projects/${activeProjectId}/submittals/${selectedDoc.id}/parse`;
            } else {
                // Future expansion for drawing/spec parsing
                alert(`AI Analysis for ${documentType} requires a specific module configuration. (Simulation mode for now)`);
                setTimeout(() => {
                    setAnalysisResult({
                        message: "Document analyzed successfully (Simulation).",
                        details: "No critical deviations found in this file type."
                    });
                    setIsAnalyzing(false);
                }, 2000);
                return;
            }

            const res = await fetch(endpoint, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setAnalysisResult(data);

                // Update doc status locally
                setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, status: 'compliant' } : d));
                setSelectedDoc(prev => prev ? { ...prev, status: 'compliant' } : null);
            } else {
                alert("AI Analysis failed. Please check the server logs.");
            }
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const deleteDocument = async (e: React.MouseEvent, docId: string) => {
        e.stopPropagation();
        if (!activeProjectId) return;
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            const endpoint = documentType === "submittals"
                ? `/api/projects/${activeProjectId}/submittals/${docId}`
                : `/api/projects/${activeProjectId}/files/${docId}`;

            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
                setDocuments(prev => prev.filter(d => d.id !== docId));
                if (selectedDoc?.id === docId) setSelectedDoc(null);
                await initData(); // sync global store
            } else {
                alert("Failed to delete the document.");
            }
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden bg-background-dark font-display text-slate-100 rounded-xl border border-white/10 relative">

            {/* Main Documents Workspace */}
            <div className="flex-1 flex flex-col h-full border-r border-white/10 relative">
                {/* Dropzone & List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Real Drag & Drop Area */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={`w-full rounded-2xl border-2 border-dashed transition-colors p-8 flex flex-col items-center justify-center text-center cursor-pointer group ${isHovering ? "border-primary bg-primary/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                            }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <div className={`size-12 rounded-full flex items-center justify-center mb-3 transition-transform ${isHovering ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary group-hover:scale-110"
                            }`}>
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-200">Click or Drag & Drop Documents Here</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Drop a PDF file here or click to safely upload it and add it to the database.
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
                                        <div className="p-2 rounded-lg bg-white/10 text-slate-300">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-200">{doc.name}</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Uploaded {doc.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-slate-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            <CheckCircle2 className="h-3 w-3" /> Saved
                                        </span>
                                        <button
                                            onClick={(e) => deleteDocument(e, doc.id)}
                                            className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                                            title="Delete Document"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Document Details Panel */}
            <div className="w-[350px] shrink-0 bg-surface-dark flex flex-col h-full overflow-y-auto">
                <div className="p-6 border-b border-white/10 bg-primary/5">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-1">
                        <ShieldCheck className="h-4 w-4" />
                        Document Details
                    </div>
                    <h2 className="text-lg font-extrabold text-white">Metadata & Actions</h2>
                </div>

                {!selectedDoc ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                        <ScanLine className="h-12 w-12 text-white/10 mb-4" />
                        <p className="text-sm font-medium">Select a document to view its details or trigger AI analysis.</p>
                    </div>
                ) : (
                    <div className="flex-1 p-6 space-y-6">
                        <div className="space-y-2 text-sm text-slate-300">
                            <p><strong className="text-slate-400">Filename:</strong> {selectedDoc.name}</p>
                            <p><strong className="text-slate-400">Date:</strong> {selectedDoc.date}</p>
                            <p><strong className="text-slate-400">Status:</strong> SECURELY STORED</p>
                            {selectedDoc.status === 'compliant' && (
                                <p className="text-green-400 flex items-center gap-1 mt-2">
                                    <CheckCircle2 className="h-4 w-4" /> AI Analysis Completed
                                </p>
                            )}
                        </div>
                        {analysisResult && (
                            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-sm text-slate-200">
                                <p className="font-bold mb-2">Analysis Results:</p>
                                {analysisResult.message ? (
                                    <p>{analysisResult.message}</p>
                                ) : (
                                    <p>Found {analysisResult.requirements?.length || 0} requirements and {analysisResult.deviations?.length || 0} deviations.</p>
                                )}
                            </div>
                        )}
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <p className="text-xs text-slate-400">AI Analysis is strictly opt-in. Click below when you are ready to parse this document.</p>
                            <Button
                                onClick={runExplicitAIAnalysis}
                                disabled={isAnalyzing || selectedDoc.status === 'compliant'}
                                className="w-full gap-2 bg-primary hover:bg-primary/90"
                            >
                                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                                {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal overlay */}
            {isUploadModalOpen && pendingFile && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg border border-border shadow-2xl rounded-lg flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <UploadCloud className="h-5 w-5 text-primary" />
                                    Upload Document
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1 text-slate-400">Complete metadata for: <span className="text-slate-200 font-semibold">{pendingFile.name}</span></p>
                            </div>
                            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="h-8 px-2"><X className="h-4 w-4" /></Button>
                        </div>
                        <div className="p-6 space-y-4">
                            {documentType === "submittals" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Submittal Number</label>
                                    <input
                                        type="text"
                                        value={number}
                                        onChange={(e) => setNumber(e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Title / Description</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Discipline / Trade</label>
                                    <select
                                        value={trade}
                                        onChange={(e) => setTrade(e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="Multiple">Multiple</option>
                                        <option value="HVAC">HVAC</option>
                                        <option value="Plumbing">Plumbing</option>
                                        <option value="Electrical">Electrical</option>
                                        <option value="Controls">Controls</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Revision</label>
                                    <input
                                        type="text"
                                        value={revision}
                                        onChange={(e) => setRevision(e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20 rounded-b-lg">
                            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleActualUpload} disabled={isUploading} className="bg-primary hover:bg-primary/90 text-white min-w-[100px]">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Document"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
