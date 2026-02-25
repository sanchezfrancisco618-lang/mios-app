"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { ProjectStrip } from "./ProjectStrip";
import { useAppStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, authLoading } = useAppStore();

    useEffect(() => {
        if (!authLoading && !user && pathname !== "/login") {
            router.push("/login");
        }
    }, [user, authLoading, pathname, router]);

    if (authLoading) {
        return <div className="h-screen w-full bg-background-dark flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
    }

    if (pathname === "/login") {
        return <>{children}</>;
    }

    if (!user) return null; // Avoid flashing the UI before redirect

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-slate-100 font-display">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Topbar />
                <ProjectStrip />
                <main className="flex-1 overflow-auto bg-background-dark/50 pb-16 md:pb-0">
                    {children}
                </main>
            </div>
            <MobileNav />
        </div>
    );
}
