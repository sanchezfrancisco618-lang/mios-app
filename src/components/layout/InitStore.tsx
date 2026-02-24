"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function InitStore() {
    const { initData, monitorAuth } = useAppStore();

    useEffect(() => {
        monitorAuth();
        initData();
    }, [monitorAuth, initData]);

    return null;
}
