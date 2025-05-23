import { Project, Story, Task, User } from "../types";

/**
 * API service for handling CRUD operations with localStorage
 */
export const ApiService = {
    // Storage keys
    keys: {
        users: "managme_users",
        projects: "managme_projects",
        stories: "managme_stories",
        tasks: "managme_tasks",
        activeProject: "managme_active_project",
        currentUser: "managme_current_user",
    },

    // Generic CRUD operations
    getItems: <T>(key: string): T[] => {
        if (typeof window === "undefined") return [];
        const items = localStorage.getItem(key);
        return items ? JSON.parse(items) : [];
    },

    getItemById: <T extends { id: string }>(key: string, id: string): T | undefined => {
        const items = ApiService.getItems<T>(key);
        return items.find((item) => item.id === id);
    },

    saveItems: <T>(key: string, items: T[]): void => {
        if (typeof window === "undefined") return;
        localStorage.setItem(key, JSON.stringify(items));
    },

    addItem: <T extends { id: string }>(key: string, item: T): T => {
        const items = ApiService.getItems<T>(key);
        const newItems = [...items, item];
        ApiService.saveItems(key, newItems);
        return item;
    },

    updateItem: <T extends { id: string }>(key: string, item: T): T | undefined => {
        const items = ApiService.getItems<T>(key);
        const index = items.findIndex((i) => i.id === item.id);

        if (index === -1) return undefined;

        const newItems = [...items];
        newItems[index] = item;
        ApiService.saveItems(key, newItems);
        return item;
    },

    deleteItem: <T extends { id: string }>(key: string, id: string): boolean => {
        const items = ApiService.getItems<T>(key);
        const newItems = items.filter((item) => item.id !== id);
        ApiService.saveItems(key, newItems);
        return items.length !== newItems.length;
    },

    // User operations
    async getUsers(): Promise<User[]> {
        const response = await fetch("/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
    },

    async getUserById(id: string): Promise<User | undefined> {
        try {
            const response = await fetch(`/api/users/${id}`);
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async createUser(user: Omit<User, "id">): Promise<User> {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error("Failed to create user");
        return response.json();
    },

    async updateUser(user: User): Promise<User | undefined> {
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async deleteUser(id: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Project operations
    async getProjects(): Promise<Project[]> {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error("Failed to fetch projects");
        return response.json();
    },

    async getProjectById(id: string): Promise<Project | undefined> {
        try {
            const response = await fetch(`/api/projects/${id}`);
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async createProject(project: Omit<Project, "id" | "createdAt">): Promise<Project> {
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(project),
        });
        if (!response.ok) throw new Error("Failed to create project");
        return response.json();
    },

    async updateProject(project: Project): Promise<Project | undefined> {
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(project),
            });
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async deleteProject(id: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Story operations
    async getStories(projectId?: string): Promise<Story[]> {
        const url = projectId ? `/api/stories?projectId=${projectId}` : "/api/stories";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch stories");
        return response.json();
    },

    async getStoryById(id: string): Promise<Story | undefined> {
        try {
            const response = await fetch(`/api/stories/${id}`);
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async createStory(story: Omit<Story, "id" | "createdAt">): Promise<Story> {
        const response = await fetch("/api/stories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(story),
        });
        if (!response.ok) throw new Error("Failed to create story");
        return response.json();
    },

    async updateStory(story: Story): Promise<Story | undefined> {
        try {
            const response = await fetch(`/api/stories/${story.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(story),
            });
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async deleteStory(id: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/stories/${id}`, { method: "DELETE" });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Task operations
    async getTasks(storyId?: string): Promise<Task[]> {
        const url = storyId ? `/api/tasks?storyId=${storyId}` : "/api/tasks";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return response.json();
    },

    async getTaskById(id: string): Promise<Task | undefined> {
        try {
            const response = await fetch(`/api/tasks/${id}`);
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task> {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
        });
        if (!response.ok) throw new Error("Failed to create task");
        return response.json();
    },

    async updateTask(task: Task): Promise<Task | undefined> {
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(task),
            });
            if (!response.ok) return undefined;
            return response.json();
        } catch {
            return undefined;
        }
    },

    async deleteTask(id: string): Promise<boolean> {
        try {
            const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Current user and active project (localStorage for UI state)
    getCurrentUser(): User | null {
        if (typeof window === "undefined") return null;
        const currentUserId = localStorage.getItem("managme_current_user");
        return currentUserId ? ({ id: currentUserId } as User) : null;
    },

    setCurrentUser(userId: string): void {
        if (typeof window === "undefined") return;
        localStorage.setItem("managme_current_user", userId);
    },

    getActiveProject(): Project | null {
        if (typeof window === "undefined") return null;
        const activeProjectData = localStorage.getItem("managme_active_project");
        return activeProjectData ? JSON.parse(activeProjectData) : null;
    },

    setActiveProject(project: Project): void {
        if (typeof window === "undefined") return;
        localStorage.setItem("managme_active_project", JSON.stringify(project));
    },

    // Initialize database with sample data
    async initializeMockData(): Promise<void> {
        try {
            const response = await fetch("/api/init", { method: "POST" });
            if (!response.ok) throw new Error("Failed to initialize database");
            console.log("Database initialized successfully");
        } catch (error) {
            console.error("Error initializing database:", error);
        }
    },
};
