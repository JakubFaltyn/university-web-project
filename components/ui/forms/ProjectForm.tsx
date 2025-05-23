"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../button";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from "../form";
import { Input } from "../input";
import { Project } from "@/lib/types";
import { useAppStore } from "@/lib/store";
import { useEffect } from "react";

const formSchema = z.object({
    name: z.string().min(3, {
        message: "Project name must be at least 3 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
    project?: Project;
    onSuccess?: () => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
    const { createProject, updateProject } = useAppStore();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name,
                description: project.description,
            });
        } else {
            form.reset({
                name: "",
                description: "",
            });
        }
    }, [project?.id, form]);

    function onSubmit(values: FormValues) {
        if (project) {
            updateProject({
                ...project,
                ...values,
            });
        } else {
            createProject(values);
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
                                <textarea
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
                <Button type="submit">{project ? "Update Project" : "Create Project"}</Button>
            </form>
        </Form>
    );
}
