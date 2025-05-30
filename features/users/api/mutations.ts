import { useTRPC } from "@/lib/trpc/context-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * User mutation hooks for React Query v5
 */

export const useCreateUserMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.users.create.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to create user:", error);
            },
        })
    );
};

export const useUpdateUserMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.users.update.mutationOptions({
            onSuccess: (updatedUser: { id: string }) => {
                queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
                queryClient.invalidateQueries({ queryKey: trpc.users.getById.queryKey({ id: updatedUser.id }) });
            },
            onError: (error) => {
                console.error("Failed to update user:", error);
            },
        })
    );
};

export const useDeleteUserMutation = () => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    return useMutation(
        trpc.users.delete.mutationOptions({
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: trpc.users.getAll.queryKey() });
            },
            onError: (error) => {
                console.error("Failed to delete user:", error);
            },
        })
    );
};
