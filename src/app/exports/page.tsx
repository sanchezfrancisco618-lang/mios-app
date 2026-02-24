"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, FileDown, Activity } from "lucide-react";

export default function ExportsPage() {
    return (
        <div className="p-6 space-y-6 h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center shrink-0 mb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Exports & Reports</h1>
                    <p className="text-sm text-muted-foreground">Generate construction documents and lookaheads.</p>
                </div>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Left Side: Actions */}
                <div className="w-1/3 flex flex-col gap-4">
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-sm">Document Generation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 border border-border p-4 rounded-md">
                                <span className="font-semibold block text-sm">PM Lookahead (PDF)</span>
                                <span className="text-xs text-muted-foreground block mb-3">Includes risks, inspections, and procurement.</span>
                                <Button className="w-full justify-start" variant="default"><FileDown className="mr-2 h-4 w-4" /> Generate PM Lookahead</Button>
                            </div>

                            <div className="space-y-2 border border-border p-4 rounded-md bg-muted/10">
                                <span className="font-semibold block text-sm">Field Lookahead (PDF)</span>
                                <span className="text-xs text-muted-foreground block mb-3">Tasks and durations only. Field friendly.</span>
                                <Button className="w-full justify-start" variant="secondary"><FileDown className="mr-2 h-4 w-4" /> Generate Field Target</Button>
                            </div>

                            <div className="space-y-2 border border-border p-4 rounded-md bg-muted/10">
                                <span className="font-semibold block text-sm">Master Schedule (Excel)</span>
                                <span className="text-xs text-muted-foreground block mb-3">Raw data dump for P6 import.</span>
                                <Button className="w-full justify-start" variant="outline"><FileUp className="mr-2 h-4 w-4" /> Export Raw CSV</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Preview Panel */}
                <div className="w-2/3 bg-[#f5f5f5] dark:bg-zinc-900 border border-border rounded-lg shadow-inner overflow-hidden flex flex-col items-center justify-start p-8">
                    <div className="w-[8.5in] h-[11in] bg-white border border-gray-300 shadow-lg p-10 flex flex-col transform scale-[0.6] lg:scale-[0.8] origin-top text-black shrink-0 font-serif">
                        <div className="border-b-2 border-black pb-4 mb-6">
                            <h2 className="text-3xl font-bold text-center uppercase tracking-widest">Project Summary Report - PM Lookahead</h2>
                            <p className="text-center text-sm mt-2 italic">Howard County MD Public School - MEP Replacement</p>
                        </div>

                        <div className="flex justify-between mb-8 text-sm">
                            <div><strong>Generated:</strong> 05/15/2024</div>
                            <div><strong>Trade:</strong> HVAC & Plumbing</div>
                        </div>

                        <h3 className="font-bold underline mb-3 text-lg">Critical Path Exceptions</h3>
                        <table className="w-full text-sm border-collapse mb-8 border border-black">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-2 text-left w-24">Equipment</th>
                                    <th className="border border-black p-2 text-left">Issue</th>
                                    <th className="border border-black p-2 text-left w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-black p-2 font-bold">RTU-1</td>
                                    <td className="border border-black p-2">Required release date (04/22/24) missed based on 12-wk lead.</td>
                                    <td className="border border-black p-2 bg-red-100">CRITICAL</td>
                                </tr>
                                <tr>
                                    <td className="border border-black p-2 font-bold">ERU-1</td>
                                    <td className="border border-black p-2">Submittal R&R unresolved (Deviations: 2).</td>
                                    <td className="border border-black p-2 bg-yellow-100">AT RISK</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className="mt-auto opacity-50 flex justify-center pb-12"><Activity className="h-24 w-24 opacity-5" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
