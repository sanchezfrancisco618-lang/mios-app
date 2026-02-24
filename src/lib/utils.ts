import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInWeeks } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
    return format(new Date(dateString), "MM/dd/yy");
}

export function calculateRequiredRelease(neededOnSite: string, leadTimeWeeks: number) {
    const date = new Date(neededOnSite);
    date.setDate(date.getDate() - leadTimeWeeks * 7);
    return format(date, "MM/dd/yy");
}

export function getReleaseStatus(requiredRelease: string) {
    const today = new Date("2024-05-15"); // Mock today's date for deterministic demo
    const reqDate = new Date(requiredRelease);
    if (reqDate < today) return "Missed";
    const diffDays = (reqDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diffDays <= 7) return "At Risk";
    return "On Track";
}

export function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "approved":
        case "on track":
        case "passed":
        case "low":
        case "active (on track)":
            return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
        case "revise & resubmit":
        case "r&r":
        case "missed":
        case "failed":
        case "high":
        case "critical":
            return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
        case "approved as noted":
        case "at risk":
        case "medium":
        case "scheduled":
            return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
        case "submitted":
        case "draft":
        case "requested":
        default:
            return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
}
