"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function AppProvider({ children }: { children: React.ReactNode }) {
    const { initializeApp } = useAppStore();

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    return <>{children}</>;
}
