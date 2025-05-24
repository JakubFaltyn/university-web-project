export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "doing" | "done";
export type StoryStatus = "todo" | "doing" | "done";
export type UserRole = "admin" | "devops" | "developer" | "guest";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    email?: string;
    defaultProjectId?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

export interface Story {
    id: string;
    name: string;
    description: string;
    priority: Priority;
    projectId: string;
    createdAt: string;
    status: StoryStatus;
    ownerId: string;
    autoUpdateStatus?: boolean; // Whether status should be automatically calculated from tasks
}

export interface Task {
    id: string;
    name: string;
    description: string;
    priority: Priority;
    storyId: string;
    estimatedTime: number; // in hours
    status: TaskStatus;
    createdAt: string;
    startDate?: string;
    endDate?: string;
    assignedUserId?: string;
}
