"use client";

import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

export function ProjectStrip() {
    const { project } = useAppStore();

    if (!project) return <div className="px-6 py-2 border-b border-border bg-muted/20 text-xs shrink-0 select-none animate-pulse">Loading context...</div>;

    const s = project.stats;

    return (
        <div className="px-6 py-2 border-b border-white/10 bg-background-dark/80 backdrop-blur-md flex flex-wrap items-center gap-x-6 gap-y-2 text-xs shrink-0 text-slate-300">
            <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider">AHJ:</span>
                <span className="font-semibold">{project.ahj}</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Mode:</span>
                <span className="font-semibold">{project.mode}</span>
            </div>
            <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider">Scope:</span>
                <span className="font-semibold truncate max-w-[200px]">{(project as any).scope || "MEP"}</span>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <Badge variant={s.openRisks > 0 ? "destructive" : "secondary"} className="h-5 px-1.5 text-[10px] rounded-sm bg-red-500/10 text-red-500 border border-red-500/20">{s.openRisks}</Badge>
                    <span className="text-slate-400 font-semibold">Open Risks</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge variant={s.missedReleases > 0 ? "destructive" : "secondary"} className="h-5 px-1.5 text-[10px] rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20">{s.missedReleases}</Badge>
                    <span className="text-slate-400 font-semibold">Missed Releases</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge variant={s.inspections14Days > 0 ? "secondary" : "secondary"} className="h-5 px-1.5 text-[10px] rounded-sm bg-accent-teal/10 text-accent-teal border border-accent-teal/20">{s.inspections14Days}</Badge>
                    <span className="text-slate-400 font-semibold">Inspections &lt;14d</span>
                </div>
            </div>
        </div>
    );
}
