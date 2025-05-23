"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface NewProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
    const { createProject, setActiveProject } = useAppStore();
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError("Project name is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const newProject = await createProject({
                name: formData.name.trim(),
                description: formData.description.trim(),
                status: "active",
            });

            // Set the newly created project as active
            if (newProject) {
                await setActiveProject(newProject.id);
            }

            // Close modal and reset form
            handleClose();
            
        } catch (err) {
            console.error("Error creating project:", err);
            setError("Failed to create project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({ name: "", description: "" });
            setError("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Set up a new project to organize your work. The project will be set as active after creation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name">
                            Project Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="project-name"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            placeholder="Enter project name"
                            disabled={loading}
                            className={error ? "border-destructive" : ""}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                            id="project-description"
                            value={formData.description}
                            onChange={(e) => handleInputChange("description", e.target.value)}
                            placeholder="Enter project description (optional)"
                            rows={3}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !formData.name.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            {loading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 