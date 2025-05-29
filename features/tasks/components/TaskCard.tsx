"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@features/ui/button";
import { Badge } from "@features/ui/badge";
import { Card, CardContent, CardHeader } from "@features/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@features/ui/dialog";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { Task } from "@lib/types";
import { cva } from "class-variance-authority";
import { useAppStore } from "@lib/store";
import { TaskForm } from "../forms/task-form";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { canModify, canDelete, canAssignTasks } from "@lib/permissions";
import { UserRole } from "@lib/types";

export type ColumnId = UniqueIdentifier;

export interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
    type: TaskType;
    task: Task;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
    const { deleteTask, assignTask, users, currentUser, stories } = useAppStore();
    const { data: session } = useSession();
    const [editingTask, setEditingTask] = useState(false);

    // Determine current user role (OAuth or local)
    const currentRole = session?.user?.role || currentUser?.role;
    const canUserModify = currentRole ? canModify(currentRole as UserRole) : false;
    const canUserDelete = currentRole ? canDelete(currentRole as UserRole) : false;
    const canUserAssign = currentRole ? canAssignTasks(currentRole as UserRole) : false;

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        } satisfies TaskDragData,
        attributes: {
            roleDescription: "Task",
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva("", {
        variants: {
            dragging: {
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary",
            },
        },
    });

    const getPriorityClass = (priority: Task["priority"]) => {
        switch (priority) {
            case "high":
                return "border-l-4 border-red-500";
            case "medium":
                return "border-l-4 border-yellow-500";
            case "low":
                return "border-l-4 border-green-500";
            default:
                return "";
        }
    };

    const getAssignedUserName = (assignedUserId?: string) => {
        if (!assignedUserId) return "Unassigned";
        const user = users.find((u) => u.id === assignedUserId);
        return user ? `${user.firstName} ${user.lastName}` : "Unknown";
    };

    const getStoryName = (storyId: string) => {
        const story = stories.find((s) => s.id === storyId);
        return story ? story.name : "Unknown Story";
    };

    const handleDeleteTask = () => {
        if (!canUserDelete) return;
        if (confirm("Are you sure you want to delete this task?")) {
            deleteTask(task.id);
        }
    };

    const handleEditFormSuccess = () => {
        setEditingTask(false);
    };

    const handleAssignTask = (userId: string) => {
        if (!canUserAssign) return;
        assignTask(task.id, userId);
    };

    const developerAndDevOpsUsers = users.filter((user) => user.role === "developer" || user.role === "devops");

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`${variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })} ${getPriorityClass(task.priority)}`}>
            <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
                <Button variant={"ghost"} {...attributes} {...listeners} className="p-1 text-secondary-foreground/50 -ml-2 h-auto cursor-grab">
                    <span className="sr-only">Move task</span>
                    <GripVertical />
                </Button>
                <div className="flex items-center gap-2 ml-auto">
                    <Badge variant={"secondary"} className="text-xs">
                        {getStoryName(task.storyId)}
                    </Badge>
                    <Badge
                        variant={"outline"}
                        className={`font-semibold uppercase text-xs ${
                            task.priority === "high" ? "text-red-500 border-red-500" : task.priority === "medium" ? "text-yellow-500 border-yellow-500" : "text-green-500 border-green-500"
                        }`}>
                        {task.priority}
                    </Badge>
                    {canUserModify && (
                        <Dialog open={editingTask} onOpenChange={setEditingTask}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Edit className="h-3 w-3" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Task</DialogTitle>
                                </DialogHeader>
                                <TaskForm task={task} storyId={task.storyId} onSuccess={handleEditFormSuccess} />
                            </DialogContent>
                        </Dialog>
                    )}
                    {canUserDelete && (
                        <Button variant="ghost" size="sm" onClick={handleDeleteTask} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-3 pt-3 pb-3 text-left">
                <h4 className="font-medium text-sm mb-2">{task.name}</h4>
                <p className="text-xs text-muted-foreground mb-3 whitespace-pre-wrap">{task.description}</p>

                <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-muted-foreground">{task.estimatedTime}h</span>
                    {task.endDate && task.status === "done" && <span className="text-muted-foreground">Completed: {new Date(task.endDate).toLocaleDateString()}</span>}
                </div>

                <div className="text-xs text-muted-foreground mb-2">{getAssignedUserName(task.assignedUserId)}</div>

                {canUserAssign && !task.assignedUserId && (
                    <select onChange={(e) => e.target.value && handleAssignTask(e.target.value)} className="text-xs border rounded px-2 py-1 bg-background w-full" defaultValue="">
                        <option value="">Assign to...</option>
                        {developerAndDevOpsUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                            </option>
                        ))}
                    </select>
                )}
            </CardContent>
        </Card>
    );
}
