"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Project } from "@lib/types";
import { useDeleteProjectMutation } from "@/features/projects/api/mutations";

interface DeleteProjectModalProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteProjectModal({ project, open, onOpenChange }: DeleteProjectModalProps) {
    const [confirmText, setConfirmText] = useState("");

    // Delete project mutation
    const deleteProjectMutation = useDeleteProjectMutation();

    const isConfirmValid = confirmText === project.name;

    const handleDelete = async () => {
        if (!isConfirmValid) return;

        try {
            await deleteProjectMutation.mutateAsync({ id: project.id });
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleClose = () => {
        if (!deleteProjectMutation.isPending) {
            setConfirmText("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Project
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the project <span className="font-semibold">&ldquo;{project.name}&rdquo;</span> and all of its data including
                        stories, tasks, and associated files.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Warning</p>
                                <p className="text-sm text-muted-foreground">All stories, tasks, and project data will be permanently deleted. This cannot be undone.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-project-name">
                            Type the project name <span className="font-semibold">&ldquo;{project.name}&rdquo;</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-project-name"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={project.name}
                            disabled={deleteProjectMutation.isPending}
                            className={confirmText && !isConfirmValid ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {confirmText && !isConfirmValid && <p className="text-sm text-destructive">Project name doesn&apos;t match. Please type &ldquo;{project.name}&rdquo; exactly.</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={deleteProjectMutation.isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmValid || deleteProjectMutation.isPending}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
