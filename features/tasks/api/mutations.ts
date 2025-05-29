import { trpc } from "@/lib/trpc";

/**
 * Task mutation options with automatic cache invalidation
 */
export const taskMutations = {
    /**
     * Options for creating a new task
     */
    create: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.tasks.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to create task:", error);
            },
        };
    },

    /**
     * Options for updating an existing task
     */
    update: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: (updatedTask: { id: string }) => {
                utils.tasks.getAll.invalidate();
                utils.tasks.getById.invalidate({ id: updatedTask.id });
            },
            onError: (error: Error) => {
                console.error("Failed to update task:", error);
            },
        };
    },

    /**
     * Options for deleting a task
     */
    delete: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.tasks.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to delete task:", error);
            },
        };
    },
};
