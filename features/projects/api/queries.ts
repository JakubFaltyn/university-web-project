/**
 * Project query options for consistent caching and behavior
 */
export const projectQueries = {
    /**
     * Options for fetching all projects
     */
    all: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single project by ID
     */
    byId: (id: string) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching projects with specific filters
     */
    filtered: (enabled = true) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
