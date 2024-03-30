import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
// TRPC routers
import { departmentRouter } from "@/server/api/routers/department";
import { designationRouter } from "./routers/designation";
import { employeeRouter } from "./routers/employee";
import { leaveRouter } from "./routers/leave";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  departmentRouter,
  designationRouter,
  employeeRouter,
  leaveRouter,
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
