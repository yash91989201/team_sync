import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
// TRPC ROUTERS
import { statsRouter } from "@routers/stats";
import { adminRouter } from "@routers/admin";
import { leaveRouter } from "@routers/leave";
import { salaryRouter } from "@routers/salary";
import { payslipRouter } from "@routers/payslip";
import { holidayRouter } from "@routers/holiday";
import { employeeRouter } from "@routers/employee";
import { documentRouter } from "@routers/document";
import { departmentRouter } from "@routers/department";
import { attendanceRouter } from "@routers/attendance";
import { designationRouter } from "@routers/designation";

export const appRouter = createTRPCRouter({
  adminRouter,
  statsRouter,
  leaveRouter,
  salaryRouter,
  holidayRouter,
  payslipRouter,
  employeeRouter,
  documentRouter,
  departmentRouter,
  attendanceRouter,
  designationRouter,
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
