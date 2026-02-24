"use client";

import { useAppStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import { Settings2 } from "lucide-react";

export function ProcurementTable() {
    const { equipment, openEquipment, updateProcurement } = useAppStore();

    const handleLeadTimeChange = (e: React.ChangeEvent<HTMLSelectElement>, eqId: string) => {
        e.stopPropagation();
        updateProcurement(eqId, { leadTimeWeeks: parseInt(e.target.value, 10) });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>, eqId: string) => {
        e.stopPropagation();
        updateProcurement(eqId, { procurementStatus: e.target.value });
    };

    return (
        <div className="flex-1 overflow-auto rounded-md border border-border shadow-sm">
            <Table>
                <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur z-10 border-b border-border shadow-sm">
                    <TableRow>
                        <TableHead className="w-24">Equipment</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-16">Qty</TableHead>
                        <TableHead className="w-32">Needed On Site</TableHead>
                        <TableHead className="w-32">Lead Time</TableHead>
                        <TableHead className="w-32">Req. Release</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>PO #</TableHead>
                        <TableHead>Release Status</TableHead>
                        <TableHead>Linked Submittal</TableHead>
                        <TableHead>Install Task</TableHead>
                        <TableHead className="w-16 text-center">Controls</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipment.map(eq => {
                        const isMissed = eq.procurement.status === "Missed" || (eq.procurement.requiredRelease && new Date(eq.procurement.requiredRelease) < new Date() && eq.procurement.status === "NOT_RELEASED");
                        return (
                            <TableRow
                                key={eq.id}
                                className={`hover:bg-muted/50 cursor-pointer ${isMissed ? 'bg-destructive/10 hover:bg-destructive/20' : ''}`}
                                onClick={() => openEquipment(eq.id)}
                            >
                                <TableCell className="font-semibold text-primary">{eq.tag}</TableCell>
                                <TableCell className="text-muted-foreground">{eq.category}</TableCell>
                                <TableCell>{eq.procurement.qty || 1}</TableCell>
                                <TableCell className="font-mono text-xs">{eq.procurement.neededOnSite || "TBD"}</TableCell>
                                <TableCell>
                                    <select
                                        title="Lead Time"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleLeadTimeChange(e, eq.id)}
                                        className="border border-border bg-background rounded px-2 py-1 text-xs font-mono w-24 focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={eq.procurement.leadTimeWeeks || 0}
                                    >
                                        <option value={4}>4 Weeks</option>
                                        <option value={6}>6 Weeks</option>
                                        <option value={8}>8 Weeks</option>
                                        <option value={10}>10 Weeks</option>
                                        <option value={12}>12 Weeks</option>
                                        <option value={16}>16 Weeks</option>
                                        <option value={20}>20 Weeks</option>
                                    </select>
                                </TableCell>
                                <TableCell className={`font-mono text-xs font-bold ${isMissed ? 'text-destructive' : ''}`}>
                                    {eq.procurement.requiredRelease || "N/A"}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {eq.procurement.vendor || <span className="text-muted-foreground italic">TBD</span>}
                                </TableCell>
                                <TableCell className="text-sm font-mono">
                                    {eq.procurement.poNumber || <span className="text-muted-foreground italic">Pending</span>}
                                </TableCell>
                                <TableCell>
                                    <select
                                        title="Release Status"
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleStatusChange(e, eq.id)}
                                        className={`border border-border rounded px-2 py-1 text-xs font-bold w-32 focus:outline-none focus:ring-1 focus:ring-primary ${isMissed ? 'bg-destructive/20 text-destructive' : 'bg-background text-foreground'}`}
                                        value={eq.procurement.status}
                                    >
                                        <option value="NOT_RELEASED">Not Released</option>
                                        <option value="RELEASED">Released</option>
                                        <option value="ORDERED">Ordered</option>
                                        <option value="FAB">Fabricating</option>
                                        <option value="SHIPPED">Shipped</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="INSTALLED">Installed</option>
                                        <option value="STARTED_UP">Started Up</option>
                                        <option value="TABBED">TAB</option>
                                        <option value="TURNED_OVER">Turned Over</option>
                                    </select>
                                </TableCell>
                                <TableCell>
                                    {eq.linkedIds.submittals.length > 0 ? (
                                        <Badge variant="outline" className="bg-background">{`SUB-${eq.linkedIds.submittals[0]}`}</Badge>
                                    ) : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell>
                                    {eq.linkedIds.scheduleTasks.length > 0 ? (
                                        <span className="text-xs border border-border bg-background px-1.5 py-0.5 rounded cursor-pointer hover:bg-muted">
                                            Task {eq.linkedIds.scheduleTasks[0]}
                                        </span>
                                    ) : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                                <TableCell className="text-center">
                                    {eq.controls ? <Settings2 className="h-4 w-4 text-blue-500 mx-auto" /> : <span className="text-muted-foreground">-</span>}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
