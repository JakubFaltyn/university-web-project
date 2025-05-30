import { cache } from "react";
import connectDB from "./mongodb";
import { autoSeedDatabase } from "./utils/auto-seed";

export const createTRPCContext = cache(async () => {
    /**
     * @see: https://trpc.io/docs/server/context
     */

    // Ensure MongoDB connection - fail fast if not available
    await connectDB();
    console.log("✅ Database connected successfully");

    // Auto-seed database if empty
    await autoSeedDatabase();

    return {
        userId: "user_123",
        // Add any additional context data here (user session, etc.)
    };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
