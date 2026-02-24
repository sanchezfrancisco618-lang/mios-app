// Normalize equipment tags
export const tagNormalize = (raw: string): string => {
    if (!raw) return "";
    let norm = raw.trim().toUpperCase().replace(/\s+/g, "");
    // Simple heuristic: convert RTU 01 -> RTU-1, RTU01 -> RTU-1
    norm = norm.replace(/([A-Z]+)[_\-\s]?0*(\d+)/, "$1-$2");
    return norm;
};

// Returns standard lead time mapping
export const getStandardLeadTime = (category: string): number => {
    const norm = category.toUpperCase();
    if (norm.includes("RTU")) return 12;
    if (norm.includes("ERU") || norm.includes("AHU")) return 10;
    if (norm.includes("PUMP")) return 6;
    if (norm.includes("VALVE")) return 4;
    if (norm.includes("CONTROLS")) return 8;
    return 8; // default
};

export const getTradeFromCategory = (category: string): "HVAC" | "PLUMBING" | "CONTROLS" => {
    const norm = category.toUpperCase();
    if (norm.includes("CONTROL")) return "CONTROLS";
    if (norm.includes("PUMP") || norm.includes("VALVE") || norm.includes("DRAIN")) return "PLUMBING";
    return "HVAC";
};

// Phase 4A: Normalization & Duplicate Detection
// This function determines if two equipment tags are definitively duplicates or highly probable duplicates.
export const checkDuplicateProbability = (existingTag: string, newTag: string, existingLocation: string | null | undefined, newLocation: string | null | undefined): boolean => {
    const normH = tagNormalize(existingTag);
    const normN = tagNormalize(newTag);

    if (normH === normN) return true;

    // Check location-based exact overrides if tags are identical generically but locations match exactly
    if (existingLocation && newLocation && typeof existingLocation === 'string' && typeof newLocation === 'string' && existingLocation.trim() !== '' && newLocation.trim() !== '') {
        if (existingLocation.toLowerCase().trim() === newLocation.toLowerCase().trim() && existingTag === newTag) {
            return true;
        }
    }

    return false;
}
