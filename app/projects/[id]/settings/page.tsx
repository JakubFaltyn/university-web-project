"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projectQueriesOptions } from "@/features/projects/api/queries";
import { useUpdateProjectMutation } from "@/features/projects/api/mutations";
import { useTRPC } from "@/lib/trpc/context-provider";
import { Trash2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { DeleteProjectModal } from "./delete-project-modal";
import { useQuery } from "@tanstack/react-query";

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const trpc = useTRPC();
    const { setActiveProject } = useAppStore();

    // Fetch project data using tRPC
    const projectId = params.id as string;
    const {
        data: project,
        isLoading,
        error,
    } = useQuery({
        ...trpc.projects.getById.queryOptions({ id: projectId }),
        ...projectQueriesOptions.getById(projectId),
    });

    // Update project mutation
    const updateProjectMutation = useUpdateProjectMutation();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Update form data when project loads
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || "",
            });
            // Set as active project
            setActiveProject(project);
        }
    }, [project, setActiveProject]);

    // Handle project not found or error
    useEffect(() => {
        if (error) {
            console.error("Error loading project:", error);
            router.push("/");
        }
    }, [error, router]);

    const handleSave = async () => {
        if (!project) return;

        try {
            await updateProjectMutation.mutateAsync({
                id: project.id,
                name: formData.name,
                description: formData.description,
            });
            console.log("Project updated successfully");
        } catch (error) {
            console.error("Error updating project:", error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Loading project...</h2>
                    <p className="text-muted-foreground">Please wait while we fetch the project details.</p>
                </div>
            </div>
        );
    }

    // Project not found
    if (!project && !isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Project not found</h2>
                    <p className="text-muted-foreground">The project you&apos;re looking for doesn&apos;t exist.</p>
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
                <p className="text-muted-foreground">Manage settings for &ldquo;{project?.name}&rdquo;</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Update your project&apos;s basic information</CardDescription>
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
                            <Button onClick={handleSave} disabled={updateProjectMutation.isPending}>
                                <Save className="h-4 w-4 mr-2" />
                                {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
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

            {project && <DeleteProjectModal project={project} open={showDeleteModal} onOpenChange={setShowDeleteModal} />}
        </div>
    );
}
