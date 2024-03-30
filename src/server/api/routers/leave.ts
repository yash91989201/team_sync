import { eq } from "drizzle-orm";
import { CreateLeaveTypeSchema } from "@/lib/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { leaveTypeTable, userTable } from "@/server/db/schema";
import { generateId } from "lucia";

export const leaveRouter = createTRPCRouter({
  createLeaveType: protectedProcedure
    .input(CreateLeaveTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(leaveTypeTable).values({
        id: generateId(15),
        ...input,
      });
    }),
  getLeaveTypes: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveTypeTable.findMany();
  }),
  getLeaveReviewers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "ADMIN"),
    });
  }),
});
