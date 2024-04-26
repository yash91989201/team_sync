import { eq } from "drizzle-orm";
import { generateId } from "lucia";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { salaryComponentTable, userTable } from "@/server/db/schema";
// SCHEMAS
import { CreateSalaryComponentSchema } from "@/lib/schema";

export const salaryRouter = createTRPCRouter({
  getComponents: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.salaryComponentTable.findMany();
  }),

  createSalaryComponent: protectedProcedure.input(CreateSalaryComponentSchema).mutation(async ({ ctx, input }) => {
    await ctx.db.insert(salaryComponentTable).values({
      id: generateId(15),
      name: input.name
    })
  }),

  getEmployeesSalary: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
      columns: {
        password: false
      },
      with: {
        employeeProfile: true
      }
    })
  })
});
