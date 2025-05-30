/**
 * Story query options for React Query v5
 */
export const storyQueriesOptions = {
    /**
     * Options for fetching all stories
     */
    getAll: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single story by ID
     */
    getById: (id: string) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching stories with filters
     */
    getFiltered: (enabled = true) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
