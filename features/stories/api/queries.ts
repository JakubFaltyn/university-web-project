/**
 * Story query options for consistent caching and behavior
 */
export const storyQueries = {
    /**
     * Options for fetching all stories
     */
    all: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single story by ID
     */
    byId: (id: string) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching stories with specific filters
     */
    filtered: (enabled = true) => ({
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
