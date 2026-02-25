"use client";

import { useAppStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import { Server, Settings2, Link } from "lucide-react";

export function ScheduleTable() {
    const { scheduleTasks, openTask, selectedTaskId, openEquipment } = useAppStore();

    return (
        <div className="flex-1 overflow-auto">
            <Table>
                <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10">
                    <TableRow>
                        <TableHead className="w-10 text-center">R</TableHead>
                        <TableHead className="w-[300px] sticky left-0 bg-muted/95">Task Name</TableHead>
                        <TableHead className="hidden sm:table-cell">Start</TableHead>
                        <TableHead className="hidden md:table-cell">Equip</TableHead>
                        <TableHead className="hidden md:table-cell">Proc. Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Controls</TableHead>
                        <TableHead className="hidden lg:table-cell">Resp</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scheduleTasks.map((t, idx) => {
                        const isSelected = selectedTaskId === t.id;

                        return (
                            <TableRow
                                key={t.id}
                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/50 border-l-2 border-l-transparent'}`}
                                onClick={() => openTask(t.id)}
                            >
                                <TableCell className="text-muted-foreground text-center">
                                    {t.ruleBased ? <Server className="h-3.5 w-3.5 mx-auto opacity-50" /> : <span className="text-[10px]">M</span>}
                                </TableCell>
                                <TableCell className="font-medium sticky left-0 bg-background border-r border-border truncate max-w-[300px]" title={t.task}>
                                    {t.task}
                                </TableCell>
                                <TableCell className="tabular-nums font-medium text-xs text-muted-foreground border-r border-border hidden sm:table-cell">{t.start}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {t.equipmentTag ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); const eq = useAppStore.getState().equipment.find(eq => eq.tag === t.equipmentTag); if (eq) openEquipment(eq.id); }}
                                            className="px-2 py-0.5 rounded bg-muted/60 text-[10px] md:text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                                        >
                                            {t.equipmentTag}
                                        </button>
                                    ) : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {t.procurementStatus ? <Badge className={getStatusColor(t.procurementStatus)}>{t.procurementStatus}</Badge> : null}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    {t.controlsFlag ? <Settings2 className="h-4 w-4 text-amber-600" /> : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="text-[10px] md:text-xs font-medium text-muted-foreground hidden lg:table-cell">{t.responsible}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
