"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/ui/forms/ProjectForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { canCreate, canModify, canDelete } from "@/lib/permissions";

export default function ProjectList() {
    const { projects, deleteProject, setActiveProject, activeProject, currentUser } = useAppStore();
    const { data: session } = useSession();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Determine current user role (OAuth or local)
    const currentRole = session?.user?.role || currentUser?.role;
    const canUserCreate = currentRole ? canCreate(currentRole) : false;
    const canUserModify = currentRole ? canModify(currentRole) : false;
    const canUserDelete = currentRole ? canDelete(currentRole) : false;

    const handleSetActiveProject = (project: Project) => {
        setActiveProject(project.id);
    };

    const handleEditProject = (project: Project) => {
        if (!canUserModify) return;
        setEditingProject(project);
    };

    const handleDeleteProject = (id: string) => {
        if (!canUserDelete) return;
        if (confirm("Are you sure you want to delete this project? This will also delete all stories and tasks associated with it.")) {
            deleteProject(id);
        }
    };

    const handleCreateFormSuccess = () => {
        setShowCreateDialog(false);
    };

    const handleEditFormSuccess = () => {
        setEditingProject(null);
    };

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
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(project.id)} className="text-destructive hover:text-destructive">
                                                Delete
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
