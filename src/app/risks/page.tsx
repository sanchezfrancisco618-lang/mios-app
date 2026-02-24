"use client";

import { useAppStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export default function RisksPage() {
    const { risks, equipment, openEquipment } = useAppStore();

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold tracking-tight">Project Risks</h1>
            </div>

            <div className="grid gap-4">
                {risks.map(risk => {
                    const eq = equipment.find(e => e.id === risk.equipmentId);
                    return (
                        <Card key={risk.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getStatusColor(risk.severity)}>{risk.severity}</Badge>
                                        <span className="text-sm font-semibold text-muted-foreground">{risk.category}</span>
                                        <Badge variant="outline" className="text-[10px] ml-auto md:hidden">{risk.status}</Badge>
                                    </div>
                                    <h3 className="text-lg font-bold">{risk.trigger}</h3>
                                    <div className="text-sm text-muted-foreground pt-1">
                                        Owner: <strong>{risk.owner}</strong>
                                    </div>
                                </div>

                                <div className="flex-1 bg-muted/30 border border-border rounded p-3">
                                    <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Linked Intelligence</div>
                                    {eq && (
                                        <div
                                            className="text-sm font-medium hover:underline text-primary cursor-pointer w-fit"
                                            onClick={(e) => { e.stopPropagation(); openEquipment(eq.id); }}
                                        >
                                            Equipment: {eq.tag}
                                        </div>
                                    )}
                                    {risk.linkedTaskId && (
                                        <div className="text-sm text-muted-foreground">
                                            Task: {risk.linkedTaskId}
                                        </div>
                                    )}
                                    {!eq && !risk.linkedTaskId && (
                                        <span className="text-sm text-muted-foreground italic">No linked objects.</span>
                                    )}
                                </div>

                                <div className="hidden md:flex shrink-0 w-24 justify-end">
                                    <Badge variant="outline">{risk.status}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
