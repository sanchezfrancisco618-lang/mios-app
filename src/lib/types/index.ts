export interface ProjectStats {
    openRisks: number;
    missedReleases: number;
    inspections14Days: number;
    submittalsAwaitingReturn: number;
}

export interface Project {
    id: string;
    name: string;
    ahj: string;
    mode: "Existing" | "New";
    scope: string;
    stats: ProjectStats;
}

export interface Equipment {
    id: string;
    tag: string;
    category: string;
    level: string;
    location: string;
    specSection: string;
    design: {
        cfm?: number;
        gpm?: number;
        voltage?: string;
    };
    controls: boolean;
    procurement: {
        qty: number;
        vendor?: string;
        poNumber?: string;
        shipStatus?: string;
        neededOnSite: string;
        leadTimeWeeks: number;
        requiredRelease?: string;
        status: "On Track" | "At Risk" | "Missed" | "NOT_RELEASED" | "RELEASED" | "ORDERED" | string;
    };
    linkedIds: {
        submittals: string[];
        scheduleTasks: string[];
        inspections: string[];
        risks: string[];
    };
}

export interface ExtractedEquipment extends Equipment {
    confidenceScore: number;
    sourceSheet: string;
    pageNumber?: number;
    snippetUrl?: string;
    boundingBox?: any;
}

export interface Submittal {
    id: string;
    title: string;
    trade: string;
    status: "Submitted" | "Approved" | "Approved as Noted" | "Revise & Resubmit";
    rev: string;
    specSections: string[];
    linkedEquipmentIds: string[];
    deviationsCount: number;
    submittedOn: string;
    returnedOn?: string;
}

export interface ScheduleTask {
    id: string;
    level: string;
    trade: string;
    task: string;
    start: string;
    finish: string;
    dur: number; // working days
    equipmentTag?: string;
    procurementStatus?: "On Track" | "At Risk" | "Missed";
    inspectionWindow?: string;
    controlsFlag?: boolean;
    linkedSubmittalStatus?: string;
    riskLevel?: "Low" | "Medium" | "High";
    ruleBased: boolean;
    predecessors?: string[];
    prerequisites?: string[];
    responsible: string;
}

export interface Inspection {
    id: string;
    name: string;
    ahj: string;
    trade: string;
    windowStart: string;
    windowEnd: string;
    status: "Requested" | "Scheduled" | "Passed" | "Failed" | "Draft";
    linkedTaskIds: string[];
}

export interface Risk {
    id: string;
    severity: "High" | "Medium" | "Low";
    category: "Procurement" | "Schedule" | "Permitting" | "Design" | "Controls";
    trigger: string;
    status: "Active" | "Mitigated" | "Closed";
    owner: string;
    equipmentId?: string;
    linkedTaskId?: string;
    linkedSubmittalId?: string;
}

export interface CommLog {
    id: string;
    channel: "Email" | "Meeting" | "Call" | "RFI";
    subject: string;
    date: string;
    participants: string[];
    summary: string;
    linkedIds: { equipment?: string[]; tasks?: string[] };
}
