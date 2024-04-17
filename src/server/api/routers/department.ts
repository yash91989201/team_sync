import { generateId } from "lucia";
import { sql } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { departmentTable, employeeProfileTable } from "@/server/db/schema";
// SCHEMAS
import { CreateDepartmentSchema } from "@/lib/schema";

export const departmentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const deptWithEmpCount = await ctx.db.query.departmentTable.findMany({
      with: {
        employees: {
          columns: {
            empId: true,
            deptId: true,
          },
          extras: {
            employeeCount: sql<number>`length(${employeeProfileTable.empId})`.as('employee_count'),
          },
        },
      },
    })

    return deptWithEmpCount
  }),
  createNew: protectedProcedure
    .input(CreateDepartmentSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(departmentTable).values({
        id: generateId(15),
        name: input.name,
      });
    }),
});
