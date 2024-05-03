import { generateId } from "lucia";
import { eq, count, getTableColumns } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { departmentTable, empProfileTable } from "@/server/db/schema";
// SCHEMAS
import { CreateDepartmentSchema, DeleteDepartmentSchema, UpdateDepartmentSchema } from "@/lib/schema";

export const departmentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(departmentTable),
        employeeCount: count(empProfileTable.empId),
      })
      .from(departmentTable)
      .leftJoin(empProfileTable, eq(empProfileTable.deptId, departmentTable.id))
      .groupBy(departmentTable.name)
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
    }),

  deleteDepartment: protectedProcedure.input(DeleteDepartmentSchema).mutation(async ({ ctx, input }) => {
    try {
      const departmentEmployees = await ctx.db
        .select({ employees: count() })
        .from(empProfileTable)
        .where(eq(empProfileTable.deptId, input.id))

      const employees = departmentEmployees[0]?.employees ?? 0

      if (employees > 0) {
        return {
          status: "FAILED",
          message: `There are ${employees} employee(s) in this department please change their department before deleting.`
        }
      }

      await ctx.db.delete(departmentTable).where(eq(departmentTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Department was deleted"
      }

    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to delete department"
      }
    }

  })
});
