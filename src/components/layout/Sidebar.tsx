"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    ClipboardCheck,
    AlertTriangle,
    MessageSquare,
    Download,
    ScanLine,
    Settings,
    FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Drawings", href: "/drawings", icon: ScanLine },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Submittals", href: "/submittals", icon: FileText },
    { name: "Inspections & Permits", href: "/inspections", icon: ClipboardCheck },
    { name: "Risks", href: "/risks", icon: AlertTriangle },
    { name: "RFIs", href: "/rfis", icon: MessageSquare },
    { name: "Specifications", href: "/specs", icon: FileText },
    { name: "Exports", href: "/exports", icon: Download },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-white/10 bg-background-dark flex flex-col h-full shrink-0">
            <div className="h-14 flex items-center px-4 border-b border-white/10">
                <span className="font-extrabold text-lg tracking-tight text-white">MIOS</span>
                <span className="ml-2 text-[10px] text-primary uppercase tracking-widest font-bold">Command</span>
            </div>
            <nav className="flex-1 py-6 overflow-y-auto">
                <ul className="space-y-2 px-4">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                        isActive
                                            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(37,89,244,0.15)]"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                    )}
                                >
                                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="p-4 border-t border-white/10">
                <div
                    onClick={() => alert('Settings configuration coming soon!')}
                    className="flex items-center gap-3 text-sm font-semibold text-slate-400 hover:text-slate-200 cursor-pointer px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <Settings className="h-[18px] w-[18px] shrink-0" />
                    Settings
                </div>
            </div>
        </aside>
    );
}
