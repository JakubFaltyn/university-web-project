"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ProjectForm } from "./forms/project-form";

interface NewProjectModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
    const handleSuccess = () => {
        onOpenChange?.(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>Set up a new project to organize your work.</DialogDescription>
                </DialogHeader>

                <ProjectForm onSuccess={handleSuccess} onCancel={() => onOpenChange?.(false)} />
            </DialogContent>
        </Dialog>
    );
}
