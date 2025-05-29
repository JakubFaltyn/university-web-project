import { create } from "zustand";
import { Project, User } from "./types";

interface AppState {
    // User state (for local user selection when not using OAuth)
    currentUser: User | null;

    // Project state (for UI state management)
    activeProject: Project | null;

    // Loading states
    isInitialized: boolean;

    // Actions
    setCurrentUser: (user: User | null) => void;
    setActiveProject: (project: Project | null) => void;
    initializeApp: (users: User[], projects: Project[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    currentUser: null,
    activeProject: null,
    isInitialized: false,

    // Actions
    setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
    },

    setActiveProject: (project: Project | null) => {
        set({ activeProject: project });
    },

    initializeApp: (users: User[], projects: Project[]) => {
        const state = get();

        // If already initialized, don't re-initialize
        if (state.isInitialized) return;

        // Add guards for undefined/null arrays
        if (!users || !Array.isArray(users) || users.length === 0) {
            console.log("Users not ready for initialization");
            return;
        }

        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            console.log("Projects not ready for initialization");
            return;
        }

        // Auto-select admin user as default
        const adminUser = users.find((user) => user.role === "admin") || users[0];

        if (adminUser) {
            // Find admin's default project
            const defaultProject = adminUser.defaultProjectId ? projects.find((project) => project.id === adminUser.defaultProjectId) : projects[0]; // fallback to first project

            set({
                currentUser: adminUser,
                activeProject: defaultProject || null,
                isInitialized: true,
            });

            console.log("App initialized - Admin user and default project selected");
        } else {
            set({ isInitialized: true });
        }
    },
}));
