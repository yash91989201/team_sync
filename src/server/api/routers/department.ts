import { generateId } from "lucia";
import { sql, eq } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { departmentTable, employeeProfileTable } from "@/server/db/schema";
// SCHEMAS
import { CreateDepartmentSchema, UpdateDepartmentSchema } from "@/lib/schema";

export const departmentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.departmentTable.findMany({
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
  }),

  createNew: protectedProcedure
    .input(CreateDepartmentSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(departmentTable).values({
        id: generateId(15),
        name: input.name,
      });
    }),

  updateDepartment: protectedProcedure
    .input(UpdateDepartmentSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(departmentTable)
        .set({ name: input.name })
        .where(eq(departmentTable.id, input.id))
    })
});
