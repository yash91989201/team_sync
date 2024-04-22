import { createServerSideHelpers } from "@trpc/react-query/server";
import "server-only";
import superjson from "superjson";
// UITLS
import { appRouter } from "@/server/api/root";
import { createContext } from "@/trpc/server";

// api helper for prefetching on server
export const apiHelper = createServerSideHelpers({
  router: appRouter,
  ctx: await createContext(),
  transformer: superjson,
});

