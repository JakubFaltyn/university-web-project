import { useTRPC } from "@/lib/trpc/context-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Project mutation hooks for React Query v5
 */

export const useCreateProjectMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.projects.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.projects.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to create project:", error);
            },
        })
    );
};

export const useUpdateProjectMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.projects.update.mutationOptions({
            onSuccess: (updatedProject: { id: string }) => {
                queryClient.invalidateQueries({ queryKey: trpc.projects.getAll.queryKey() });
                queryClient.invalidateQueries({ queryKey: trpc.projects.getById.queryKey({ id: updatedProject.id }) });
            },
            onError: (error) => {
                console.error("Failed to update project:", error);
            },
        })
    );
};

export const useDeleteProjectMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.projects.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.projects.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to delete project:", error);
            },
        })
    );
};
