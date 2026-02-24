"use client";

import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Calculator, AlertTriangle, FileText, Component } from "lucide-react";
import { getStatusColor, calculateRequiredRelease } from "@/lib/utils";

export function EquipmentDrawer() {
    const { drawerOpen, setDrawerOpen, selectedEquipmentId, equipment } = useAppStore();

    if (!drawerOpen) return null;

    const eq = equipment.find(e => e.id === selectedEquipmentId);

    return (
        <>
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={() => setDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-[600px] max-w-full bg-background border-l border-border shadow-2xl z-50 flex flex-col transform transition-transform duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-start shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-bold tracking-tight text-primary">
                                {eq ? eq.tag : "Equipment Hub"}
                            </h2>
                            {eq && <Badge className={getStatusColor(eq.procurement.status)}>{eq.procurement.status}</Badge>}
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{eq?.category} • {eq?.specSection}</p>
                    </div>
                    <button
                        onClick={() => setDrawerOpen(false)}
                        className="p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs Bar */}
                <div className="px-6 border-b border-border flex gap-6 text-sm font-medium overflow-x-auto shrink-0 hide-scrollbar bg-background">
                    {['Overview', 'Procurement', 'Submittals', 'Tasks', 'Inspections', 'Risks', 'Comms'].map((tab, i) => (
                        <button
                            key={tab}
                            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${i === 1 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Body - Hardcoded to Procurement Tab view for Phase 1 demo */}
                <div className="flex-1 overflow-y-auto p-6 bg-muted/10 space-y-8">
                    {eq ? (
                        <>
                            {/* Procurement Specs */}
                            <section>
                                <h3 className="text-lg font-semibold mb-4 tracking-tight">Procurement Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background border border-border rounded-md p-4 space-y-1 shadow-sm">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Needed On Site</span>
                                        <div className="font-mono font-medium text-base">{eq.procurement.neededOnSite}</div>
                                    </div>
                                    <div className="bg-background border border-border rounded-md p-4 space-y-1 shadow-sm">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex justify-between">
                                            Lead Time
                                            <span className="text-primary cursor-pointer hover:underline flex items-center gap-1"><Calculator className="h-3 w-3" /> Edit</span>
                                        </span>
                                        <div className="font-mono font-medium text-base">{eq.procurement.leadTimeWeeks} Weeks</div>
                                    </div>
                                    <div className="col-span-2 bg-primary/5 border border-primary/20 rounded-md p-4 flex items-center justify-between shadow-sm">
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Required Release Date</span>
                                            <div className="font-mono font-bold text-xl text-primary mt-1">
                                                {calculateRequiredRelease(eq.procurement.neededOnSite, eq.procurement.leadTimeWeeks)}
                                            </div>
                                        </div>
                                        {eq.procurement.status === "Missed" && (
                                            <div className="flex items-center gap-2 text-destructive font-semibold bg-destructive/10 px-3 py-1.5 rounded-md border border-destructive/20">
                                                <AlertTriangle className="h-5 w-5" /> PASSED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Relational Objects */}
                            <section className="space-y-4">
                                <h3 className="text-lg font-semibold tracking-tight border-b border-border pb-2">Linked System Objects</h3>

                                {/* Submittals */}
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Submittals</h4>
                                    {eq.linkedIds.submittals.length > 0 ? (
                                        <div className="bg-background border border-border rounded-md flex justify-between items-center p-3 shadow-sm hover:border-primary/50 cursor-pointer transition-colors">
                                            <span className="font-medium text-sm">SUB-1: Packaged RTUs Product Data</span>
                                            <Badge variant="outline" className="text-xs">Submitted</Badge>
                                        </div>
                                    ) : <span className="text-sm text-muted-foreground italic">No linked submittals.</span>}
                                </div>

                                {/* Tasks */}
                                <div>
                                    <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mt-4 mb-2 flex items-center gap-2"><Component className="h-3.5 w-3.5" /> Schedule Tasks</h4>
                                    <div className="bg-background border border-border rounded-md shadow-sm overflow-hidden divide-y divide-border">
                                        {eq.linkedIds.scheduleTasks.length > 0 ? (
                                            eq.linkedIds.scheduleTasks.slice(0, 3).map(id => (
                                                <div key={id} className="p-3 text-sm flex justify-between items-center hover:bg-muted/30 cursor-pointer">
                                                    <span className="font-medium">Task {id}</span>
                                                    <span className="text-muted-foreground text-xs"><ExternalLink className="h-3 w-3 inline mr-1" /> View</span>
                                                </div>
                                            ))
                                        ) : <div className="p-3 text-sm text-muted-foreground italic">No linked tasks.</div>}
                                    </div>
                                </div>

                            </section>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Component className="h-12 w-12 mb-4 opacity-20" />
                            <p>Select an equipment tag to view the hub.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
