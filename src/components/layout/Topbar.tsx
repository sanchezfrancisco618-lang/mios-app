"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Search, Bell, User } from "lucide-react";

export function Topbar() {
    const { project, projectsList, activeProjectId, fetchProjects, setActiveProject, createProject, user, logout } = useAppStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleNewProject = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDropdownOpen(false);
        const name = prompt("Enter new Project Name:");
        if (name) {
            await createProject({ name, ahj: "City", mode: "Retrofit", scope_hvac: true });
        }
    };

    return (
        <header className="h-14 border-b border-white/10 bg-background-dark flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div
                    className="relative font-bold text-xs bg-white/5 px-3 py-1.5 rounded-md cursor-pointer border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    {project ? project.name : "Loading..."} <span className="text-slate-500 ml-2">▼</span>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-surface-dark border border-white/10 rounded-lg shadow-2xl z-50 py-1 overflow-hidden glass">
                            {projectsList.length > 0 ? (
                                projectsList.map((p) => (
                                    <div
                                        key={p.id}
                                        className={`px-3 py-2 cursor-pointer transition-colors ${p.id === activeProjectId ? 'bg-primary/20 text-primary border-l-2 border-primary' : 'hover:bg-white/5 text-slate-400'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveProject(p.id);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        {p.name}
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 py-2 text-slate-400 italic">No projects found</div>
                            )}
                            <div className="border-t border-white/10 mt-1 pt-1">
                                <div className="px-3 py-2 hover:bg-white/5 text-slate-300 font-semibold cursor-pointer transition-colors flex items-center gap-2" onClick={handleNewProject}>
                                    <span className="material-symbols-outlined text-[16px]">add</span> New Project
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="MIOS Command (Cmd+K)"
                        className="w-full h-8 pl-9 pr-3 rounded-full border border-white/10 bg-black/20 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white/5 transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
                <button className="relative p-1.5 text-slate-400 hover:text-slate-100 transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-teal shadow-[0_0_8px_rgba(45,212,191,0.8)]"></span>
                </button>
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="h-8 w-8 rounded-full border-2 border-primary/30 bg-primary/20 flex items-center justify-center overflow-hidden hover:border-primary/60 transition-colors"
                    >
                        <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                    </button>
                    {isProfileOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-surface-dark border border-white/10 rounded-lg shadow-2xl z-50 py-1 overflow-hidden glass">
                            <div className="px-3 py-2 border-b border-white/10 mb-1">
                                <p className="text-xs text-slate-400 font-medium truncate">{user?.email || "User"}</p>
                            </div>
                            <button
                                onClick={() => { setIsProfileOpen(false); logout(); }}
                                className="w-full text-left px-3 py-2 hover:bg-white/5 text-destructive font-semibold transition-colors flex items-center gap-2 text-sm"
                            >
                                <span className="material-symbols-outlined text-[16px]">logout</span> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
