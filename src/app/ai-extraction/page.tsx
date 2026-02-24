"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UploadCloud, CheckCircle2, AlertTriangle, FileUp, X, Settings2, Image as ImageIcon, ArrowRight } from "lucide-react";

export default function AIExtraction() {
    const { extractedEquipment, approveExtracted, uploadAndScan, commitEquipment, commitConflicts, resolveConflict } = useAppStore();
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [activeSnippet, setActiveSnippet] = useState<string | null>(null);

    // Phase 3A: Intake State
    const [dragActive, setDragActive] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [discipline, setDiscipline] = useState("HVAC");
    const [revisionLabel, setRevisionLabel] = useState("Rev 0");

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setPendingFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadAndScan = async () => {
        if (pendingFiles.length === 0) return;
        setScanning(true);
        await uploadAndScan(pendingFiles, discipline, revisionLabel);
        setScanning(false);
        setScanned(true);
    };

    const pendingCount = extractedEquipment.length;
    const lowConfidenceCount = extractedEquipment.filter(e => e.confidenceScore < 85).length;

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Project Intake & Extraction</h1>
                    <p className="text-muted-foreground text-sm mt-1">Upload schedules and drawings securely to build your database.</p>
                </div>
            </div>

            {!scanned ? (
                <div className="flex-1 flex flex-col min-h-0 bg-background rounded-lg border border-border shadow-sm p-8 max-w-4xl mx-auto w-full">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" /> Intake Configuration
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Discipline</label>
                            <select
                                value={discipline}
                                onChange={e => setDiscipline(e.target.value)}
                                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="HVAC">HVAC</option>
                                <option value="PLUMBING">Plumbing</option>
                                <option value="CONTROLS">Controls</option>
                                <option value="GENERAL">General</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revision Label</label>
                            <Input
                                value={revisionLabel}
                                onChange={e => setRevisionLabel(e.target.value)}
                                placeholder="e.g. 100% CD, Bulletin 1"
                            />
                        </div>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Drag & Drop Files Here</h3>
                        <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                            Supports PDF drawings, specs, or Excel schedules. Files are checked for exact duplicates automatically.
                        </p>
                        <div className="relative">
                            <Button variant="outline"><FileUp className="mr-2 h-4 w-4" /> Browse Files</Button>
                            <input
                                type="file"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileSelect}
                            />
                        </div>
                    </div>

                    {pendingFiles.length > 0 && (
                        <div className="mt-8 space-y-3">
                            <h4 className="text-sm font-semibold text-muted-foreground">Files to Process ({pendingFiles.length})</h4>
                            <div className="max-h-[200px] overflow-auto space-y-2 pr-2">
                                {pendingFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/10 text-sm">
                                        <span className="font-medium truncate mr-4">{f.name}</span>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="text-muted-foreground text-xs font-mono">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                                            <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button size="lg" onClick={handleUploadAndScan} disabled={scanning} className="w-full md:w-auto">
                                    {scanning ? "Uploading & Scanning..." : "Ingest Files & Run Extraction"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0 bg-background rounded-lg border border-border shadow-sm">
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20 shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Total Detected:</span>
                                <Badge variant="secondary">{pendingCount}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">High-Risk Extractions:</span>
                                <Badge variant="destructive">{lowConfidenceCount}</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Merge Duplicates</Button>
                            {commitConflicts.length > 0 ? (
                                <Button variant="destructive" size="sm" onClick={() => { }}>Resolve {commitConflicts.length} Conflicts</Button>
                            ) : (
                                <Button variant="default" size="sm" onClick={() => commitEquipment()}>Commit Approved</Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10">
                                <TableRow>
                                    <TableHead className="w-12">Tag</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Spec</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="w-20">Conf.</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {extractedEquipment.length === 0 ? (
                                    <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">All items approved/processed.</TableCell></TableRow>
                                ) : (
                                    extractedEquipment.map(eq => {
                                        const isLow = eq.confidenceScore < 85;
                                        return (
                                            <TableRow key={eq.id} className={isLow ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}>
                                                <TableCell className="font-semibold">{eq.tag}</TableCell>
                                                <TableCell>{eq.category}</TableCell>
                                                <TableCell className="text-muted-foreground">{eq.level} - {eq.location}</TableCell>
                                                <TableCell><Badge variant="outline">{eq.specSection}</Badge></TableCell>
                                                <TableCell>
                                                    <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                                                        {eq.design.cfm && <span>{eq.design.cfm} CFM</span>}
                                                        {eq.design.gpm && <span>{eq.design.gpm} GPM</span>}
                                                        {eq.design.voltage && <span>{eq.design.voltage}</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-xs font-semibold ${isLow ? 'text-amber-600' : 'text-green-600'}`}>
                                                            {eq.confidenceScore}%
                                                        </span>
                                                        {isLow && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 relative">
                                                        <span className="text-xs border border-border px-1.5 py-0.5 rounded">{eq.sourceSheet}</span>
                                                        {eq.snippetUrl && (
                                                            <button
                                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                                onMouseEnter={() => setActiveSnippet(eq.id)}
                                                                onMouseLeave={() => setActiveSnippet(null)}
                                                            >
                                                                <ImageIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {activeSnippet === eq.id && (
                                                            <div className="absolute left-full ml-2 top-0 z-50 bg-popover border border-border shadow-xl rounded-md p-3 w-64 pointer-events-none">
                                                                <p className="text-xs font-semibold mb-2">Source Traceability</p>
                                                                <div className="bg-muted aspect-video rounded flex items-center justify-center mb-2 overflow-hidden border border-border">
                                                                    <div className="text-[10px] text-muted-foreground break-all px-2 text-center">
                                                                        {eq.snippetUrl}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                    <div><span className="text-muted-foreground">Page:</span> {eq.pageNumber}</div>
                                                                    <div><span className="text-muted-foreground">Coords:</span> {eq.boundingBox ? `x:${eq.boundingBox.x}, y:${eq.boundingBox.y}` : 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">Edit</Button>
                                                        <Button variant="default" size="sm" className="h-7 px-2" onClick={() => approveExtracted(eq.id)}>
                                                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Phase 4B: Compare Flow Modal */}
                    {commitConflicts.length > 0 && (
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-card w-full max-w-4xl border border-border shadow-2xl rounded-lg flex flex-col max-h-[90vh]">
                                <div className="p-6 border-b border-border shrink-0">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <AlertTriangle className="h-6 w-6 text-destructive" />
                                        Revision Conflict Detected ({commitConflicts.length} pending)
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        The extracted equipment matches existing records in the database. Review the changes before superseding.
                                    </p>
                                </div>
                                <div className="flex-1 overflow-auto p-6 space-y-8">
                                    {commitConflicts.map((conflict, idx) => (
                                        <div key={idx} className="border border-border rounded-lg overflow-hidden">
                                            <div className="bg-muted px-4 py-2 border-b border-border font-semibold flex items-center justify-between">
                                                <span>Conflict: {conflict.pendingRow.tagNormalized}</span>
                                            </div>
                                            <div className="p-4 grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
                                                {/* Current DB State */}
                                                <div className="space-y-3">
                                                    <Badge variant="outline" className="mb-2">Current Database Record</Badge>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div className="text-muted-foreground">Category:</div><div>{conflict.existingEquipment.category}</div>
                                                        <div className="text-muted-foreground">Location:</div><div>Level {conflict.existingEquipment.level} - {conflict.existingEquipment.location}</div>
                                                        <div className="text-muted-foreground">CFM:</div><div>{conflict.existingEquipment.airflowCfm || '-'}</div>
                                                        <div className="text-muted-foreground">Spec:</div><div>{conflict.existingEquipment.specSection || '-'}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center h-full text-muted-foreground pt-8">
                                                    <ArrowRight className="h-6 w-6" />
                                                </div>

                                                {/* Proposed Row State */}
                                                <div className="space-y-3">
                                                    <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30">Proposed Extraction</Badge>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div className="text-muted-foreground">Category:</div>
                                                        <div className={conflict.existingEquipment.category !== conflict.pendingRow.category ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-900/20 px-1 rounded" : ""}>{conflict.pendingRow.category}</div>

                                                        <div className="text-muted-foreground">Location:</div>
                                                        <div className={conflict.existingEquipment.location !== conflict.pendingRow.location ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-900/20 px-1 rounded" : ""}>Level {conflict.pendingRow.level} - {conflict.pendingRow.location}</div>

                                                        <div className="text-muted-foreground">CFM:</div>
                                                        <div className={conflict.existingEquipment.airflowCfm !== conflict.pendingRow.airflowCfm ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-900/20 px-1 rounded" : ""}>{conflict.pendingRow.airflowCfm || '-'}</div>

                                                        <div className="text-muted-foreground">Spec:</div>
                                                        <div className={conflict.existingEquipment.specSection !== conflict.pendingRow.specSection ? "text-amber-600 font-semibold bg-amber-50 dark:bg-amber-900/20 px-1 rounded" : ""}>{conflict.pendingRow.specSection || '-'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-muted/50 p-4 border-t border-border flex justify-end gap-3">
                                                <Button variant="outline" onClick={() => resolveConflict(conflict.pendingRow.id, 'keep_existing')}>Reject Changes (Keep Existing)</Button>
                                                <Button variant="default" onClick={() => resolveConflict(conflict.pendingRow.id, 'supersede')}>Supersede Database Record</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
