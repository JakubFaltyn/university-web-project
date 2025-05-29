"use client";

import { trpc } from "@/lib/trpc";

export function TRPCExample() {
    // Fetch all tasks
    const { data: tasks, isLoading, error } = trpc.tasks.getAll.useQuery();

    // Fetch all projects
    const { data: projects } = trpc.projects.getAll.useQuery();

    // Fetch all stories and users
    const { data: stories } = trpc.stories.getAll.useQuery();
    const { data: users } = trpc.users.getAll.useQuery();

    // Mutations
    const createTaskMutation = trpc.tasks.create.useMutation({
        onSuccess: () => {
            // Invalidate and refetch tasks after creating a new one
            trpc.useUtils().tasks.getAll.invalidate();
        },
    });

    const updateTaskMutation = trpc.tasks.update.useMutation({
        onSuccess: () => {
            // Invalidate and refetch tasks after updating
            trpc.useUtils().tasks.getAll.invalidate();
        },
    });

    const deleteTaskMutation = trpc.tasks.delete.useMutation({
        onSuccess: () => {
            // Invalidate and refetch tasks after deleting
            trpc.useUtils().tasks.getAll.invalidate();
        },
    });

    const initDatabaseMutation = trpc.init.initializeDatabase.useMutation({
        onSuccess: () => {
            // Invalidate and refetch all data after initializing
            trpc.useUtils().tasks.getAll.invalidate();
            trpc.useUtils().projects.getAll.invalidate();
            trpc.useUtils().stories.getAll.invalidate();
            trpc.useUtils().users.getAll.invalidate();
        },
    });

    const handleCreateTask = () => {
        if (projects && projects.length > 0) {
            createTaskMutation.mutate({
                name: "New Task",
                description: "Task created via tRPC",
                priority: "medium",
                storyId: "some-story-id", // You'd get this from your stories
                status: "todo",
            });
        }
    };

    const handleUpdateTask = (taskId: string) => {
        updateTaskMutation.mutate({
            id: taskId,
            status: "done",
        });
    };

    const handleDeleteTask = (taskId: string) => {
        deleteTaskMutation.mutate({ id: taskId });
    };

    const handleInitDatabase = () => {
        initDatabaseMutation.mutate();
    };

    if (isLoading) return <div>Loading tasks...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">tRPC Example</h2>

            <div className="mb-4 space-x-2">
                <button onClick={handleCreateTask} className="bg-blue-500 text-white px-4 py-2 rounded" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </button>
                <button onClick={handleInitDatabase} className="bg-purple-500 text-white px-4 py-2 rounded" disabled={initDatabaseMutation.isPending}>
                    {initDatabaseMutation.isPending ? "Initializing..." : "Initialize Database"}
                </button>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Tasks ({tasks?.length || 0})</h3>
                {tasks?.map((task) => (
                    <div key={task.id} className="border p-3 rounded">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-medium">{task.name}</h4>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">{task.status}</span>
                            </div>
                            <div className="space-x-2">
                                <button onClick={() => handleUpdateTask(task.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm" disabled={updateTaskMutation.isPending}>
                                    Mark Done
                                </button>
                                <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm" disabled={deleteTaskMutation.isPending}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Projects ({projects?.length || 0})</h3>
                {projects?.map((project) => (
                    <div key={project.id} className="border p-2 rounded mt-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Stories ({stories?.length || 0})</h3>
                {stories?.map((story) => (
                    <div key={story.id} className="border p-2 rounded mt-2">
                        <h4 className="font-medium">{story.name}</h4>
                        <p className="text-sm text-gray-600">{story.description}</p>
                        <span className="text-xs bg-blue-200 px-2 py-1 rounded">{story.priority}</span>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold">Users ({users?.length || 0})</h3>
                {users?.map((user) => (
                    <div key={user.id} className="border p-2 rounded mt-2">
                        <h4 className="font-medium">
                            {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <span className="text-xs bg-green-200 px-2 py-1 rounded">{user.role}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
