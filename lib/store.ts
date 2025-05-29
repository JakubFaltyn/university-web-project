import { create } from "zustand";
import { Project, User } from "./types";

interface AppState {
    // User state
    currentUser: User | null;

    // Project state
    activeProject: Project | null;

    // Actions
    setCurrentUser: (user: User | null) => void;
    setActiveProject: (project: Project | null) => void;

    // Simple initialization - just sets up the store
    initializeApp: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    currentUser: null,
    activeProject: null,

    // Actions
    setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
    },

    setActiveProject: (project: Project | null) => {
        set({ activeProject: project });
    },

    initializeApp: () => {
        // Simple initialization - could load from localStorage if needed
        console.log("App initialized with tRPC");
    },
}));
