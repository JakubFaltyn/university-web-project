"use client";

import type { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Eye, Edit, User } from "lucide-react";
import { Task } from "@lib/types";
import { cva } from "class-variance-authority";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";

export type ColumnId = UniqueIdentifier;

export interface TaskCardProps {
    task: Task;
    isOverlay?: boolean;
    onViewTaskDetails?: (task: Task) => void;
    onEditTask?: (task: Task) => void;
}

export type TaskType = "Task";

export interface TaskDragData {
    type: TaskType;
    task: Task;
}

export function TaskCard({ task, isOverlay, onViewTaskDetails, onEditTask }: TaskCardProps) {
    const trpc = useTRPC();

    // Fetch data using tRPC
    const { data: users = [] } = useQuery(trpc.users.getAll.queryOptions());
    const { data: stories = [] } = useQuery(trpc.stories.getAll.queryOptions());

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

    const variants = cva("w-full max-w-md hover:shadow-lg transition-shadow duration-200", {
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
            case "doing":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
            case "todo":
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
        }
    };

    const getAssignedUserName = (assignedUserId?: string) => {
        if (!assignedUserId) return "Unassigned";
        const user = users.find((u: any) => u.id === assignedUserId);
        return user ? `${user.firstName} ${user.lastName}` : "Unknown";
    };

    const getStoryName = (storyId: string) => {
        const story = stories.find((s: any) => s.id === storyId);
        return story ? story.name : "Unknown Story";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`${variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })} ${getPriorityClass(task.priority)}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{task.title}</CardTitle>
                    <div className="flex gap-1 flex-shrink-0">
                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                            {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)} variant="secondary">
                            {task.status}
                        </Badge>
                    </div>
                </div>
                {task.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>}
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned:</span>
                    </div>
                    <span className="font-medium truncate">{getAssignedUserName(task.assignedUserId)}</span>

                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Estimate:</span>
                    </div>
                    <span className="font-medium">{task.estimatedTime}h</span>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Start:</span>
                        </div>
                        <span className="text-muted-foreground">{formatDate(task.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">End:</span>
                        </div>
                        <span className="text-muted-foreground">{formatDate(task.endDate)}</span>
                    </div>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between items-center gap-2">
                        <span className="truncate">Story: {getStoryName(task.storyId)}</span>
                        <span className="flex-shrink-0">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-3">
                <div className="flex gap-2 w-full">
                    {onViewTaskDetails && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewTaskDetails(task)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Button>
                    )}
                    {onEditTask && (
                        <Button variant="default" size="sm" className="flex-1" onClick={() => onEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
