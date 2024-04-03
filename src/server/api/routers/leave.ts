import { and, eq, gte, lte } from "drizzle-orm";
import { CreateLeaveTypeSchema, UpdateLeaveRequestStatus } from "@/lib/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable,
} from "@/server/db/schema";
import { generateId } from "lucia";
import { getLeavePeriodRange } from "@/lib/utils";

export const leaveRouter = createTRPCRouter({
  createLeaveType: protectedProcedure
    .input(CreateLeaveTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(leaveTypeTable).values({
        id: generateId(15),
        ...input,
      });
    }),
  getLeaveBalance: protectedProcedure.query(async ({ ctx }) => {
    const leaveTypes = await ctx.db.query.leaveTypeTable.findMany();
    const empId = ctx.session.user.id;

    const empLeaveBalance = await Promise.all(
      leaveTypes.map(async (leaveType) => {
        const { renewPeriod, renewPeriodCount, type, daysAllowed } = leaveType;
        const { startDate, endDate } = getLeavePeriodRange({
          renewPeriod,
          renewPeriodCount,
        });
        const leaveBal = await ctx.db.query.leaveBalanceTable.findFirst({
          where: and(
            eq(leaveBalanceTable.empId, empId),
            gte(leaveBalanceTable.createdAt, startDate),
            lte(leaveBalanceTable.createdAt, endDate),
          ),
        });
        if (leaveBal === undefined) return { [type]: daysAllowed };
        return { [type]: leaveBal.balance };
      }),
    );

    const keyValueObject: Record<string, number> = {};

    empLeaveBalance.forEach((item) => {
      const key = Object.keys(item)[0]!;
      const value = item[key];
      keyValueObject[key] = value!;
    });

    const leaveTypesWithBalance = leaveTypes.map((leaveType) => ({
      ...leaveType,
      daysAllowed: keyValueObject[leaveType.type]!,
    }));
    return leaveTypesWithBalance;
  }),
  getLeaveReviewers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "ADMIN"),
    });
  }),
  updateLeaveStatus: protectedProcedure
    .input(UpdateLeaveRequestStatus)
    .mutation(async ({ ctx, input }) => {
      const { status, id, empId } = input;

      await ctx.db
        .update(leaveRequestTable)
        .set({
          status: input.status,
        })
        .where(eq(leaveRequestTable.id, id));
      if (status === "approved") {
        await ctx.db
          .update(leaveBalanceTable)
          .set({
            balance: 10,
          })
          .where(eq(leaveRequestTable.empId, empId));
      }
    }),
});
