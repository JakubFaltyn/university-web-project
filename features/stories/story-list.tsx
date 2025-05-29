"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { StoryForm } from "./forms/story-form";
import { useAppStore } from "@/lib/store";
import { Story } from "@/lib/types";
import { trpc } from "@/lib/trpc";

export function StoryList() {
    const { activeProject } = useAppStore();
    const [editingStory, setEditingStory] = useState<Story | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch stories using tRPC
    const { data: stories = [] } = trpc.stories.getAll.useQuery(activeProject ? { projectId: activeProject.id } : undefined);

    // Mutations
    const utils = trpc.useUtils();
    const deleteStoryMutation = trpc.stories.delete.useMutation({
        onSuccess: () => {
            // Invalidate and refetch stories
            utils.stories.getAll.invalidate();
        },
    });

    const handleDelete = async (storyId: string) => {
        if (confirm("Are you sure you want to delete this story?")) {
            try {
                await deleteStoryMutation.mutateAsync({ id: storyId });
            } catch (error) {
                console.error("Failed to delete story:", error);
            }
        }
    };

    const handleEditSuccess = () => {
        setEditingStory(undefined);
    };

    const handleCreateSuccess = () => {
        setIsCreating(false);
    };

    // Use the active project ID or a default project ID
    const projectId = activeProject?.id || "default-project-id";

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Stories</h2>
                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Story
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Story</DialogTitle>
                        </DialogHeader>
                        <StoryForm projectId={projectId} onSuccess={handleCreateSuccess} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((story: Story) => (
                    <Card key={story.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-semibold line-clamp-2">{story.name}</CardTitle>
                            <div className="flex gap-2">
                                <Dialog open={editingStory?.id === story.id} onOpenChange={(open) => !open && setEditingStory(undefined)}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" onClick={() => setEditingStory(story)} className="h-8 w-8 p-0">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Edit Story</DialogTitle>
                                        </DialogHeader>
                                        <StoryForm story={editingStory} projectId={projectId} onSuccess={handleEditSuccess} />
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(story.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {story.description && <p className="text-sm text-muted-foreground line-clamp-3">{story.description}</p>}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {story.priority}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                    {story.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {stories.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No stories yet. Create your first story to get started!</p>
                </div>
            )}
        </div>
    );
}
