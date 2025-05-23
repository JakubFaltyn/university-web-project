import { UserRole } from "./types";

export const canModify = (role: UserRole): boolean => {
    return role !== "guest";
};

export const canCreate = (role: UserRole): boolean => {
    return role !== "guest";
};

export const canDelete = (role: UserRole): boolean => {
    return role === "admin" || role === "devops";
};

export const canAssignTasks = (role: UserRole): boolean => {
    return role !== "guest";
};

export const isReadOnly = (role: UserRole): boolean => {
    return role === "guest";
};
