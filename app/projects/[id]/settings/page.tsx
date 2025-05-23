"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DeleteProjectModal } from "./delete-project-modal";

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const { projects, activeProject, updateProject, setActiveProject } = useAppStore();

    const [project, setProject] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const projectId = params.id as string;
        const foundProject = projects.find((p) => p.id === projectId);

        if (foundProject) {
            setProject(foundProject);
            setFormData({
                name: foundProject.name,
                description: foundProject.description || "",
            });

            // Set as active project if it's not already
            if (activeProject?.id !== foundProject.id) {
                setActiveProject(foundProject.id);
            }
        } else {
            // Project not found, redirect to dashboard
            router.push("/");
        }
    }, [params.id, projects, activeProject, setActiveProject, router]);

    const handleSave = async () => {
        if (!project) return;

        setLoading(true);
        try {
            const updatedProject = {
                ...project,
                name: formData.name,
                description: formData.description,
            };

            await updateProject(updatedProject);

            // Show success message (you can add a toast here)
            console.log("Project updated successfully");
        } catch (error) {
            console.error("Error updating project:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Project not found</h2>
                    <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
                    <Button asChild className="mt-4">
                        <Link href="/">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Project Settings</h1>
                <p className="text-muted-foreground">Manage settings for "{project.name}"</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Update your project's basic information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} placeholder="Enter project name" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Enter project description"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleSave} disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Permanently delete this project and all associated data</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <DeleteProjectModal project={project} open={showDeleteModal} onOpenChange={setShowDeleteModal} />
        </div>
    );
}
