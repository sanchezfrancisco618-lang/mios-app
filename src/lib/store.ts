import { create } from 'zustand';
import type { Project, Equipment, Submittal, ScheduleTask, Inspection, Risk, ExtractedEquipment } from './types';
import { MOCK_SUBMITTALS, MOCK_SCHEDULE_TASKS, MOCK_INSPECTIONS } from './mock';
import { auth } from './firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AppState {
    user: User | null;
    authLoading: boolean;
    activeProjectId: string | null;
    projectsList: Project[];
    project: Project | null;
    equipment: Equipment[];
    extractedEquipment: ExtractedEquipment[];
    currentRunId: string | null;
    submittals: Submittal[];
    scheduleTasks: ScheduleTask[];
    inspections: Inspection[];
    risks: Risk[];
    commitConflicts: any[];

    // UI State
    drawerOpen: boolean;
    selectedEquipmentId: string | null;
    selectedTaskId: string | null;
    searchQuery: string;
    isSearchOpen: boolean;
    scheduleViewActive: 'Tasks' | 'Procurement';

    // Actions
    setDrawerOpen: (open: boolean) => void;
    openEquipment: (id: string) => void;
    openTask: (id: string) => void;
    setSearchQuery: (q: string) => void;
    setSearchOpen: (open: boolean) => void;
    setScheduleViewActive: (view: 'Tasks' | 'Procurement') => void;

    // Project API Actions
    fetchProjects: () => Promise<void>;
    setActiveProject: (id: string) => Promise<void>;
    createProject: (data: any) => Promise<void>;

    // API Actions
    initData: () => Promise<void>;
    uploadAndScan: (files: File[], discipline: string, revisionLabel: string) => Promise<void>;
    approveExtracted: (rowId: string) => Promise<void>;
    commitEquipment: () => Promise<void>;
    updateProcurement: (eqId: string, payload: any) => Promise<void>;
    setCommitConflicts: (conflicts: any[]) => void;
    resolveConflict: (pendingRowId: string, action: 'supersede' | 'keep_existing') => Promise<void>;
    // Auth Actions
    monitorAuth: () => void;
    login: (e: string, p: string) => Promise<void>;
    registerUser: (e: string, p: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    user: null,
    authLoading: true,
    activeProjectId: null,
    projectsList: [],
    project: null,
    equipment: [],
    extractedEquipment: [],
    currentRunId: null,
    submittals: MOCK_SUBMITTALS,
    scheduleTasks: MOCK_SCHEDULE_TASKS,
    inspections: MOCK_INSPECTIONS,
    risks: [],
    commitConflicts: [],

    drawerOpen: false,
    selectedEquipmentId: null,
    selectedTaskId: null,
    searchQuery: "",
    isSearchOpen: false,
    scheduleViewActive: 'Tasks',

    setCommitConflicts: (conflicts) => set({ commitConflicts: conflicts }),

    setDrawerOpen: (open) => set({ drawerOpen: open }),

    openEquipment: (id) => set({
        drawerOpen: true,
        selectedEquipmentId: id,
        selectedTaskId: null
    }),

    openTask: (id) => {
        const task = get().scheduleTasks.find(t => t.id === id);
        let eqId = null;
        if (task && task.equipmentTag) {
            const eq = get().equipment.find(e => e.tag === task.equipmentTag);
            if (eq) eqId = eq.id;
        }
        set({
            selectedTaskId: id,
            selectedEquipmentId: eqId || null,
            drawerOpen: !!eqId
        });
    },

    setSearchQuery: (q) => set({ searchQuery: q }),
    setSearchOpen: (open) => set({ isSearchOpen: open }),
    setScheduleViewActive: (view) => set({ scheduleViewActive: view }),

    monitorAuth: () => {
        onAuthStateChanged(auth, (user) => {
            set({ user, authLoading: false });
        });
    },

    login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    },

    registerUser: async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
    },

    logout: async () => {
        await signOut(auth);
        set({ activeProjectId: null, project: null, projectsList: [] });
    },

    fetchProjects: async () => {
        const res = await fetch('/api/projects');
        const projects = await res.json();
        set({ projectsList: projects });

        // Auto-select first project if none is active
        if (projects.length > 0 && !get().activeProjectId) {
            get().setActiveProject(projects[0].id);
        }
    },

    setActiveProject: async (id: string) => {
        set({ activeProjectId: id, project: null }); // Show loading state briefly
        await get().initData();
    },

    createProject: async (data: any) => {
        const res = await fetch('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        const newProj = await res.json();
        await get().fetchProjects();
        await get().setActiveProject(newProj.id);
    },

    initData: async () => {
        const projectId = get().activeProjectId;
        if (!projectId) return;

        // Fetch Project
        const pRes = await fetch(`/api/projects/${projectId}`);
        const project = await pRes.json();

        // Fetch Equipment
        const eqRes = await fetch(`/api/projects/${projectId}/equipment`);
        const equipmentDb = await eqRes.json();

        // Fetch Risks
        const riskRes = await fetch(`/api/projects/${projectId}/risks`);
        const risks = await riskRes.json();

        // Fetch Submittals
        const subRes = await fetch(`/api/projects/${projectId}/submittals`);
        const subDb = await subRes.json();

        set({
            project,
            equipment: equipmentDb.map((e: any) => ({
                id: e.id, tag: e.tagNormalized, category: e.category, level: e.level, location: e.location, specSection: e.specSection,
                design: { cfm: e.airflowCfm, gpm: e.gpm, voltage: `${e.voltage}V` }, controls: e.controlsRequired,
                procurement: {
                    qty: e.qty || 1,
                    vendor: e.vendor || undefined,
                    poNumber: e.poNumber || undefined,
                    shipStatus: e.shipStatus || undefined,
                    neededOnSite: e.neededOnSite ? new Date(e.neededOnSite).toLocaleDateString() : "",
                    leadTimeWeeks: e.leadTimeWeeks,
                    requiredRelease: e.requiredRelease ? new Date(e.requiredRelease).toLocaleDateString() : undefined,
                    status: e.procurementStatus
                }, linkedIds: { submittals: [], scheduleTasks: [], inspections: [], risks: [] } // Mock links since Phase 2 doesn't have complete cross-table joins yet
            })),
            risks,
            submittals: subDb
        });
    },

    uploadAndScan: async (files: File[], discipline: string, revisionLabel: string) => {
        const projectId = get().activeProjectId;
        if (!projectId) return;

        // 1. "Upload" files
        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("discipline", discipline);
            formData.append("revisionLabel", revisionLabel);
            formData.append("source", "Manual Upload");

            await fetch(`/api/projects/${projectId}/files`, {
                method: 'POST', body: formData
            });
        }

        // 2. Scan
        const runRes = await fetch(`/api/projects/${projectId}/extraction-runs`, { method: 'POST' });
        const run = await runRes.json();
        set({ currentRunId: run.id });

        // 3. Fetch Rows
        const rowsRes = await fetch(`/api/extraction-runs/${run.id}/rows`);
        const rows = await rowsRes.json();

        set({
            extractedEquipment: rows.filter((r: any) => r.status === "PENDING").map((r: any) => ({
                id: r.id, tag: r.tagRaw, category: r.category, level: r.level, location: r.location, specSection: r.specSection,
                design: { cfm: r.airflowCfm, gpm: r.gpm, voltage: r.voltage ? `${r.voltage}V` : undefined }, controls: false,
                procurement: { qty: r.qty, neededOnSite: "", leadTimeWeeks: 0, status: "NOT_RELEASED" }, linkedIds: { submittals: [], scheduleTasks: [], inspections: [], risks: [] },
                confidenceScore: Math.round(r.confidence * 100), sourceSheet: "Auto",
                pageNumber: r.pageNumber, snippetUrl: r.snippetUrl, boundingBox: r.boundingBox ? JSON.parse(r.boundingBox) : null
            }))
        });
    },

    approveExtracted: async (rowId: string) => {
        const runId = get().currentRunId;
        if (!runId) return;

        await fetch(`/api/extraction-runs/${runId}/rows/approve`, {
            method: 'POST', body: JSON.stringify({ rowIds: [rowId] }), headers: { 'Content-Type': 'application/json' }
        });

        set(state => ({
            extractedEquipment: state.extractedEquipment.filter(e => e.id !== rowId)
        }));
    },

    commitEquipment: async () => {
        const projectId = get().activeProjectId;
        const runId = get().currentRunId;
        if (!runId || !projectId) return;

        const res = await fetch(`/api/projects/${projectId}/equipment/commit`, {
            method: 'POST', body: JSON.stringify({ runId }), headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.conflicts && data.conflicts.length > 0) {
            set({ commitConflicts: data.conflicts });
        }

        // Refresh equipment & project overall state
        get().initData();
    },

    resolveConflict: async (pendingRowId: string, action: 'supersede' | 'keep_existing') => {
        const projectId = get().activeProjectId;
        if (!projectId) return;

        if (action === 'keep_existing') {
            // Reject the row locally/on server if keeping existing
            await fetch(`/api/extraction-runs/${get().currentRunId}/rows/reject`, {
                method: 'POST', body: JSON.stringify({ rowIds: [pendingRowId] }), headers: { 'Content-Type': 'application/json' }
            });
        } else {
            // Supersede - would be a custom route to force update existing equipment
            await fetch(`/api/equipment/supersede`, {
                method: 'POST', body: JSON.stringify({ rowId: pendingRowId, projectId }), headers: { 'Content-Type': 'application/json' }
            });
        }

        // Remove from conflicts array
        set(state => ({
            commitConflicts: state.commitConflicts.filter(c => c.pendingRow.id !== pendingRowId)
        }));
        get().initData();
    },

    updateProcurement: async (eqId, payload) => {
        const res = await fetch(`/api/equipment/${eqId}/procurement`, {
            method: 'PATCH', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) {
            const err = await res.json();
            alert(`Action Blocked: ${err.error || 'Invalid State Transition'}`);
        }
        await get().initData();
    }
}));
