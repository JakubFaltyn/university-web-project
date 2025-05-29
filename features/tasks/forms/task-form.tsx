"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@features/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@features/ui/form";
import { Input } from "@features/ui/input";
import { Task, User } from "@lib/types";
import { useAppStore } from "@lib/store";
import { useEffect } from "react";

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
    const { createTask, updateTask, users } = useAppStore();
    const developerAndDevOpsUsers = users.filter((user) => user.role === "developer" || user.role === "devops");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            priority: "medium",
            estimatedTime: 1,
            assignedUserId: "",
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                name: task.name,
                description: task.description,
                priority: task.priority,
                estimatedTime: task.estimatedTime,
                assignedUserId: task.assignedUserId || "",
            });
        } else {
            form.reset({
                name: "",
                description: "",
                priority: "medium",
                estimatedTime: 1,
                assignedUserId: "",
            });
        }
    }, [task?.id, form]);

    function onSubmit(values: FormValues) {
        const { assignedUserId, ...otherValues } = values;

        // Determine task status and dates based on assignment
        const status = assignedUserId ? "doing" : "todo";
        const startDate = assignedUserId ? new Date().toISOString() : undefined;

        if (task) {
            // For existing task, preserve existing dates and status if not changing assignment
            const updatedTask: Task = {
                ...task,
                ...otherValues,
                assignedUserId: assignedUserId || undefined,
                status: assignedUserId && task.status === "todo" ? "doing" : task.status,
                startDate: assignedUserId && task.status === "todo" ? startDate : task.startDate,
            };
            updateTask(updatedTask);
        } else {
            // For new task
            createTask({
                ...otherValues,
                storyId,
                status,
                assignedUserId: assignedUserId || undefined,
                startDate,
            });
        }

        if (onSuccess) {
            onSuccess();
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <textarea
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe the task"
                                    {...field}
                                />
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
                                <FormControl>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        {...field}>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </FormControl>
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
                            <FormControl>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                    value={field.value || ""}>
                                    <option value="">Not assigned</option>
                                    {developerAndDevOpsUsers.map((user: User) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormDescription>Assign this task to a developer or DevOps engineer. Assigning will set status to "doing".</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{task ? "Update Task" : "Create Task"}</Button>
            </form>
        </Form>
    );
}
