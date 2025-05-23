import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
// TRPC ROUTERS
import { leaveRouter } from "@/server/api/routers/leave";
import { employeeRouter } from "@/server/api/routers/employee";
import { documentRouter } from "@/server/api/routers/document";
import { departmentRouter } from "@/server/api/routers/department";
import { designationRouter } from "@/server/api/routers/designation";

export const appRouter = createTRPCRouter({
  departmentRouter,
  designationRouter,
  employeeRouter,
  leaveRouter,
  documentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
