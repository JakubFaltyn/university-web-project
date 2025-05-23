"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Project } from "@/lib/types";

interface DeleteProjectModalProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteProjectModal({ project, open, onOpenChange }: DeleteProjectModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { deleteProject } = useAppStore();
    const router = useRouter();

    const isConfirmValid = confirmText === project.name;

    const handleDelete = async () => {
        if (!isConfirmValid) return;

        setIsDeleting(true);
        try {
            await deleteProject(project.id);

            // Close modal and redirect to dashboard
            onOpenChange(false);
            router.push("/");
        } catch (error) {
            console.error("Error deleting project:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
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
                        This action cannot be undone. This will permanently delete the project <span className="font-semibold">"{project.name}"</span> and all of its data including stories, tasks, and
                        associated files.
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
                            Type the project name <span className="font-semibold">"{project.name}"</span> to confirm:
                        </Label>
                        <Input
                            id="confirm-project-name"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={project.name}
                            disabled={isDeleting}
                            className={confirmText && !isConfirmValid ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {confirmText && !isConfirmValid && <p className="text-sm text-destructive">Project name doesn't match. Please type "{project.name}" exactly.</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmValid || isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
