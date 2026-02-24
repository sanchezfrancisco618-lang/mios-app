"use client";

import { useAppStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export default function InspectionsPage() {
    const { inspections, openTask } = useAppStore();

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Inspections & Permits</h1>
            </div>

            <div className="flex-1 bg-background rounded-lg border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10">
                            <TableRow>
                                <TableHead>Inspection Name</TableHead>
                                <TableHead>AHJ</TableHead>
                                <TableHead>Trade</TableHead>
                                <TableHead>Window</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Linked Tasks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inspections.map(insp => (
                                <TableRow key={insp.id} className="hover:bg-muted/50 cursor-pointer">
                                    <TableCell className="font-semibold">{insp.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{insp.ahj}</TableCell>
                                    <TableCell>{insp.trade}</TableCell>
                                    <TableCell className="text-xs font-mono">{insp.windowStart} to {insp.windowEnd}</TableCell>
                                    <TableCell><Badge className={getStatusColor(insp.status)}>{insp.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end flex-wrap gap-1">
                                            {insp.linkedTaskIds.length > 0 ? insp.linkedTaskIds.map(id => (
                                                <span
                                                    key={id}
                                                    onClick={(e) => { e.stopPropagation(); openTask(id); }}
                                                    className="text-xs bg-muted border border-border px-1.5 py-0.5 rounded cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors inline-block"
                                                >
                                                    {id}
                                                </span>
                                            )) : <span className="text-muted-foreground">-</span>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
