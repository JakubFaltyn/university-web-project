"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Task, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/ui/forms/TaskForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { canCreate, canModify, canDelete, canAssignTasks } from "@/lib/permissions";

export default function TaskBoard() {
    const { tasks, stories, updateTask, deleteTask, completeTask, assignTask, activeProject, users, currentUser } = useAppStore();
    const { data: session } = useSession();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedStoryId, setSelectedStoryId] = useState<string>("");

    // Determine current user role (OAuth or local)
    const currentRole = session?.user?.role || currentUser?.role;
    const canUserCreate = currentRole ? canCreate(currentRole) : false;
    const canUserModify = currentRole ? canModify(currentRole) : false;
    const canUserDelete = currentRole ? canDelete(currentRole) : false;
    const canUserAssign = currentRole ? canAssignTasks(currentRole) : false;

    // Filter tasks by story if selected
    const filteredTasks = selectedStoryId ? tasks.filter((task) => task.storyId === selectedStoryId) : tasks;

    // Group tasks by status
    const todoTasks = filteredTasks.filter((task) => task.status === "todo");
    const doingTasks = filteredTasks.filter((task) => task.status === "doing");
    const doneTasks = filteredTasks.filter((task) => task.status === "done");

    // Get active project stories
    const activeProjectStories = activeProject ? stories.filter((story) => story.projectId === activeProject.id) : [];

    const handleEditTask = (task: Task) => {
        if (!canUserModify) return;
        setEditingTask(task);
    };

    const handleDeleteTask = (id: string) => {
        if (!canUserDelete) return;
        if (confirm("Are you sure you want to delete this task?")) {
            deleteTask(id);
        }
    };

    const handleCreateFormSuccess = () => {
        setShowCreateDialog(false);
    };

    const handleEditFormSuccess = () => {
        setEditingTask(null);
    };

    const handleAssignTask = (task: Task, userId: string) => {
        if (!canUserAssign) return;
        assignTask(task.id, userId);
    };

    const handleCompleteTask = (task: Task) => {
        if (!canUserModify) return;
        completeTask(task.id);
    };

    const handleStatusChange = (task: Task, status: Task["status"]) => {
        if (!canUserModify) return;
        updateTask({
            ...task,
            status,
        });
    };

    const getAssignedUserName = (assignedUserId?: string) => {
        if (!assignedUserId) return "Unassigned";
        const user = users.find((u) => u.id === assignedUserId);
        return user ? `${user.firstName} ${user.lastName}` : "Unknown";
    };

    const getPriorityClass = (priority: Task["priority"]) => {
        switch (priority) {
            case "high":
                return "border-l-4 border-red-500";
            case "medium":
                return "border-l-4 border-yellow-500";
            case "low":
                return "border-l-4 border-green-500";
            default:
                return "";
        }
    };

    const developerAndDevOpsUsers = users.filter((user) => user.role === "developer" || user.role === "devops");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Task Board</h2>
                <div className="flex items-center gap-2">
                    {activeProjectStories.length > 0 && (
                        <>
                            <select className="border rounded px-3 py-1.5 text-sm bg-background" value={selectedStoryId} onChange={(e) => setSelectedStoryId(e.target.value)}>
                                <option value="">All Stories</option>
                                {activeProjectStories.map((story) => (
                                    <option key={story.id} value={story.id}>
                                        {story.name}
                                    </option>
                                ))}
                            </select>
                            {selectedStoryId && canUserCreate && (
                                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                                    <DialogTrigger asChild>
                                        <Button>Add Task</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Task</DialogTitle>
                                        </DialogHeader>
                                        <TaskForm storyId={selectedStoryId} onSuccess={handleCreateFormSuccess} />
                                    </DialogContent>
                                </Dialog>
                            )}
                            {selectedStoryId && !canUserCreate && <div className="text-sm text-muted-foreground">Read-only mode</div>}
                        </>
                    )}
                </div>
            </div>

            {!activeProject && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">Please select an active project to see tasks.</p>
                </div>
            )}

            {activeProject && activeProjectStories.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">Please create at least one story for this project first.</p>
                </div>
            )}

            {activeProject && activeProjectStories.length > 0 && !selectedStoryId && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">Please select a story to {canUserCreate ? "create or " : ""}view tasks.</p>
                </div>
            )}

            {activeProject && activeProjectStories.length > 0 && selectedStoryId && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Todo Column */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-4">To Do</h3>
                        {todoTasks.length === 0 ? (
                            <div className="text-center p-4 border border-dashed rounded-lg">
                                <p className="text-muted-foreground text-sm">No tasks to do</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {todoTasks.map((task) => (
                                    <div key={task.id} className={`bg-muted/30 rounded-lg p-3 ${getPriorityClass(task.priority)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-sm">{task.name}</h4>
                                            {(canUserModify || canUserDelete) && (
                                                <div className="space-x-1">
                                                    {canUserModify && (
                                                        <Dialog
                                                            open={editingTask?.id === task.id}
                                                            onOpenChange={(open) => {
                                                                if (!open) setEditingTask(null);
                                                            }}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                                                    Edit
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Edit Task</DialogTitle>
                                                                </DialogHeader>
                                                                <TaskForm task={task} storyId={task.storyId} onSuccess={handleEditFormSuccess} />
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    {canUserDelete && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-destructive hover:text-destructive">
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-muted-foreground">{task.estimatedTime}h</span>
                                            <span
                                                className={`font-semibold uppercase ${task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-yellow-500" : "text-green-500"}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex justify-between items-center">
                                            <div className="text-xs text-muted-foreground">{getAssignedUserName(task.assignedUserId)}</div>
                                            {canUserAssign && !task.assignedUserId && (
                                                <select
                                                    onChange={(e) => e.target.value && handleAssignTask(task, e.target.value)}
                                                    className="text-xs border rounded px-1 py-0.5 bg-background"
                                                    defaultValue="">
                                                    <option value="">Assign to...</option>
                                                    {developerAndDevOpsUsers.map((user) => (
                                                        <option key={user.id} value={user.id}>
                                                            {user.firstName} {user.lastName}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Doing Column */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-4">Doing</h3>
                        {doingTasks.length === 0 ? (
                            <div className="text-center p-4 border border-dashed rounded-lg">
                                <p className="text-muted-foreground text-sm">No tasks in progress</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {doingTasks.map((task) => (
                                    <div key={task.id} className={`bg-muted/30 rounded-lg p-3 ${getPriorityClass(task.priority)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-sm">{task.name}</h4>
                                            {(canUserModify || canUserDelete) && (
                                                <div className="space-x-1">
                                                    {canUserModify && (
                                                        <Dialog
                                                            open={editingTask?.id === task.id}
                                                            onOpenChange={(open) => {
                                                                if (!open) setEditingTask(null);
                                                            }}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                                                    Edit
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Edit Task</DialogTitle>
                                                                </DialogHeader>
                                                                <TaskForm task={task} storyId={task.storyId} onSuccess={handleEditFormSuccess} />
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    {canUserDelete && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-destructive hover:text-destructive">
                                                            Delete
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                        <div className="flex justify-between items-center text-xs mb-2">
                                            <span className="text-muted-foreground">{task.estimatedTime}h</span>
                                            <span
                                                className={`font-semibold uppercase ${task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-yellow-500" : "text-green-500"}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">{getAssignedUserName(task.assignedUserId)}</div>
                                        {canUserModify && (
                                            <div className="flex gap-1">
                                                <Button size="sm" variant="outline" onClick={() => handleStatusChange(task, "todo")} className="text-xs">
                                                    Move to Todo
                                                </Button>
                                                <Button size="sm" variant="default" onClick={() => handleCompleteTask(task)} className="text-xs">
                                                    Complete
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Done Column */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-4">Done</h3>
                        {doneTasks.length === 0 ? (
                            <div className="text-center p-4 border border-dashed rounded-lg">
                                <p className="text-muted-foreground text-sm">No completed tasks</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {doneTasks.map((task) => (
                                    <div key={task.id} className={`bg-muted/30 rounded-lg p-3 opacity-75 ${getPriorityClass(task.priority)}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-medium text-sm">{task.name}</h4>
                                            {canUserDelete && (
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)} className="text-destructive hover:text-destructive">
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                        <div className="flex justify-between items-center text-xs mb-2">
                                            <span className="text-muted-foreground">{task.estimatedTime}h</span>
                                            <span
                                                className={`font-semibold uppercase ${task.priority === "high" ? "text-red-500" : task.priority === "medium" ? "text-yellow-500" : "text-green-500"}`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">{getAssignedUserName(task.assignedUserId)}</div>
                                        {task.endDate && <div className="text-xs text-muted-foreground">Completed: {new Date(task.endDate).toLocaleDateString()}</div>}
                                        {canUserModify && (
                                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(task, "doing")} className="text-xs mt-2">
                                                Reopen
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
