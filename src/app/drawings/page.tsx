"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { UploadCloud, FileImage, Search, Zap, ScanLine, Layers, CheckCircle2, ChevronLeft, ZoomIn, ZoomOut, Hand, MousePointer2, Type, Highlighter, Ruler, Hash, Square, Circle } from "lucide-react";
import { DocumentUploadPanel } from "@/components/shared/DocumentUploadPanel";
import { PdfViewerCanvas } from "@/components/shared/PdfViewerCanvas";
import { ExportMenu } from "@/components/shared/ExportMenu";

type TradeTab = "all" | "architectural" | "mechanical" | "plumbing" | "electrical";

interface Drawing {
    id: string;
    number: string;
    title: string;
    trade: TradeTab;
    rev: string;
    date: string;
    thumbnail: string;
}

export default function DrawingsPage() {
    const { project, files, activeProjectId } = useAppStore();
    const [activeTrade, setActiveTrade] = useState<TradeTab>("all");

    // View State: "grid" | "viewer"
    const [viewMode, setViewMode] = useState<"grid" | "viewer">("grid");
    const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);

    // Viewer Tools State (Bluebeam style)
    const [activeTool, setActiveTool] = useState<string>("select");

    // AI Toggle State in Viewer
    const [showAiTools, setShowAiTools] = useState(false);

    const [aiState, setAiState] = useState<"idle" | "scanning" | "results">("idle");
    const [takeoffResults, setTakeoffResults] = useState<any>(null);

    // Derive actual drawings from global store files
    const drawings: Drawing[] = files
        .filter(f => f.fileType === "PDF")
        .map(f => ({
            id: f.id,
            number: f.filename.replace(/\.[^/.]+$/, ""),
            title: f.filename,
            trade: (f.discipline?.toLowerCase() || "mechanical") as TradeTab,
            rev: f.revisionLabel || "Rev 0",
            date: new Date(f.uploadedAt).toLocaleDateString(),
            thumbnail: ""
        }));

    const filteredDrawings = activeTrade === "all" ? drawings : drawings.filter(d => d.trade === activeTrade);

    const openViewer = (drawing: Drawing) => {
        setSelectedDrawing(drawing);
        setViewMode("viewer");
        setShowAiTools(false);
        setAiState("idle");
        setTakeoffResults(null);
        setActiveTool("select");
    };

    const closeViewer = () => {
        setViewMode("grid");
        setSelectedDrawing(null);
        setShowAiTools(false);
    };

    const runAiTakeoff = () => {
        setAiState("scanning");
        setTimeout(() => {
            setAiState("results");
            setTakeoffResults({
                itemsFound: 112,
                confidence: "94%",
                categories: [
                    { name: "VAV Boxes", count: 45, sampleTags: ["VAV-1-1", "VAV-1-2", "..."] },
                    { name: "Supply Diffusers", count: 62, sampleTags: ["SD-1", "SD-2", "..."] },
                    { name: "Exhaust Fans", count: 5, sampleTags: ["EF-1", "EF-2", "..."] }
                ]
            });
        }, 3500);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark font-display text-slate-100">

            {/* conditional rendering based on viewMode */}
            {viewMode === "grid" ? (
                <>
                    {/* Left Trade Sidebar */}
                    <div className="w-64 border-r border-white/10 flex flex-col h-full bg-surface-dark shrink-0">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-sm font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" /> Drawings by Trade
                            </h2>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4">
                            <ul className="space-y-1 px-3">
                                {(["all", "architectural", "mechanical", "plumbing", "electrical"] as TradeTab[]).map(trade => (
                                    <li key={trade}>
                                        <button
                                            onClick={() => setActiveTrade(trade)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeTrade === trade
                                                ? "bg-primary/20 text-primary border border-primary/30"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                                }`}
                                        >
                                            {trade === "all" ? "All Sheets" : trade}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    {/* Main Drawing Grid */}
                    <div className="flex-1 flex flex-col h-full relative bg-background-dark">
                        <div className="px-6 py-6 border-b border-white/10 shrink-0 flex items-center justify-between z-10">
                            <div>
                                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1">Drawings Engine</h1>
                                <p className="text-sm text-slate-400">Auto-organized PDF sets powered by Vision AI for instant quantity takeoff.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <ExportMenu dataName="Drawings Log" />
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(37,89,244,0.3)] hover:bg-primary/90 transition-all">
                                    <UploadCloud className="h-4 w-4" /> Upload PDFs
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
                                {filteredDrawings.map(drawing => (
                                    <div
                                        key={drawing.id}
                                        onClick={() => openViewer(drawing)}
                                        className="group rounded-xl border border-white/10 bg-surface-dark hover:border-primary/50 hover:shadow-[0_0_20px_rgba(37,89,244,0.15)] transition-all cursor-pointer overflow-hidden flex flex-col"
                                    >
                                        <div className="h-40 w-full bg-white/5 border-b border-white/5 flex items-center justify-center relative overflow-hidden group-hover:bg-white/10 transition-colors">
                                            <FileImage className="h-12 w-12 text-slate-600 group-hover:text-primary/50 transition-colors" />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-extrabold text-white group-hover:text-primary transition-colors">{drawing.number}</h3>
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/10 text-slate-300">
                                                    {drawing.rev}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 font-medium truncate mb-3">{drawing.title}</p>
                                            <p className="text-xs text-slate-500 mt-auto">{drawing.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 border-t border-white/10 pt-8 w-full h-[400px]">
                                <DocumentUploadPanel documentType="drawings" />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* ---------------- VIEWER MODE ---------------- */
                <div className="flex-1 flex w-full h-full bg-slate-950">

                    {/* Bluebeam-style Left Markup Toolbar (replaces former top bar buttons) */}
                    <div className="w-16 bg-surface-dark border-r border-white/10 flex flex-col items-center py-4 gap-2 shrink-0 z-20 shadow-lg">
                        {/* Navigation / Base */}
                        <ToolbarButton icon={MousePointer2} tool="select" active={activeTool} setActive={setActiveTool} title="Select Tool (V)" />
                        <ToolbarButton icon={Hand} tool="pan" active={activeTool} setActive={setActiveTool} title="Pan Tool (H)" />

                        <div className="w-8 h-px bg-white/10 my-1"></div>

                        {/* Measurement & Counting */}
                        <ToolbarButton icon={Ruler} tool="measure" active={activeTool} setActive={setActiveTool} title="Measurement Tool (M) - Calibrate Scale" />
                        <ToolbarButton icon={Hash} tool="count" active={activeTool} setActive={setActiveTool} title="Manual Count Tool (C) - Click to drop pins" />

                        <div className="w-8 h-px bg-white/10 my-1"></div>

                        {/* Shapes & Annotations */}
                        <ToolbarButton icon={Square} tool="rectangle" active={activeTool} setActive={setActiveTool} title="Rectangle Tool (R)" />
                        <ToolbarButton icon={Circle} tool="ellipse" active={activeTool} setActive={setActiveTool} title="Ellipse Tool (E)" />
                        <ToolbarButton icon={Highlighter} tool="highlight" active={activeTool} setActive={setActiveTool} title="Highlighter (H)" />
                        <ToolbarButton icon={Type} tool="text" active={activeTool} setActive={setActiveTool} title="Text Box (T)" />
                    </div>

                    {/* Main PDF Canvas Area */}
                    <div className="flex-1 flex flex-col h-full relative">
                        {/* Viewer Toolbar */}
                        <div className="h-14 border-b border-white/10 bg-surface-dark flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
                            <div className="flex items-center gap-4">
                                <button onClick={closeViewer} className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10">
                                    <ChevronLeft className="h-4 w-4" /> Back to Set
                                </button>
                                <div className="h-6 w-px bg-white/10 mx-2"></div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-extrabold text-white leading-none">{selectedDrawing?.number}</span>
                                    <span className="text-[10px] text-slate-400 mt-0.5">{selectedDrawing?.title}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-black/40 rounded-lg border border-white/10 p-1 mr-4">
                                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><ZoomOut className="h-4 w-4" /></button>
                                    <span className="text-xs font-bold text-slate-300 px-3 w-16 text-center">100%</span>
                                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><ZoomIn className="h-4 w-4" /></button>
                                </div>

                                {/* AI Toggle Button */}
                                <button
                                    onClick={() => setShowAiTools(!showAiTools)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${showAiTools
                                        ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(37,89,244,0.4)]"
                                        : "bg-surface-dark text-primary border-primary/50 hover:bg-primary/10"
                                        }`}
                                >
                                    <ScanLine className="h-4 w-4" /> {showAiTools ? "Hide AI Tools" : "Enable AI Tools"}
                                </button>
                            </div>
                        </div>

                        {/* PDF Document Canvas Interactive View */}
                        <div className="flex-1 bg-slate-900 overflow-hidden flex items-center justify-center relative">
                            {selectedDrawing && activeProjectId && (
                                <div className="absolute inset-0 overflow-auto">
                                    <PdfViewerCanvas
                                        fileUrl={`/api/storage/${activeProjectId}/${selectedDrawing.title}`}
                                        activeTool={activeTool}
                                        projectId={activeProjectId}
                                        fileId={selectedDrawing.id}
                                    />
                                </div>
                            )}

                            {/* Manual Count Mock Pips (Visible only if counting tool was used) */}
                            {activeTool === "count" && (
                                <div className="absolute inset-0 pointer-events-none z-30 opacity-50">
                                    <div className="absolute top-[35%] left-[45%] w-5 h-5 rounded-full bg-accent-teal border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-slate-900 pointer-events-none">1</div>
                                    <div className="absolute top-[38%] left-[75%] w-5 h-5 rounded-full bg-accent-teal border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-slate-900 pointer-events-none">2</div>
                                    <div className="absolute top-[65%] left-[55%] w-5 h-5 rounded-full bg-accent-teal border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-slate-900 pointer-events-none">3</div>
                                </div>
                            )}

                            {/* AI Bounding Boxes Mock (only visible if AI Tools active and scanned) */}
                            {showAiTools && aiState === "results" && (
                                <div className="absolute inset-0 pointer-events-none z-30 opacity-60">
                                    <div className="absolute top-[20%] left-[30%] w-12 h-12 border-2 border-primary bg-primary/20 shadow-[0_0_15px_rgba(37,89,244,0.5)]"></div>
                                    <div className="absolute top-[45%] left-[60%] w-12 h-12 border-2 border-primary bg-primary/20 shadow-[0_0_15px_rgba(37,89,244,0.5)]"></div>
                                    <div className="absolute top-[70%] left-[25%] w-12 h-12 border-2 border-primary bg-primary/20 shadow-[0_0_15px_rgba(37,89,244,0.5)]"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: AI Takeoff Panel (Conditional) */}
                    {showAiTools && (
                        <div className="w-[400px] shrink-0 bg-surface-dark border-l border-white/10 flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] animate-in slide-in-from-right-8 duration-300">
                            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                                <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-1">
                                    <ScanLine className="h-4 w-4" /> Vision Engine
                                </div>
                                <h2 className="text-lg font-extrabold text-white">AI Quantity Takeoff</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 flex flex-col relative">
                                {aiState === "idle" ? (
                                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                                        <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-primary">
                                            <Zap className="h-8 w-8" />
                                        </div>
                                        <h4 className="text-white text-lg font-extrabold mb-2">Ready to Sweep</h4>
                                        <p className="text-sm text-slate-400 mb-8 max-w-[250px] leading-relaxed">
                                            The Vision Engine will scan the entire PDF canvas, automatically discover all MEP symbols, and categorize them for extraction.
                                        </p>
                                        <button
                                            onClick={runAiTakeoff}
                                            className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-[0_0_20px_rgba(37,89,244,0.3)] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2"
                                        >
                                            <ScanLine className="h-4 w-4" /> Run Full Sheet Discovery
                                        </button>
                                    </div>
                                ) : aiState === "scanning" ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <div className="relative size-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,89,244,0.2)]">
                                            <div className="absolute inset-0 rounded-full border-t-[3px] border-primary animate-spin"></div>
                                            <Search className="h-10 w-10 text-primary animate-pulse" />
                                        </div>
                                        <h3 className="text-xl font-extrabold text-white mb-2">Sweeping Sheet Canvas...</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed max-w-[240px]">Computer vision is drawing bounding boxes and dynamically running OCR to extract tag names.</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Results Overview */}
                                        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center shadow-lg relative overflow-hidden flex-shrink-0">
                                            <div className="absolute -right-4 -top-4 opacity-10">
                                                <ScanLine className="h-24 w-24 text-primary" />
                                            </div>
                                            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-1 relative z-10">Total Items Discovered</h4>
                                            <div className="text-6xl font-black text-white tracking-tighter mb-1 relative z-10">{takeoffResults?.itemsFound} <span className="text-xl text-primary tracking-normal font-bold">units</span></div>
                                            <p className="text-sm text-slate-300 font-semibold relative z-10">Across {takeoffResults?.categories.length} equipment categories</p>
                                        </div>

                                        {/* Categorized Discovered Data */}
                                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-surface-dark pb-2 z-10">Discovered Categories</h4>

                                            {takeoffResults?.categories.map((cat: any, i: number) => (
                                                <div key={i} className="bg-black/20 border border-white/5 rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                                        <h5 className="font-extrabold text-white text-sm">{cat.name}</h5>
                                                        <span className="text-xs font-black bg-white/10 text-slate-300 px-2 py-0.5 rounded">{cat.count}</span>
                                                    </div>
                                                    <ul className="space-y-2 text-xs text-slate-400 font-medium">
                                                        {cat.sampleTags.map((tag: string, j: number) => (
                                                            <li key={j} className="flex items-center gap-2">
                                                                <CheckCircle2 className="h-3 w-3 text-accent-teal shrink-0" /> {tag}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Confidence Score */}
                                        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between shadow-inner flex-shrink-0">
                                            <span className="text-sm text-slate-400 font-bold">Overall Vision Confidence</span>
                                            <span className="text-base font-extrabold text-accent-teal bg-accent-teal/10 px-2 py-1 rounded">{takeoffResults?.confidence}</span>
                                        </div>

                                        <div className="mt-auto pt-6 border-t border-white/10">
                                            <button className="w-full py-4 rounded-xl bg-accent-teal text-slate-900 font-extrabold shadow-[0_5px_15px_-3px_rgba(20,184,166,0.3)] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2">
                                                <UploadCloud className="h-5 w-5" /> Push to Extraction Log
                                            </button>
                                            <p className="text-[11px] text-center text-slate-500 mt-3 font-semibold">This will move matching items to Phase 3 approval.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper component for the Bluebeam-style toolbar
function ToolbarButton({ icon: Icon, tool, active, setActive, title }: any) {
    const isActive = active === tool;
    return (
        <button
            title={title}
            onClick={() => setActive(tool)}
            className={`p-2.5 rounded-lg transition-all ${isActive
                ? "bg-primary text-slate-100 shadow-[0_0_15px_rgba(37,89,244,0.4)] border border-primary/50"
                : "text-slate-400 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}
