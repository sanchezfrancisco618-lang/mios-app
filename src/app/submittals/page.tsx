"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusColor } from "@/lib/utils";
import { FileSearch, CheckCircle2, AlertTriangle, X, Plus, Trash2 } from "lucide-react";
import { DocumentUploadPanel } from "@/components/shared/DocumentUploadPanel";
import { ExportMenu } from "@/components/shared/ExportMenu";

export default function SubmittalsPage() {
    const { activeProjectId, initData, submittals, openEquipment, equipment } = useAppStore();
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [complianceData, setComplianceData] = useState<any>(null);

    const handleStatusUpdate = async (submittalId: string, newStatus: string) => {
        // Optimistic UI update could go here by mutating the store, 
        // but for now we'll just refetch data from server
        try {
            await fetch(`/api/projects/${activeProjectId}/submittals/${submittalId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
                headers: { 'Content-Type': 'application/json' }
            });
            initData(); // Refresh the list from the server
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleCreateSubmittal = async () => {
        if (!activeProjectId) return;
        const title = prompt("Enter Submittal Title:");
        if (!title) return;
        const number = prompt("Enter Submittal Number (e.g. 230900-01):") || `SUB-${Math.floor(Math.random() * 1000)}`;

        await fetch(`/api/projects/${activeProjectId}/submittals`, {
            method: 'POST',
            body: JSON.stringify({ title, number, trade: "Multiple", status: "SUBMITTED", revision: "0" }),
            headers: { 'Content-Type': 'application/json' }
        });
        initData();
    };

    const handleDeleteSubmittal = async (submittalId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeProjectId) return;
        if (!confirm("Are you sure you want to delete this submittal?")) return;

        try {
            const res = await fetch(`/api/projects/${activeProjectId}/submittals/${submittalId}`, { method: 'DELETE' });
            if (res.ok) {
                initData();
            } else {
                alert("Failed to delete submittal");
            }
        } catch (error) {
            console.error("Failed to delete submittal", error);
        }
    };

    const runAnalysis = async (submittalId: string) => {
        setAnalyzingId(submittalId);
        try {
            const res = await fetch(`/api/projects/${activeProjectId}/submittals/${submittalId}/parse`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                setComplianceData(data);
            }
        } finally {
            setAnalyzingId(null);
        }
    };

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">Submittals Log</h1>
                <div className="flex items-center gap-2 md:gap-3">
                    <ExportMenu dataName="Submittals List" />
                    <Button onClick={handleCreateSubmittal} className="bg-primary hover:bg-primary/90 text-white font-bold h-9 px-3 md:px-4 gap-2 border-primary shadow-[0_0_15px_rgba(37,89,244,0.3)]">
                        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create Submittal</span>
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-background rounded-lg border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10">
                            <TableRow>
                                <TableHead>Submittal</TableHead>
                                <TableHead>Trade</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Rev</TableHead>
                                <TableHead className="hidden md:table-cell">Linked Equipment</TableHead>
                                <TableHead className="hidden md:table-cell text-center">Deviations</TableHead>
                                <TableHead className="text-right">Compliance AI</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submittals.map((sub: any) => {
                                const linkedEq = equipment.filter(e => (sub.linkedEquipmentIds || []).includes(e.id));
                                return (
                                    <TableRow key={sub.id} className="hover:bg-muted/50 cursor-pointer">
                                        <TableCell className="font-semibold">{sub.number || sub.id}: {sub.title}</TableCell>
                                        <TableCell><Badge variant="outline">{sub.trade}</Badge></TableCell>
                                        <TableCell>
                                            <select
                                                className={`text-xs font-semibold px-2 py-1 rounded-full border bg-transparent ${getStatusColor(sub.status).includes('amber') || sub.status === 'Submitted' ? 'text-amber-500 border-amber-500/50 outline-amber-500' :
                                                    getStatusColor(sub.status).includes('green') || sub.status.includes('Approv') ? 'text-green-500 border-green-500/50 outline-green-500' :
                                                        getStatusColor(sub.status).includes('red') || sub.status.includes('Reject') || sub.status.includes('Revise') ? 'text-red-500 border-red-500/50 outline-red-500' :
                                                            'text-slate-300 border-slate-500/50 outline-slate-500'
                                                    }`}
                                                value={sub.status}
                                                onClick={(e) => e.stopPropagation()} // Prevent row click
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleStatusUpdate(sub.id, e.target.value);
                                                }}
                                            >
                                                <option className="bg-slate-900 text-slate-300" value="Draft">Draft</option>
                                                <option className="bg-slate-900 text-amber-500" value="Submitted">Submitted</option>
                                                <option className="bg-slate-900 text-green-500" value="Approved">Approved</option>
                                                <option className="bg-slate-900 text-green-500" value="Approved as Noted">Approved as Noted</option>
                                                <option className="bg-slate-900 text-red-500" value="Revise & Resubmit">Revise & Resubmit</option>
                                                <option className="bg-slate-900 text-red-500" value="Rejected">Rejected</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{sub.revision || sub.rev || "0"}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {linkedEq.length > 0 ? linkedEq.map(eq => (
                                                    <span
                                                        key={eq.id}
                                                        onClick={(e) => { e.stopPropagation(); openEquipment(eq.id); }}
                                                        className="text-xs bg-muted border border-border px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                                                    >
                                                        {eq.tag}
                                                    </span>
                                                )) : <span className="text-muted-foreground">-</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center hidden md:table-cell">
                                            {sub.deviations?.length > 0 ? (
                                                <span className="font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full text-xs border border-destructive/20">{sub.deviations.length}</span>
                                            ) : <span className="text-muted-foreground">-</span>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => runAnalysis(sub.id)}
                                                    disabled={analyzingId === sub.id}
                                                    className="gap-2 h-9 px-2 md:px-3 text-[10px] md:text-xs"
                                                >
                                                    <FileSearch className="h-4 w-4" />
                                                    <span className="hidden sm:inline">{analyzingId === sub.id ? "Analyzing..." : "Review Compliance"}</span>
                                                    <span className="sm:hidden">{analyzingId === sub.id ? "..." : "AI"}</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => handleDeleteSubmittal(sub.id, e)}
                                                    className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                                                    title="Delete Submittal"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Compliance Review Modal */}
            {complianceData && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-5xl border border-border shadow-2xl rounded-lg flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileSearch className="h-6 w-6 text-primary" />
                                    Compliance Analysis Review
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">Reviewing Submittal {complianceData.id}: {complianceData.title}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setComplianceData(null)} className="h-9 px-3"><X className="h-5 w-5" /></Button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
                            {/* Requirements List side */}
                            <div className="flex-1 space-y-4">
                                <h3 className="text-md font-semibold mb-4 text-muted-foreground border-b border-border pb-2">Identified Requirements</h3>
                                <div className="space-y-3">
                                    {complianceData.requirements?.map((req: any) => (
                                        <div key={req.id} className="border border-border p-3 rounded-lg flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-[10px]">{String(req.type)}</Badge>
                                                    <span className="text-xs text-muted-foreground">{req.sourceRef}</span>
                                                </div>
                                                <p className="text-sm">{req.description}</p>
                                            </div>
                                            <div className="shrink-0 mt-1">
                                                {req.isCompliant ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Deviations List side */}
                            <div className="flex-1 space-y-4">
                                <h3 className="text-md font-semibold text-destructive mb-4 border-b border-border pb-2">Active Deviations ({complianceData.deviations?.length || 0})</h3>
                                <div className="space-y-3">
                                    {complianceData.deviations?.map((dev: any) => (
                                        <div key={dev.id} className="border border-destructive/30 bg-destructive/5 p-4 rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="destructive" className="text-[10px]">{`${dev.riskLevel} RISK`}</Badge>
                                                <Badge variant="outline" className="text-[10px]">{String(dev.status)}</Badge>
                                            </div>
                                            <p className="text-sm">{dev.description}</p>
                                            <div className="pt-2 flex justify-end gap-2 border-t border-destructive/10">
                                                <Button variant="outline" className="text-xs h-7 px-2">Create RFI</Button>
                                                <Button variant="default" className="text-xs h-7 px-2">Return Revise/Resubmit</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {complianceData.deviations?.length === 0 && (
                                        <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
                                            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-50" />
                                            <p>No deviations detected.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-1 mt-6 h-[400px]">
                <DocumentUploadPanel documentType="submittals" />
            </div>
        </div>
    );
}
