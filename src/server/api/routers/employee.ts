import { generateId } from "lucia";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/server/helpers";
// SCHEMAS
import { employeeProfileTable, userTable } from "@/server/db/schema";
import { CreateEmployeeSchema } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const employeeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
    });
  }),
  createNew: protectedProcedure
    .input(CreateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        code,
        name,
        email,
        password,
        role,
        isTeamLead,
        joiningDate,
        dept,
        designation,
        salary,
        paidLeaves,
        location,
        empBand,
      } = input;

      const employeeId = generateId(15);
      const hashedPassword = await hashPassword(password);
      await ctx.db.insert(userTable).values({
        id: employeeId,
        code,
        name,
        email,
        password: hashedPassword,
        role,
        isTeamLead,
        emailVerified: new Date(),
      });

      await ctx.db.insert(employeeProfileTable).values({
        empId: employeeId,
        joiningDate,
        dept,
        designation,
        salary,
        paidLeaves,
        location,
        empBand,
      });
    }),
});
