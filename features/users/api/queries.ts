/**
 * User query options for consistent caching and behavior
 */
export const userQueries = {
    /**
     * Options for fetching all users
     */
    all: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single user by ID
     */
    byId: (id: string) => ({
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching users with specific filters
     */
    filtered: (enabled = true) => ({
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
