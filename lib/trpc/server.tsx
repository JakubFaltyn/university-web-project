import "server-only"; // <-- ensure this file cannot be imported from the client
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";
import { createTRPCContext } from "@/server/context";
import { makeQueryClient } from "./query-client";
import { appRouter } from "@/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
    ctx: createTRPCContext,
    router: appRouter,
    queryClient: getQueryClient,
});

// Helper functions as suggested in tRPC docs
export function HydrateClient(props: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch(queryOptions: any) {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(queryOptions);
}
