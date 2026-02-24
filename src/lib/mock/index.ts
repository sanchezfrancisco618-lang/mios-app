import { Project, Equipment, Submittal, ScheduleTask, Inspection, Risk, CommLog, ExtractedEquipment } from '../types';

export const MOCK_PROJECT: Project = {
    id: "P-1001",
    name: "Howard County MD Public School",
    ahj: "HCPSS Dept of Facilities",
    mode: "Existing",
    scope: "Full HVAC Overhaul",
    stats: {
        openRisks: 3,
        missedReleases: 1,
        inspections14Days: 2,
        submittalsAwaitingReturn: 4
    }
};

export const MOCK_EQUIPMENT: Equipment[] = [
    {
        id: "EQ-1", tag: "RTU-1", category: "Rooftop Unit", level: "Roof", location: "Sector A", specSection: "23 74 13",
        design: { cfm: 12000, voltage: "480V/3PH" }, controls: true,
        procurement: { qty: 1, neededOnSite: "2024-07-15", leadTimeWeeks: 12, status: "Missed" },
        linkedIds: { submittals: ["SUB-1"], scheduleTasks: ["T-1", "T-2", "T-3", "T-4", "T-5"], inspections: ["INSP-1"], risks: ["RSK-1", "RSK-3"] }
    },
    {
        id: "EQ-2", tag: "ERU-1", category: "Energy Recovery Unit", level: "Roof", location: "Sector B", specSection: "23 74 13",
        design: { cfm: 8000, voltage: "480V/3PH" }, controls: true,
        procurement: { qty: 1, neededOnSite: "2024-08-01", leadTimeWeeks: 10, status: "On Track" },
        linkedIds: { submittals: ["SUB-2"], scheduleTasks: [], inspections: [], risks: [] }
    },
    {
        id: "EQ-3", tag: "AHU-3", category: "Air Handling Unit", level: "L2", location: "Mech Room 201", specSection: "23 73 13",
        design: { cfm: 6500, voltage: "480V/3PH" }, controls: true,
        procurement: { qty: 1, neededOnSite: "2024-06-15", leadTimeWeeks: 8, status: "On Track" },
        linkedIds: { submittals: [], scheduleTasks: [], inspections: [], risks: [] }
    },
    {
        id: "EQ-4", tag: "Hydronic Pump-1", category: "Pump", level: "L1", location: "Main Plant", specSection: "23 21 23",
        design: { gpm: 250, voltage: "480V/3PH" }, controls: true,
        procurement: { qty: 2, neededOnSite: "2024-05-30", leadTimeWeeks: 4, status: "On Track" },
        linkedIds: { submittals: [], scheduleTasks: [], inspections: [], risks: [] }
    },
    {
        id: "EQ-5", tag: "Mixing Valve-1", category: "Valve", level: "L1", location: "Main Plant", specSection: "23 21 13",
        design: { gpm: 250 }, controls: true,
        procurement: { qty: 1, neededOnSite: "2024-05-20", leadTimeWeeks: 2, status: "On Track" },
        linkedIds: { submittals: [], scheduleTasks: [], inspections: [], risks: [] }
    }
];

export const MOCK_EXTRACTED_EQUIPMENT: ExtractedEquipment[] = [
    ...MOCK_EQUIPMENT.map(e => ({ ...e, confidenceScore: 98, sourceSheet: "M-601" })),
    {
        id: "EQ-X1", tag: "VAV-1-1", category: "VAV Box", level: "L1", location: "Room 101", specSection: "23 36 00",
        design: { cfm: 400 }, controls: true,
        procurement: { qty: 1, neededOnSite: "2024-06-01", leadTimeWeeks: 6, status: "On Track" },
        linkedIds: { submittals: [], scheduleTasks: [], inspections: [], risks: [] },
        confidenceScore: 72, sourceSheet: "M-602"
    }
];

export const MOCK_SUBMITTALS: Submittal[] = [
    { id: "SUB-1", title: "Packaged RTUs", trade: "HVAC", status: "Submitted", rev: "00", specSections: ["23 74 13"], linkedEquipmentIds: ["EQ-1"], deviationsCount: 0, submittedOn: "2024-05-01" },
    { id: "SUB-2", title: "Energy Recovery Unit", trade: "HVAC", status: "Approved as Noted", rev: "01", specSections: ["23 74 13"], linkedEquipmentIds: ["EQ-2"], deviationsCount: 2, submittedOn: "2024-04-15", returnedOn: "2024-04-22" },
    { id: "SUB-3", title: "Roof Drains", trade: "Plumbing", status: "Revise & Resubmit", rev: "00", specSections: ["22 14 00"], linkedEquipmentIds: [], deviationsCount: 4, submittedOn: "2024-04-10", returnedOn: "2024-04-20" },
];

export const MOCK_SCHEDULE_TASKS: ScheduleTask[] = [
    { id: "T-1", level: "Roof", trade: "HVAC", task: "Crane Lift Plan - RTU-1", start: "2024-07-01", finish: "2024-07-02", dur: 2, equipmentTag: "RTU-1", procurementStatus: "Missed", inspectionWindow: "", controlsFlag: false, linkedSubmittalStatus: "Submitted", riskLevel: "High", ruleBased: true, responsible: "PM Team" },
    { id: "T-2", level: "Roof", trade: "HVAC", task: "Curb Installation - RTU-1", start: "2024-07-10", finish: "2024-07-11", dur: 2, equipmentTag: "RTU-1", procurementStatus: "Missed", riskLevel: "High", ruleBased: true, responsible: "Foreman Smith" },
    { id: "T-3", level: "Roof", trade: "HVAC", task: "Set Equipment - RTU-1", start: "2024-07-15", finish: "2024-07-15", dur: 1, equipmentTag: "RTU-1", procurementStatus: "Missed", inspectionWindow: "2024-07-25", controlsFlag: true, riskLevel: "High", ruleBased: true, responsible: "Foreman Smith", predecessors: ["T-1", "T-2"] },
    { id: "T-4", level: "Roof", trade: "HVAC", task: "Startup - RTU-1", start: "2024-07-20", finish: "2024-07-22", dur: 3, equipmentTag: "RTU-1", riskLevel: "Medium", ruleBased: true, responsible: "Vendor Tech" },
    { id: "T-5", level: "Roof", trade: "HVAC", task: "TAB - RTU-1", start: "2024-07-25", finish: "2024-07-28", dur: 4, equipmentTag: "RTU-1", inspectionWindow: "2024-07-30", controlsFlag: true, riskLevel: "Medium", ruleBased: false, responsible: "TAB Contractor" },
];

export const MOCK_INSPECTIONS: Inspection[] = [
    { id: "INSP-1", name: "Mechanical Final", ahj: "HCPSS Dept of Facilities", trade: "HVAC", windowStart: "2024-07-25", windowEnd: "2024-07-30", status: "Draft", linkedTaskIds: ["T-3", "T-5"] },
    { id: "INSP-2", name: "Ceiling Close-In HVAC", ahj: "HCPSS Dept of Facilities", trade: "HVAC", windowStart: "2024-06-01", windowEnd: "2024-06-05", status: "Requested", linkedTaskIds: [] },
    { id: "INSP-3", name: "Groundworks Plumbing", ahj: "HCPSS Dept of Facilities", trade: "Plumbing", windowStart: "2024-05-20", windowEnd: "2024-05-22", status: "Passed", linkedTaskIds: [] },
];

export const MOCK_RISKS: Risk[] = [
    { id: "RSK-1", severity: "High", category: "Procurement", trigger: "Missed release date", status: "Active", owner: "J. Doe", linkedEquipmentId: "EQ-1", linkedTaskId: "T-3" },
    { id: "RSK-2", severity: "Medium", category: "Permitting", trigger: "Inspection in 10 days not requested", status: "Active", owner: "A. Smith" },
    { id: "RSK-3", severity: "High", category: "Controls", trigger: "Controls predecessor missing", status: "Active", owner: "C. Jones", linkedEquipmentId: "EQ-1" },
];
