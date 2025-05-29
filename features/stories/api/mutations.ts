import { trpc } from "@/lib/trpc";

/**
 * Story mutation options with automatic cache invalidation
 */
export const storyMutations = {
    /**
     * Options for creating a new story
     */
    create: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.stories.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to create story:", error);
            },
        };
    },

    /**
     * Options for updating an existing story
     */
    update: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: (updatedStory: { id: string }) => {
                utils.stories.getAll.invalidate();
                utils.stories.getById.invalidate({ id: updatedStory.id });
            },
            onError: (error: Error) => {
                console.error("Failed to update story:", error);
            },
        };
    },

    /**
     * Options for deleting a story
     */
    delete: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.stories.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to delete story:", error);
            },
        };
    },
};
