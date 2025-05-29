import { trpc } from "@/lib/trpc";

/**
 * User mutation options with automatic cache invalidation
 */
export const userMutations = {
    /**
     * Options for creating a new user
     */
    create: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.users.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to create user:", error);
            },
        };
    },

    /**
     * Options for updating an existing user
     */
    update: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: (updatedUser: { id: string }) => {
                utils.users.getAll.invalidate();
                utils.users.getById.invalidate({ id: updatedUser.id });
            },
            onError: (error: Error) => {
                console.error("Failed to update user:", error);
            },
        };
    },

    /**
     * Options for deleting a user
     */
    delete: () => {
        const utils = trpc.useUtils();
        return {
            onSuccess: () => {
                utils.users.getAll.invalidate();
            },
            onError: (error: Error) => {
                console.error("Failed to delete user:", error);
            },
        };
    },
};
