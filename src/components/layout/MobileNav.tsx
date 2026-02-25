import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, FileStack, MessageSquare } from "lucide-react";

const mobileLinks = [
    { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/schedule", icon: CalendarDays },
    { name: "Docs", href: "/drawings", icon: FileStack },
    { name: "RFIs", href: "/rfis", icon: MessageSquare },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-white/10 z-50 px-4 pb-safe flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {mobileLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        <div className={`relative p-1 rounded-xl transition-all ${isActive ? "bg-primary/15" : ""}`}>
                            <Icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                            {link.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
