import "server-only";
import { cache } from "react";
import superjson from "superjson";
import { headers } from "next/headers";
import { createServerSideHelpers } from "@trpc/react-query/server";
// UITLS
import { appRouter } from "@/server/api/root";
import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

// api helper for prefetching on server
export const createApiHelper = async () => {
  return createServerSideHelpers({
    router: appRouter,
    ctx: await createContext(),
    transformer: superjson,
  })
}

export const api = createCaller(createContext);
