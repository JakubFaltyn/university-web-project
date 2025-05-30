"use client";

import { useEffect } from "react";
import { useAppStore } from "@lib/store";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { initializeApp, isInitialized } = useAppStore();
    const trpc = useTRPC();

    // Fetch data for initialization
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery(trpc.users.getAll.queryOptions());
    const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery(trpc.projects.getAll.queryOptions());

    useEffect(() => {
        // Only initialize if we have both datasets and haven't initialized yet
        if (!isInitialized && !usersLoading && !projectsLoading && users.length > 0 && projects.length > 0) {
            initializeApp(users, projects);
        }
    }, [initializeApp, isInitialized, users, projects, usersLoading, projectsLoading]);

    return <>{children}</>;
}
