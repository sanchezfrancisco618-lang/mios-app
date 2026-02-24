"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function CommunicationsPage() {
    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Communications Log</h1>
                    <p className="text-sm text-muted-foreground">Track RFIs, Meetings, and Vendor Comms linked to equipment.</p>
                </div>
                <Button><MessageSquarePlus className="mr-2 h-4 w-4" /> Add Log</Button>
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-background p-12 shrink-0">
                <MessageSquarePlus className="h-10 w-10 text-muted-foreground opacity-20 mb-4" />
                <span className="text-muted-foreground font-medium">No communications logged yet.</span>
            </div>
        </div>
    );
}
