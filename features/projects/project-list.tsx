"use client";

import { useState } from "react";
import { useAppStore } from "@lib/store";
import { Project, UserRole } from "@lib/types";
import { Button } from "@features/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@features/ui/dialog";
import { ProjectForm } from "./forms/project-form";
import { canCreate, canModify, canDelete } from "@lib/permissions";
import { useAuth } from "@features/auth/openauth-provider";
import { trpc } from "@/lib/trpc";

export function ProjectList() {
    const { setActiveProject, activeProject, currentUser } = useAppStore();
    const { user: authUser } = useAuth();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Fetch projects using tRPC
    const { data: projects = [], isLoading } = trpc.projects.getAll.useQuery();

    // Delete mutation
    const deleteProjectMutation = trpc.projects.delete.useMutation({
        onSuccess: () => {
            // Invalidate projects query to refetch
            trpc.useUtils().projects.getAll.invalidate();
            // If the deleted project was active, clear it
            if (activeProject && projects.some((p) => p.id === activeProject.id)) {
                setActiveProject(null);
            }
        },
    });

    // Determine current user role (OAuth or local)
    const currentRole = authUser?.role || currentUser?.role;
    const canUserCreate = currentRole ? canCreate(currentRole as UserRole) : false;
    const canUserModify = currentRole ? canModify(currentRole as UserRole) : false;
    const canUserDelete = currentRole ? canDelete(currentRole as UserRole) : false;

    const handleSetActiveProject = (project: Project) => {
        setActiveProject(project);
    };

    const handleEditProject = (project: Project) => {
        if (!canUserModify) return;
        setEditingProject(project);
    };

    const handleDeleteProject = (id: string) => {
        if (!canUserDelete) return;
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
                {canUserCreate && (
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
                )}
                {!canUserCreate && <div className="text-sm text-muted-foreground">Read-only mode</div>}
            </div>

            {projects.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No projects yet. {canUserCreate ? "Create one to get started." : "Please sign in with appropriate permissions to create projects."}</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <div key={project.id} className={`border rounded-lg p-4 transition-colors ${activeProject?.id === project.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                            <div className="flex justify-between items-start">
                                <h3 className="font-medium text-lg">{project.name}</h3>
                                {(canUserModify || canUserDelete) && (
                                    <div className="space-x-1">
                                        {canUserModify && (
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
                                        )}
                                        {canUserDelete && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="text-destructive hover:text-destructive"
                                                disabled={deleteProjectMutation.isPending}>
                                                {deleteProjectMutation.isPending ? "Deleting..." : "Delete"}
                                            </Button>
                                        )}
                                    </div>
                                )}
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
