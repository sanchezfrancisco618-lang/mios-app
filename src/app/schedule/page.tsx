"use client";

import { useAppStore } from "@/lib/store";
import { ScheduleTable } from "@/components/tables/ScheduleTable";
import { ProcurementTable } from "@/components/tables/ProcurementTable";
import { EquipmentDrawer } from "@/components/drawers/EquipmentDrawer";
import { OperationalIntelligencePanel } from "@/components/panels/OperationalIntelligencePanel";
import { DocumentUploadPanel } from "@/components/shared/DocumentUploadPanel";
import { ExportMenu } from "@/components/shared/ExportMenu";

export default function Schedule() {
    const { scheduleViewActive, setScheduleViewActive, selectedTaskId, openEquipment } = useAppStore();

    return (
        <div className="flex h-full w-full overflow-hidden">
            <div className="flex-1 flex flex-col w-full h-full overflow-hidden p-6 gap-4">
                <div className="flex items-center justify-between shrink-0">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Schedule</h1>
                    <div className="flex items-center gap-4">
                        <ExportMenu dataName={`Schedule - ${scheduleViewActive} View`} />
                        <div className="flex items-center bg-muted/50 p-1 rounded-md border border-border">
                            <button
                                onClick={() => setScheduleViewActive('Tasks')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-all ${scheduleViewActive === 'Tasks' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Tasks
                            </button>
                            <button
                                onClick={() => setScheduleViewActive('Procurement')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-sm transition-all ${scheduleViewActive === 'Procurement' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Procurement
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-background border border-border rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0">
                    {scheduleViewActive === 'Tasks' ? <ScheduleTable /> : <ProcurementTable />}
                </div>
            </div>

            {scheduleViewActive === 'Tasks' && selectedTaskId && (
                <div className="w-[320px] shrink-0 border-l border-border bg-background">
                    <OperationalIntelligencePanel />
                </div>
            )}

            <EquipmentDrawer />
            {scheduleViewActive === 'Tasks' && (
                <div className="flex-1 mt-6 h-[400px]">
                    <DocumentUploadPanel documentType="drawings" />
                </div>
            )}
        </div>
    );
}
