import { trpc } from "@/lib/trpc";

/**
 * Project mutation options with automatic cache invalidation
 */
export const projectMutations = {
    /**
     * Options for creating a new project
     */
    create: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.projects.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to create project:", error);
            },
        };
    },

    /**
     * Options for updating an existing project
     */
    update: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: (updatedProject: { id: string }) => {
                utils.projects.getAll.invalidate();
                utils.projects.getById.invalidate({ id: updatedProject.id });
            },
            onError: (error: Error) => {
                console.error("Failed to update project:", error);
            },
        };
    },

    /**
     * Options for deleting a project
     */
    delete: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.projects.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to delete project:", error);
            },
        };
    },
};
