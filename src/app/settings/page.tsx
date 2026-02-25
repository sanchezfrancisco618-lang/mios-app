"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { User, Building2, Paintbrush, Loader2, Save, Mail, Briefcase, RefreshCw, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    const { user, activeProjectId, project, initData } = useAppStore();

    // Project Form State
    const [projectName, setProjectName] = useState("");
    const [projectAhj, setProjectAhj] = useState("");
    const [projectMode, setProjectMode] = useState<"Existing" | "New">("Existing");
    const [isSavingProject, setIsSavingProject] = useState(false);

    // Preferences State
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [notifications, setNotifications] = useState(true);

    useEffect(() => {
        if (project) {
            setProjectName(project.name || "");
            setProjectAhj(project.ahj || "");
            setProjectMode(project.mode as any || "Existing");
        }
    }, [project]);

    const handleSaveProject = async () => {
        if (!activeProjectId) return;
        setIsSavingProject(true);
        try {
            const res = await fetch(`/api/projects/${activeProjectId}`, {
                method: "PATCH",
                body: JSON.stringify({ name: projectName, ahj: projectAhj, mode: projectMode }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                await initData();
            } else {
                alert("Failed to update project settings.");
            }
        } catch (error) {
            console.error("Failed to save project", error);
        } finally {
            setIsSavingProject(false);
        }
    };

    return (
        <div className="p-6 h-full overflow-y-auto space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Platform Settings</h1>
                <p className="text-muted-foreground text-sm">Manage your account, configure project defaults, and customize your experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Account Section */}
                <div className="md:col-span-1 space-y-1">
                    <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                        <User className="h-4 w-4 text-primary" />
                        Accont Profile
                    </h2>
                    <p className="px-1 text-xs text-muted-foreground">Your personal login details.</p>
                </div>
                <div className="md:col-span-2 bg-background border border-border rounded-xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold uppercase ring-2 ring-primary/20">
                            {user?.email ? user.email.substring(0, 2) : "UN"}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-300">Logged in as</p>
                            <p className="text-lg font-bold flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                {user?.email || "Loading account details..."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="col-span-full border-t border-border my-2"></div>

                {/* Project Section */}
                <div className="md:col-span-1 space-y-1">
                    <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                        <Building2 className="h-4 w-4 text-primary" />
                        Active Project
                    </h2>
                    <p className="px-1 text-xs text-muted-foreground">Configure the currently selected project workspace.</p>
                </div>
                <div className="md:col-span-2 bg-background border border-border rounded-xl p-6 shadow-sm space-y-4">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300">Project Name</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-background-dark border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                    placeholder="Enter project name..."
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-300">Authority Having Jurisdiction (AHJ)</label>
                                <input
                                    type="text"
                                    value={projectAhj}
                                    onChange={(e) => setProjectAhj(e.target.value)}
                                    className="w-full bg-background-dark border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                    placeholder="e.g. City of Chicago"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-300">Construction Mode</label>
                                <select
                                    value={projectMode}
                                    onChange={(e) => setProjectMode(e.target.value as any)}
                                    className="w-full bg-background-dark border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-inner appearance-none"
                                >
                                    <option value="New">New Construction</option>
                                    <option value="Existing">Existing / Renovation</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-end">
                        <Button
                            onClick={handleSaveProject}
                            disabled={isSavingProject}
                            className="bg-primary hover:bg-primary/90 text-white min-w-[120px] gap-2 shadow-sm"
                        >
                            {isSavingProject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSavingProject ? "Saving..." : "Save Project"}
                        </Button>
                    </div>
                </div>

                {/* Divider */}
                <div className="col-span-full border-t border-border my-2"></div>

                {/* Preferences Section */}
                <div className="md:col-span-1 space-y-1">
                    <h2 className="text-lg font-semibold flex items-center gap-2 px-1">
                        <Paintbrush className="h-4 w-4 text-primary" />
                        Preferences
                    </h2>
                    <p className="px-1 text-xs text-muted-foreground">Customize your UI and notification flow.</p>
                </div>
                <div className="md:col-span-2 bg-background border border-border rounded-xl p-6 shadow-sm space-y-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-sm">Color Theme</p>
                            <p className="text-xs text-muted-foreground">MIOS currently forces Dark Mode by default.</p>
                        </div>
                        <div className="flex bg-background-dark border border-border rounded-lg p-1">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-white/5 text-slate-500 cursor-not-allowed" disabled>
                                <Sun className="h-3 w-3" /> Light
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary/20 text-primary shadow-sm border border-primary/20">
                                <Moon className="h-3 w-3" /> Dark
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div>
                            <p className="font-semibold text-sm">Email Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive weekly digests on Submittals and Schedule Slips.</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${notifications ? 'bg-primary' : 'bg-slate-700'}`}
                        >
                            <span className={`absolute h-4 w-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-[22px]' : 'translate-x-1'}`} />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
