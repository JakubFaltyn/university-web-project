"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, User, Calendar, Clock } from "lucide-react";
import { Task } from "@lib/types";
import { cva } from "class-variance-authority";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";

export type ColumnId = UniqueIdentifier;

export interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
    onEdit?: (task: Task) => void;
    onDelete?: (taskId: string) => void;
}

export type TaskType = "Task";

export interface TaskDragData {
    type: TaskType;
    task: Task;
}

export function TaskCard({ task, isOverlay, onEdit, onDelete }: TaskCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch data using tRPC
    const { data: users = [] } = trpc.users.getAll.useQuery();
    const { data: stories = [] } = trpc.stories.getAll.useQuery();

    // Mutations
    const deleteTaskMutation = trpc.tasks.delete.useMutation();
    const updateTaskMutation = trpc.tasks.update.useMutation();

    const { setNodeRef, transform, transition, isDragging } = useSortable({
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

    const handleDeleteTask = async () => {
        if (confirm("Are you sure you want to delete this task?")) {
            setIsDeleting(true);
            try {
                await deleteTaskMutation.mutateAsync({ id: task.id });
                onDelete?.(task.id);
            } catch (error) {
                console.error("Failed to delete task:", error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleAssignTask = async (userId: string) => {
        try {
            await updateTaskMutation.mutateAsync({
                id: task.id,
                assignedUserId: userId,
            });
        } catch (error) {
            console.error("Failed to assign task:", error);
        }
    };

    const developerAndDevOpsUsers = users.filter((user) => user.role === "developer" || user.role === "devops");

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 border-red-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 border-green-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done":
                return "bg-green-100 text-green-800 border-green-200";
            case "doing":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "todo":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`${variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })} ${getPriorityClass(task.priority)}`}>
            <CardHeader className="px-3 py-3 space-between flex flex-row border-b-2 border-secondary relative">
                <CardTitle className="text-lg font-semibold line-clamp-2">{task.name}</CardTitle>
                <div className="flex items-center gap-2 ml-auto">
                    <Badge variant={"secondary"} className="text-xs">
                        {getStoryName(task.storyId)}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {onEdit && <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>}
                            {onDelete && (
                                <DropdownMenuItem onClick={handleDeleteTask} disabled={isDeleting} className="text-red-600">
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
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

                {!task.assignedUserId && (
                    <select onChange={(e) => e.target.value && handleAssignTask(e.target.value)} className="text-xs border rounded px-2 py-1 bg-background w-full" defaultValue="">
                        <option value="">Assign to...</option>
                        {developerAndDevOpsUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}
                            </option>
                        ))}
                    </select>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-4">
                        {task.assignedUserId && (
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{getAssignedUserName(task.assignedUserId)}</span>
                            </div>
                        )}
                        {task.startDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(task.startDate).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
