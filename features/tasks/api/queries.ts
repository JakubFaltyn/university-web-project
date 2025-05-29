/**
 * Task query options for consistent caching and behavior
 */
export const taskQueries = {
    /**
     * Options for fetching all tasks
     */
    all: {
        staleTime: 1 * 60 * 1000, // 1 minute (tasks change frequently)
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single task by ID
     */
    byId: (id: string) => ({
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching tasks with specific filters
     */
    filtered: (enabled = true) => ({
        staleTime: 1 * 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
