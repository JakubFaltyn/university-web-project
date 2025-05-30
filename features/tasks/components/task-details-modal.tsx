"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Edit, X } from "lucide-react";
import { Task } from "@lib/types";
import { TaskForm } from "../forms/task-form";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";

interface TaskDetailsModalProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onTaskUpdated?: () => void;
}

export function TaskDetailsModal({ task, open, onOpenChange, onTaskUpdated }: TaskDetailsModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const trpc = useTRPC();

    // Fetch data using tRPC
    const { data: users = [] } = useQuery(trpc.users.getAll.queryOptions());
    const { data: stories = [] } = useQuery(trpc.stories.getAll.queryOptions());

    if (!task) return null;

    const getAssignedUserName = (assignedUserId?: string) => {
        if (!assignedUserId) return "Unassigned";
        const user = users.find((u: any) => u.id === assignedUserId);
        return user ? `${user.firstName} ${user.lastName}` : "Unknown";
    };

    const getStoryName = (storyId: string) => {
        const story = stories.find((s: any) => s.id === storyId);
        return story ? story.name : "Unknown Story";
    };

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

    const handleEditComplete = () => {
        setIsEditing(false);
        onTaskUpdated?.();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="text-xl font-semibold">{isEditing ? "Edit Task" : "Task Details"}</DialogTitle>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {isEditing && (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {isEditing ? (
                    <TaskForm task={task} storyId={task.storyId} onSuccess={handleEditComplete} />
                ) : (
                    <div className="space-y-6">
                        {/* Header with badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={getPriorityColor(task.priority)}>{task.priority} priority</Badge>
                            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                            <Badge variant="secondary">{getStoryName(task.storyId)}</Badge>
                        </div>

                        {/* Title and Description */}
                        <div>
                            <h2 className="text-2xl font-bold mb-3">{task.title}</h2>
                            <p className="text-muted-foreground whitespace-pre-wrap">{task.description || "No description provided."}</p>
                        </div>

                        <Separator />

                        {/* Task Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Assignment */}
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Assigned to</p>
                                    <p className="text-sm text-muted-foreground">{getAssignedUserName(task.assignedUserId)}</p>
                                </div>
                            </div>

                            {/* Estimated Time */}
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Estimated Time</p>
                                    <p className="text-sm text-muted-foreground">{task.estimatedTime} hours</p>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Created</p>
                                    <p className="text-sm text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Start Date */}
                            {task.startDate && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Started</p>
                                        <p className="text-sm text-muted-foreground">{new Date(task.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}

                            {/* End Date */}
                            {task.endDate && (
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Completed</p>
                                        <p className="text-sm text-muted-foreground">{new Date(task.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Story Information */}
                        <div>
                            <p className="text-sm font-medium mb-2">Related Story</p>
                            <Badge variant="secondary" className="text-sm">
                                {getStoryName(task.storyId)}
                            </Badge>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
