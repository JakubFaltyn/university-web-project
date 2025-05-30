import { useTRPC } from "@/lib/trpc/context-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Story mutation hooks for React Query v5
 */

export const useCreateStoryMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.stories.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.stories.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to create story:", error);
            },
        })
    );
};

export const useUpdateStoryMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.stories.update.mutationOptions({
            onSuccess: (updatedStory: { id: string }) => {
                queryClient.invalidateQueries({ queryKey: trpc.stories.getAll.queryKey() });
                queryClient.invalidateQueries({ queryKey: trpc.stories.getById.queryKey({ id: updatedStory.id }) });
            },
            onError: (error) => {
                console.error("Failed to update story:", error);
            },
        })
    );
};

export const useDeleteStoryMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.stories.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.stories.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to delete story:", error);
            },
        })
    );
};
