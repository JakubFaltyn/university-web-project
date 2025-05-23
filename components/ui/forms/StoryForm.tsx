"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../form";
import { Input } from "../input";
import { Priority, Story, User } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Story name must be at least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    priority: z.enum(["low", "medium", "high"] as const),
    ownerId: z.string({
        required_error: "Please select an owner for this story.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface StoryFormProps {
    story?: Story;
    projectId: string;
    onSuccess?: () => void;
}

export function StoryForm({ story, projectId, onSuccess }: StoryFormProps) {
    const { createStory, updateStory, users } = useAppStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            priority: "medium",
            ownerId: "",
        },
    });

    useEffect(() => {
        if (story) {
            form.reset({
                name: story.name,
                description: story.description,
                priority: story.priority,
                ownerId: story.ownerId,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                priority: "medium",
                ownerId: "",
            });
        }
    }, [story?.id, form]);

    function onSubmit(values: FormValues) {
        if (story) {
            updateStory({
                ...story,
                ...values,
            });
        } else {
            createStory({
                ...values,
                projectId,
                status: "todo",
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
                            <FormLabel>Story Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter story name" {...field} />
                            </FormControl>
                            <FormDescription>Name your story with something clear and descriptive.</FormDescription>
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
                                    placeholder="Describe your story"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Provide a detailed description of what this story is about.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                            <FormDescription>Set the priority for this story.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Story Owner</FormLabel>
                            <FormControl>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}>
                                    <option value="" disabled>
                                        Select an owner
                                    </option>
                                    {users.map((user: User) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormDescription>Assign an owner to this story.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">{story ? "Update Story" : "Create Story"}</Button>
            </form>
        </Form>
    );
}
