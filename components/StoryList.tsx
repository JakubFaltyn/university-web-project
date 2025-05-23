"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Story, StoryStatus, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { StoryForm } from "@/components/ui/forms/StoryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { canCreate, canModify, canDelete } from "@/lib/permissions";

export default function StoryList() {
    const { stories, deleteStory, updateStory, activeProject, users, currentUser } = useAppStore();
    const { data: session } = useSession();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);
    const [filter, setFilter] = useState<StoryStatus | "all">("all");

    // Determine current user role (OAuth or local)
    const currentRole = session?.user?.role || currentUser?.role;
    const canUserCreate = currentRole ? canCreate(currentRole) : false;
    const canUserModify = currentRole ? canModify(currentRole) : false;
    const canUserDelete = currentRole ? canDelete(currentRole) : false;

    const handleEditStory = (story: Story) => {
        if (!canUserModify) return;
        setEditingStory(story);
    };

    const handleDeleteStory = (id: string) => {
        if (!canUserDelete) return;
        if (confirm("Are you sure you want to delete this story? This will also delete all tasks associated with it.")) {
            deleteStory(id);
        }
    };

    const handleCreateFormSuccess = () => {
        setShowCreateDialog(false);
    };

    const handleEditFormSuccess = () => {
        setEditingStory(null);
    };

    const handleStatusChange = (story: Story, status: StoryStatus) => {
        if (!canUserModify) return;
        updateStory({
            ...story,
            status,
        });
    };

    const filteredStories = filter === "all" ? stories : stories.filter((story) => story.status === filter);

    const getOwnerName = (ownerId: string) => {
        const owner = users.find((user) => user.id === ownerId);
        return owner ? `${owner.firstName} ${owner.lastName}` : "Unknown";
    };

    const getPriorityColor = (priority: Story["priority"]) => {
        switch (priority) {
            case "high":
                return "text-red-500";
            case "medium":
                return "text-yellow-500";
            case "low":
                return "text-green-500";
            default:
                return "";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{activeProject ? `Stories: ${activeProject.name}` : "Stories"}</h2>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md overflow-hidden">
                        <button className={`px-3 py-1.5 text-sm ${filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilter("all")}>
                            All
                        </button>
                        <button className={`px-3 py-1.5 text-sm ${filter === "todo" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilter("todo")}>
                            To Do
                        </button>
                        <button className={`px-3 py-1.5 text-sm ${filter === "doing" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilter("doing")}>
                            Doing
                        </button>
                        <button className={`px-3 py-1.5 text-sm ${filter === "done" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setFilter("done")}>
                            Done
                        </button>
                    </div>

                    {activeProject && canUserCreate && (
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button>Add Story</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Story</DialogTitle>
                                </DialogHeader>
                                <StoryForm projectId={activeProject.id} onSuccess={handleCreateFormSuccess} />
                            </DialogContent>
                        </Dialog>
                    )}

                    {activeProject && !canUserCreate && <div className="text-sm text-muted-foreground">Read-only mode</div>}
                </div>
            </div>

            {!activeProject && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">Please select an active project to see its stories.</p>
                </div>
            )}

            {activeProject && filteredStories.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                        {filter === "all" ? (canUserCreate ? "No stories yet. Create one to get started." : "No stories yet.") : `No stories with status "${filter}" found.`}
                    </p>
                </div>
            )}

            {activeProject && filteredStories.length > 0 && (
                <div className="space-y-4">
                    {filteredStories.map((story) => (
                        <div key={story.id} className="border rounded-lg p-4 transition-colors hover:bg-muted/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-lg">{story.name}</h3>
                                        <span className={`text-xs font-semibold uppercase ${getPriorityColor(story.priority)}`}>{story.priority}</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">Owner: {getOwnerName(story.ownerId)}</div>
                                </div>

                                {(canUserModify || canUserDelete) && (
                                    <div className="space-x-1">
                                        {canUserModify && (
                                            <Dialog
                                                open={editingStory?.id === story.id}
                                                onOpenChange={(open) => {
                                                    if (!open) setEditingStory(null);
                                                }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditStory(story)}>
                                                        Edit
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Edit Story</DialogTitle>
                                                    </DialogHeader>
                                                    <StoryForm story={story} projectId={story.projectId} onSuccess={handleEditFormSuccess} />
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        {canUserDelete && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteStory(story.id)} className="text-destructive hover:text-destructive">
                                                Delete
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground text-sm mt-2 mb-3">{story.description}</p>

                            <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">Created: {new Date(story.createdAt).toLocaleDateString()}</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Status:</span>
                                    <select
                                        value={story.status}
                                        onChange={(e) => handleStatusChange(story, e.target.value as StoryStatus)}
                                        className="text-sm border rounded px-2 py-1 bg-background"
                                        disabled={!canUserModify}>
                                        <option value="todo">To Do</option>
                                        <option value="doing">Doing</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
