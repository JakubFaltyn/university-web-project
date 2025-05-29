"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@lib/store";
import { Story } from "@lib/types";
import { trpc } from "@/lib/trpc";

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

    // Fetch users for owner selection
    const { data: users = [] } = trpc.users.getAll.useQuery();

    // tRPC mutations
    const createStoryMutation = trpc.stories.create.useMutation({
        onSuccess: () => {
            onSuccess?.();
        },
    });

    const updateStoryMutation = trpc.stories.update.useMutation({
        onSuccess: () => {
            onSuccess?.();
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<StoryFormData>({
        resolver: zodResolver(storySchema),
        defaultValues: {
            name: story?.name || "",
            description: story?.description || "",
            priority: story?.priority || "medium",
            ownerId: story?.ownerId || "",
            projectId: story?.projectId || activeProject?.id || "",
        },
    });

    const watchedPriority = watch("priority");
    const watchedOwnerId = watch("ownerId");

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
            reset();
        } catch (error) {
            console.error("Error saving story:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Story Name</Label>
                <Input id="name" {...register("name")} placeholder="Enter story name" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} placeholder="Enter story description" rows={3} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={watchedPriority} onValueChange={(value) => setValue("priority", value as "low" | "medium" | "high")}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
                {errors.priority && <p className="text-sm text-destructive">{errors.priority.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Owner</Label>
                <Select value={watchedOwnerId} onValueChange={(value) => setValue("ownerId", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                                {user.firstName} {user.lastName} ({user.role})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.ownerId && <p className="text-sm text-destructive">{errors.ownerId.message}</p>}
            </div>

            <input type="hidden" {...register("projectId")} />

            <div className="flex justify-end space-x-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : story ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
