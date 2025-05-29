/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as trpcNext from "@trpc/server/adapters/next";
import connectDB from "./mongodb";
import { autoSeedDatabase } from "./utils/auto-seed";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CreateContextOptions {
    // Add any additional context options here
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock the request/response
 */
export async function createContextInner(_opts: CreateContextOptions) {
    // Ensure MongoDB connection - fail fast if not available
    await connectDB();
    console.log("✅ Database connected successfully");

    // Auto-seed database if empty
    await autoSeedDatabase();

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
