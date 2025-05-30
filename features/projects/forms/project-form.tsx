"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project } from "@lib/types";
import { useCreateProjectMutation, useUpdateProjectMutation } from "../api/mutations";

const projectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
    project?: Project;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use tRPC mutation hooks
    const createProjectMutation = useCreateProjectMutation();
    const updateProjectMutation = useUpdateProjectMutation();

    const form = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: project?.name || "",
            description: project?.description || "",
        },
    });

    function onSubmit(values: ProjectFormData) {
        setIsSubmitting(true);

        if (project) {
            updateProjectMutation.mutate(
                {
                    id: project.id,
                    ...values,
                },
                {
                    onSuccess: () => {
                        setIsSubmitting(false);
                        onSuccess?.();
                    },
                    onError: () => {
                        setIsSubmitting(false);
                    },
                }
            );
        } else {
            createProjectMutation.mutate(values, {
                onSuccess: () => {
                    setIsSubmitting(false);
                    onSuccess?.();
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            });
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
                            <FormLabel>Project Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter project name" {...field} />
                            </FormControl>
                            <FormDescription>Name your project with something clear and descriptive.</FormDescription>
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
                                <Textarea
                                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe your project"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Provide a detailed description of what this project is about.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : project ? "Update Project" : "Create Project"}
                </Button>
            </form>
        </Form>
    );
}
