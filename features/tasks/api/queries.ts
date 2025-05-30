/**
 * Task query options for React Query v5
 */
export const taskQueriesOptions = {
    /**
     * Options for fetching all tasks
     */
    getAll: {
        staleTime: 1 * 60 * 1000, // 1 minute (tasks change frequently)
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single task by ID
     */
    getById: (id: string) => ({
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching tasks with filters
     */
    getFiltered: (enabled = true) => ({
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
