"use client";

import { useAppStore } from "@/lib/store";

import { useRouter } from "next/navigation";
import { getStatusColor } from "@/lib/utils";

export default function Dashboard() {
    const { project, submittals } = useAppStore();
    const router = useRouter();

    if (!project) return <div className="p-6 text-muted-foreground flex items-center justify-center min-h-[50vh]">Loading dashboard context...</div>;

    const { stats } = project;

    const getIconForTrade = (trade: string) => {
        if (trade.includes("Electrical")) return "electric_bolt";
        if (trade.includes("Plumbing")) return "water_drop";
        if (trade.includes("Controls")) return "settings_remote";
        if (trade.includes("Structural")) return "apartment";
        return "construction";
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 font-display bg-background-dark text-slate-100">
            {/* Main Content Scroll Area */}
            <main className="flex-1 space-y-8 px-6 pt-6">

                {/* Horizontal Key Metrics */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Project Overview</h3>
                        <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">Full Report</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar snap-x cursor-grab active:cursor-grabbing">
                        {/* Metric Card 1: Submittals */}
                        <div
                            onClick={() => router.push('/submittals')}
                            className="min-w-[200px] sm:flex-1 snap-start flex flex-col justify-between p-5 rounded-2xl glass-primary relative overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                        >
                            <div className="absolute -top-4 -right-4 size-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                            <span className="material-symbols-outlined text-primary mb-6">description</span>
                            <div>
                                <p className="text-3xl font-extrabold text-white">{stats.submittalsAwaitingReturn || "14"}</p>
                                <p className="text-xs font-medium text-slate-300">Submittals Awaiting Return</p>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-accent-teal font-bold">
                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                    On Track
                                </div>
                            </div>
                        </div>

                        {/* Metric Card 2: Equipment */}
                        <div
                            onClick={() => router.push('/schedule')}
                            className="min-w-[200px] sm:flex-1 snap-start flex flex-col justify-between p-5 rounded-2xl glass relative overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-accent-teal mb-6">local_shipping</span>
                            <div>
                                <p className="text-3xl font-extrabold text-white">{stats.missedReleases || "0"}</p>
                                <p className="text-xs font-medium text-slate-300">Missed Procurements</p>
                                <div className="mt-3 w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-teal w-[90%] rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Metric Card 3: Risks */}
                        <div
                            onClick={() => router.push('/risks')}
                            className="min-w-[200px] sm:flex-1 snap-start flex flex-col justify-between p-5 rounded-2xl glass relative overflow-hidden border border-red-500/20 transition-transform hover:scale-[1.02] cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
                            <span className="material-symbols-outlined text-red-400 mb-6">warning</span>
                            <div className="relative z-10">
                                <p className="text-3xl font-extrabold text-white">{stats.openRisks || "3"}</p>
                                <p className="text-xs font-medium text-slate-300">Active High Risks</p>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400 font-bold">
                                    <span className="material-symbols-outlined text-[12px]">priority_high</span>
                                    Requires Action
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Column - Actionable Lists (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-xl">policy</span>
                                Submittal Compliance Engine
                            </h3>
                            <button className="flex items-center gap-1 text-xs font-semibold glass hover:bg-white/5 transition-colors px-3 py-1.5 rounded-full text-slate-300">
                                <span className="material-symbols-outlined text-sm">tune</span> Filter
                            </button>
                        </div>

                        <div className="space-y-3">
                            {submittals.slice(0, 5).map((sub) => {
                                const isOverdue = sub.returnedOn ? new Date() > new Date(sub.returnedOn) : false;

                                // Transform status color mapping to fit the dark mode dashboard palette
                                const isApproved = sub.status === "Approved" || sub.status === "Approved as Noted";
                                const isPending = sub.status === "Submitted";
                                const isRejected = sub.status === "Revise & Resubmit";

                                const badgeStyle = isApproved
                                    ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                                    : isPending
                                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                        : "bg-red-500/10 text-red-500 border border-red-500/20";

                                const iconStyle = isApproved
                                    ? "bg-primary/10 border-primary/20 text-primary group-hover:bg-primary"
                                    : isPending
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:bg-amber-500"
                                        : "bg-red-500/10 border-red-500/20 text-red-500 group-hover:bg-red-500";

                                return (
                                    <div
                                        key={sub.id}
                                        onClick={() => router.push('/submittals')}
                                        className={`glass rounded-xl p-4 flex flex-col gap-3 group hover:bg-white/[0.04] hover:border-white/20 transition-all cursor-pointer ${isOverdue ? 'border-red-500/20 bg-red-500/5' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className={`size-10 rounded-lg border flex items-center justify-center group-hover:text-white transition-colors ${iconStyle}`}>
                                                    <span className="material-symbols-outlined">{getIconForTrade(sub.trade)}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-100">{sub.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-0.5">{sub.id} • {sub.trade}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle} ${isOverdue ? 'shadow-[0_0_8px_rgba(248,113,113,0.2)]' : ''}`}>
                                                {isOverdue ? 'Overdue' : sub.status}
                                            </span>
                                        </div>
                                        <div className={`flex items-center justify-between pt-3 border-t mt-1 ${isOverdue ? 'border-red-500/10' : 'border-white/5'}`}>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`material-symbols-outlined text-[16px] ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>calendar_today</span>
                                                <span className={`text-xs font-medium ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                                    Due: {sub.returnedOn ? new Date(sub.returnedOn).toLocaleDateString() : 'Pending'}
                                                </span>
                                            </div>
                                            <button className="text-primary hover:text-white transition-colors text-xs font-bold flex items-center gap-1">
                                                Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column - Project Snapshot (1/3 width) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent-teal text-xl">insights</span>
                                Project Snapshot
                            </h3>
                        </div>

                        <div className="glass rounded-xl p-5 space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-400">Schedule Variance</span>
                                    <span className="text-xs font-bold text-red-400">-5 Days</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[65%] rounded-full"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-400">Budget Consumed</span>
                                    <span className="text-xs font-bold text-accent-teal">42%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-accent-teal w-[42%] rounded-full shadow-[0_0_8px_rgba(45,212,191,0.5)]"></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Quick Actions</h4>

                                <button onClick={() => router.push('/schedule')} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">Review Schedule</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-500 text-[18px]">chevron_right</span>
                                </button>

                                <button onClick={() => router.push('/risks')} className="w-full flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center group-hover:bg-red-500/20">
                                            <span className="material-symbols-outlined text-[18px]">warning</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-200">Mitigate Risks</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-500 text-[18px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Action Button for Submittals */}
            <div className="fixed bottom-8 right-6 z-40">
                <button onClick={() => router.push('/submittals')} className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_10px_25px_-5px_rgba(37,89,244,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(37,89,244,0.6)] hover:-translate-y-1 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
            </div>
        </div>
    );
}
