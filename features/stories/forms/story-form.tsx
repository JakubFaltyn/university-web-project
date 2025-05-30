"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@lib/store";
import { Story } from "@lib/types";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";
import { useCreateStoryMutation, useUpdateStoryMutation } from "../api/mutations";

const storySchema = z.object({
    name: z.string().min(1, "Story name is required"),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]),
    ownerId: z.string().min(1, "Owner is required"),
    projectId: z.string().min(1, "Project is required"),
});

type StoryFormData = z.infer<typeof storySchema>;

interface StoryFormProps {
    story?: Story;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function StoryForm({ story, onSuccess, onCancel }: StoryFormProps) {
    const { activeProject } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const trpc = useTRPC();

    // Fetch users for owner selection
    const { data: users = [] } = useQuery(trpc.users.getAll.queryOptions());

    // tRPC mutations
    const createStoryMutation = useCreateStoryMutation();
    const updateStoryMutation = useUpdateStoryMutation();

    const form = useForm<StoryFormData>({
        resolver: zodResolver(storySchema),
        defaultValues: {
            name: story?.name || "",
            description: story?.description || "",
            priority: story?.priority || "medium",
            ownerId: story?.ownerId || "",
            projectId: story?.projectId || activeProject?.id || "",
        },
    });

    const onSubmit = async (data: StoryFormData) => {
        setIsSubmitting(true);
        try {
            if (story) {
                await updateStoryMutation.mutateAsync({
                    id: story.id,
                    ...data,
                });
            } else {
                await createStoryMutation.mutateAsync(data);
            }
            form.reset();
            onSuccess?.();
        } catch (error) {
            console.error("Error saving story:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                <Textarea placeholder="Enter story description" rows={3} {...field} />
                            </FormControl>
                            <FormDescription>Provide a detailed description of what this story involves.</FormDescription>
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
                            <FormDescription>Set the priority level for this story.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="ownerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Owner</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select owner" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user: { id: string; firstName: string; lastName: string; role: string }) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormDescription>Assign an owner responsible for this story.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                        <FormItem className="hidden">
                            <FormControl>
                                <Input type="hidden" {...field} />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : story ? "Update Story" : "Create Story"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
