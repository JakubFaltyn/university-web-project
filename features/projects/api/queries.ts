/**
 * Project query options for React Query v5
 */
export const projectQueriesOptions = {
    /**
     * Options for fetching all projects
     */
    getAll: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single project by ID
     */
    getById: (id: string) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching projects with filters
     */
    getFiltered: (enabled = true) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
