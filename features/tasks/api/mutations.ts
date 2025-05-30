import { useTRPC } from "@/lib/trpc/context-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Task mutation hooks for React Query v5
 */

export const useCreateTaskMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.tasks.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.tasks.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to create task:", error);
            },
        })
    );
};

export const useUpdateTaskMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.tasks.update.mutationOptions({
            onSuccess: (updatedTask: { id: string }) => {
                queryClient.invalidateQueries({ queryKey: trpc.tasks.getAll.queryKey() });
                queryClient.invalidateQueries({ queryKey: trpc.tasks.getById.queryKey({ id: updatedTask.id }) });
            },
            onError: (error) => {
                console.error("Failed to update task:", error);
            },
        })
    );
};

export const useDeleteTaskMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.tasks.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.tasks.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to delete task:", error);
            },
        })
    );
};
