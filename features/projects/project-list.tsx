"use client";

import { useState } from "react";
import { useAppStore } from "@lib/store";
import { Project } from "@lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectForm } from "./forms/project-form";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useDeleteProjectMutation } from "./api/mutations";

export function ProjectList() {
    const { setActiveProject, activeProject } = useAppStore();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const trpc = useTRPC();

    // Fetch projects using tRPC
    const { data: projects = [], isLoading } = useQuery(trpc.projects.getAll.queryOptions());

    // Delete mutation
    const deleteProjectMutation = useDeleteProjectMutation();

    const handleSetActiveProject = (project: Project) => {
        setActiveProject(project);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
    };

    const handleDeleteProject = (id: string) => {
        if (confirm("Are you sure you want to delete this project? This will also delete all stories and tasks associated with it.")) {
            deleteProjectMutation.mutate({ id });
        }
    };

    const handleCreateFormSuccess = () => {
        setShowCreateDialog(false);
    };

    const handleEditFormSuccess = () => {
        setEditingProject(null);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Projects</h2>
                </div>
                <div className="text-center p-8">
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Projects</h2>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button>Add Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <ProjectForm onSuccess={handleCreateFormSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            {projects.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No projects yet. Please sign in with appropriate permissions to create projects.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div key={project.id} className={`border rounded-lg p-4 transition-colors ${activeProject?.id === project.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium text-lg">{project.name}</h3>
                                <div className="space-x-1">
                                    <Dialog
                                        open={editingProject?.id === project.id}
                                        onOpenChange={(open) => {
                                            if (!open) setEditingProject(null);
                                        }}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                                                Edit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Project</DialogTitle>
                                            </DialogHeader>
                                            <ProjectForm project={project} onSuccess={handleEditFormSuccess} />
                                        </DialogContent>
                                    </Dialog>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="text-destructive hover:text-destructive"
                                        disabled={deleteProjectMutation.isPending}>
                                        {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                            <div className="text-xs text-muted-foreground">Created: {new Date(project.createdAt).toLocaleDateString()}</div>
                            <div className="mt-3 flex justify-end">
                                {activeProject?.id === project.id ? (
                                    <Button variant="secondary" size="sm" disabled>
                                        Active Project
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleSetActiveProject(project)}>
                                        Set as Active
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
