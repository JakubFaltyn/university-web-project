/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as trpcNext from "@trpc/server/adapters/next";
import connectDB from "./mongodb";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CreateContextOptions {
    // Add any additional context options here
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock the request/response
 */
export async function createContextInner(_opts: CreateContextOptions) {
    // Ensure MongoDB connection
    await connectDB();

    return {
        // Add any context data here (user session, etc.)
    };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export async function createContext(): Promise<Context> {
    // for API-response caching see https://trpc.io/docs/v11/caching

    return await createContextInner({});
}
