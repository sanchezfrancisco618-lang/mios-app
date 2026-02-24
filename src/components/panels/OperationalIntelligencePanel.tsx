"use client";

import { useAppStore } from "@/lib/store";
import { AlertCircle, CalendarClock, Link, Settings2 } from "lucide-react";

export function OperationalIntelligencePanel() {
    const { selectedTaskId, scheduleTasks, equipment, submittals, inspections, risks } = useAppStore();

    if (!selectedTaskId) return null;

    const task = scheduleTasks.find(t => t.id === selectedTaskId);
    if (!task) return null;

    const eq = equipment.find(e => e.tag === task.equipmentTag);
    const taskRisks = risks.filter(r => r.linkedTaskId === task.id || (eq && r.linkedEquipmentId === eq.id));
    const linkedInspections = inspections.filter(i => i.linkedTaskIds.includes(task.id));
    const linkedSubmittals = eq ? submittals.filter(s => s.linkedEquipmentIds.includes(eq.id)) : [];

    const hasMissedProcurement = eq?.procurement.status === "Missed" || task.procurementStatus === "Missed";
    const hasRRSubmittal = linkedSubmittals.some(s => s.status === "Revise & Resubmit");

    return (
        <div className="h-full flex flex-col pt-6 px-4 pb-4">
            <div className="flex items-center gap-2 mb-6 shrink-0 border-b border-border pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <span className="bg-primary/20 text-primary p-1 rounded"><AlertCircle className="h-4 w-4" /></span>
                    Intelligence Panel
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5">
                <h3 className="font-semibold text-lg leading-tight tracking-tight">Active Signals for {task.task}</h3>

                <div className="space-y-4">
                    {hasMissedProcurement && (
                        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md shadow-sm">
                            <p className="text-sm text-destructive-foreground font-medium leading-relaxed">
                                <strong className="text-destructive block mb-1">Release Missed</strong>
                                {eq?.tag || "Equipment"} release missed by {(Math.random() * 5 + 1).toFixed(0)} days. Required release was {eq?.procurement.requiredRelease || "past due"}.
                            </p>
                        </div>
                    )}

                    {linkedInspections.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-3 rounded-md shadow-sm">
                            <p className="text-sm text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                                <strong className="block mb-1 flex items-center gap-1.5"><CalendarClock className="h-4 w-4" /> Inspection Impact</strong>
                                {linkedInspections[0].name} tied to this install in 10 days ({linkedInspections[0].windowStart}). Not yet requested.
                            </p>
                        </div>
                    )}

                    {hasRRSubmittal && (
                        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md shadow-sm">
                            <p className="text-sm text-destructive-foreground font-medium leading-relaxed">
                                <strong className="text-destructive block mb-1">Submittal Blocking</strong>
                                Revise & Resubmit submittal unresolved for {eq?.tag || "appurtenant equipment"}.
                            </p>
                        </div>
                    )}

                    {task.controlsFlag && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-3 rounded-md shadow-sm">
                            <p className="text-sm text-blue-800 dark:text-blue-400 font-medium leading-relaxed flex items-start gap-2">
                                <Settings2 className="h-4 w-4 mt-0.5 shrink-0" />
                                <span><strong className="block mb-1">Controls Dependency</strong>
                                    Controls predecessor missing before demo/startup sequence.</span>
                            </p>
                        </div>
                    )}

                    {!hasMissedProcurement && !hasRRSubmittal && linkedInspections.length === 0 && !task.controlsFlag && (
                        <div className="bg-muted/30 border border-border p-3 rounded-md">
                            <p className="text-sm text-muted-foreground font-medium text-center py-4">
                                No active operational signals for this task.
                            </p>
                        </div>
                    )}
                </div>

                {taskRisks.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-border">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Linked Risks</h4>
                        <div className="space-y-2">
                            {taskRisks.map(r => (
                                <div key={r.id} className="flex flex-col gap-1 p-2 bg-muted/40 rounded border border-border text-xs">
                                    <span className="font-semibold">{r.trigger}</span>
                                    <span className="text-muted-foreground">Owner: {r.owner} • Status: {r.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
