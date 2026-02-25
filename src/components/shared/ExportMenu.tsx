"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, FileSpreadsheet, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportMenuProps {
    dataName: string;
    className?: string;
}

export function ExportMenu({ dataName, className = "" }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exportState, setExportState] = useState<"idle" | "generating_pdf" | "generating_excel" | "done">("idle");
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (exportState === "done") setExportState("idle");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [exportState]);

    const handleExport = (format: "pdf" | "excel") => {
        setExportState(format === "pdf" ? "generating_pdf" : "generating_excel");

        // Simulate extraction and generation delay
        setTimeout(() => {
            setExportState("done");

            // Create a fake downloadable blob
            const mockContent = `Export Generated for ${dataName}\nFormat: ${format.toUpperCase()}`;
            const blob = new Blob([mockContent], { type: "text/plain" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `MIOS_Export_${dataName.replace(/\s+/g, "_")}.${format === "pdf" ? "pdf" : "xlsx"}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setTimeout(() => {
                setIsOpen(false);
                setExportState("idle");
            }, 2000);

        }, 1500);
    };

    return (
        <div className={`relative ${className}`} ref={menuRef}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="outline"
                className="gap-2 h-9 px-4 font-bold border-white/10 bg-surface-dark hover:bg-white/5 text-slate-300"
            >
                <Download className="h-4 w-4" />
                Export
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-white/5 bg-slate-800/50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Export {dataName}</span>
                    </div>

                    <div className="p-1">
                        <button
                            onClick={() => handleExport("pdf")}
                            disabled={exportState !== "idle"}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3 text-slate-200">
                                <FileText className="h-4 w-4 text-red-400" /> Complete PDF
                            </div>
                            {exportState === "generating_pdf" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                            {exportState === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal" />}
                        </button>

                        <button
                            onClick={() => handleExport("excel")}
                            disabled={exportState !== "idle"}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3 text-slate-200">
                                <FileSpreadsheet className="h-4 w-4 text-green-400" /> Excel Log
                            </div>
                            {exportState === "generating_excel" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                            {exportState === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-accent-teal" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
