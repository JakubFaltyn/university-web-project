/**
 * User query options for React Query v5
 */
export const userQueriesOptions = {
    /**
     * Options for fetching all users
     */
    getAll: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
    },

    /**
     * Options for fetching a single user by ID
     */
    getById: (id: string) => ({
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled: !!id,
    }),

    /**
     * Options for fetching users with filters
     */
    getFiltered: (enabled = true) => ({
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 2,
        enabled,
    }),
};
