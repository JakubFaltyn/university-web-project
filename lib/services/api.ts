import { Project, Story, Task, User } from "../types";

/**
 * API service for handling CRUD operations with database
 */
export const ApiService = {
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

    // User preferences (replaces localStorage for user state)
    async getUserPreferences(userId: string): Promise<{ userId: string; activeProjectId?: string; lastActivity: Date } | null> {
        try {
            const response = await fetch(`/api/user-preferences?userId=${userId}`);
            if (!response.ok) return null;
            return response.json();
        } catch {
            return null;
        }
    },

    async updateUserPreferences(userId: string, activeProjectId?: string): Promise<boolean> {
        try {
            const response = await fetch("/api/user-preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, activeProjectId }),
            });
            return response.ok;
        } catch {
            return false;
        }
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
