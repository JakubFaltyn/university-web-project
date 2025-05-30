"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, User } from "@lib/types";
import { useEffect, useState } from "react";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";
import { useCreateTaskMutation, useUpdateTaskMutation } from "../api/mutations";
import { useCurrentUser } from "../../hooks/use-current-user";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Task name must be at least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    priority: z.enum(["low", "medium", "high"] as const),
    estimatedTime: z.coerce.number().min(0.5, {
        message: "Estimated time must be at least 0.5 hours.",
    }),
    assignedUserId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
    task?: Task;
    storyId: string;
    onSuccess?: () => void;
}

export function TaskForm({ task, storyId, onSuccess }: TaskFormProps) {
    const trpc = useTRPC();
    const currentUser = useCurrentUser();
    const [isMarkingDone, setIsMarkingDone] = useState(false);

    // Fetch users using tRPC
    const { data: users = [] } = useQuery(trpc.users.getAll.queryOptions());
    const developerAndDevOpsUsers = users.filter((user: User) => user.role === "developer" || user.role === "devops");

    // Use tRPC mutations
    const createTaskMutation = useCreateTaskMutation();
    const updateTaskMutation = useUpdateTaskMutation();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: task?.title || "",
            description: task?.description || "",
            priority: task?.priority || "medium",
            estimatedTime: task?.estimatedTime || 1,
            assignedUserId: task?.assignedUserId || "unassigned",
        },
    });

    // Check if current user is assigned to this task
    const isAssignedToCurrentUser = task && currentUser && task.assignedUserId === currentUser.id;
    const canMarkAsDone = isAssignedToCurrentUser && task?.status !== "done";

    useEffect(() => {
        if (task) {
            form.setValue("name", task.title);
            form.setValue("description", task.description);
            form.setValue("priority", task.priority);
            form.setValue("estimatedTime", task.estimatedTime);
            form.setValue("assignedUserId", task.assignedUserId || "unassigned");
        } else {
            form.reset({
                name: "",
                description: "",
                priority: "medium",
                estimatedTime: 1,
                assignedUserId: "unassigned",
            });
        }
    }, [task, form]);

    function onSubmit(values: FormValues) {
        const { assignedUserId, ...otherValues } = values;

        // Convert "unassigned" back to undefined
        const actualAssignedUserId = assignedUserId === "unassigned" ? undefined : assignedUserId;

        // Determine task status and dates based on assignment
        const status = actualAssignedUserId ? "doing" : "todo";
        const startDate = actualAssignedUserId ? new Date().toISOString() : undefined;

        if (task) {
            // For existing task, preserve existing dates and status if not changing assignment
            updateTaskMutation.mutate(
                {
                    id: task.id,
                    title: values.name,
                    ...otherValues,
                    assignedUserId: actualAssignedUserId,
                    // Preserve existing status unless changing assignment
                    status: task.assignedUserId !== actualAssignedUserId ? status : task.status,
                    startDate: !task.assignedUserId && actualAssignedUserId ? startDate : task.startDate,
                    storyId,
                },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                }
            );
        } else {
            createTaskMutation.mutate(
                {
                    title: values.name,
                    ...otherValues,
                    assignedUserId: actualAssignedUserId,
                    status,
                    startDate,
                    storyId,
                },
                {
                    onSuccess: () => {
                        onSuccess?.();
                    },
                }
            );
        }
    }

    const handleMarkAsDone = async () => {
        if (!task || !currentUser) return;

        setIsMarkingDone(true);
        try {
            await updateTaskMutation.mutateAsync({
                id: task.id,
                status: "done",
                endDate: new Date().toISOString(),
            });
            onSuccess?.();
        } catch (error) {
            console.error("Error marking task as done:", error);
        } finally {
            setIsMarkingDone(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Task Status Information */}
                {task && (
                    <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-sm">Task Status</h3>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    task.status === "done" ? "bg-green-100 text-green-800" : task.status === "doing" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                }`}>
                                {task.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {task.assignedUserId ? (
                                <p>
                                    Assigned to: {users.find((u) => u.id === task.assignedUserId)?.firstName} {users.find((u) => u.id === task.assignedUserId)?.lastName}
                                </p>
                            ) : (
                                <p>Not assigned</p>
                            )}
                            {isAssignedToCurrentUser && <p className="text-blue-600 font-medium mt-1">You are assigned to this task</p>}
                        </div>
                    </div>
                )}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Task Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter task name" {...field} />
                            </FormControl>
                            <FormDescription>Name your task with something clear and descriptive.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe the task" {...field} />
                            </FormControl>
                            <FormDescription>Provide a detailed description of what this task involves.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>Set the priority for this task.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="estimatedTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estimated Time (hours)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.5" min="0.5" {...field} />
                                </FormControl>
                                <FormDescription>Estimated time to complete this task in hours.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="assignedUserId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assign To</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "unassigned"}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select user" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="unassigned">Not assigned</SelectItem>
                                    {developerAndDevOpsUsers.map((user: User) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Assign this task to a developer or DevOps engineer. Assigning will set status to doing.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-between items-center">
                    <div>
                        {canMarkAsDone && (
                            <Button type="button" variant="outline" onClick={handleMarkAsDone} disabled={isMarkingDone} className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                                {isMarkingDone ? "Marking Done..." : "✓ Mark as Done"}
                            </Button>
                        )}
                    </div>
                    <Button type="submit">{task ? "Update Task" : "Create Task"}</Button>
                </div>
            </form>
        </Form>
    );
}
