import { and, eq } from "drizzle-orm";
import { CreateLeaveTypeSchema, UpdateLeaveRequestStatus } from "@/lib/schema";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable,
} from "@/server/db/schema";
import { generateId } from "lucia";
import { isWithinInterval } from "date-fns";
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
  getAllLeaveRequests: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      with: {
        employee: true,
        leaveType: true,
      },
    });
  }),
  getLeaveBalance: protectedProcedure.query(async ({ ctx }) => {
    const empId = ctx.session.user.id;

    const leaveTypes = await ctx.db.query.leaveTypeTable.findMany({
      with: {
        leaveBalance: {
          where: eq(leaveBalanceTable.empId, empId),
        },
      },
    });

    const leaveTypesWithBalance = leaveTypes.map((leaveType) => {
      const { leaveBalance: leaveBalances, ...leaveTypeWithoutBal } = leaveType;
      if (leaveBalances.length === 0)
        return { ...leaveTypeWithoutBal, balance: leaveType.daysAllowed };

      if (leaveType.carryOver) {
        const totalLeaveBalance = leaveBalances.reduce(
          (totalBalance, leaveBalance) => totalBalance + leaveBalance.balance,
          0,
        );
        return { ...leaveTypeWithoutBal, balance: totalLeaveBalance };
      }

      const { startDate, endDate } = getLeavePeriodRange({
        renewPeriod: leaveType.renewPeriod,
        renewPeriodCount: leaveType.renewPeriodCount,
      });

      const validLeaveBalances = leaveBalances.filter(({ createdAt }) =>
        isWithinInterval(createdAt, { start: startDate, end: endDate }),
      );

      const totalLeaveBalance = validLeaveBalances.reduce(
        (total, { balance }) => total + balance,
        0,
      );

      return {
        ...leaveTypeWithoutBal,
        balance: totalLeaveBalance,
      };
    });

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
      const { status, id, empId, leaveType, leaveDays } = input;

      await ctx.db
        .update(leaveRequestTable)
        .set({
          status,
        })
        .where(eq(leaveRequestTable.id, id));

      const leaveBalance = await ctx.db.query.leaveBalanceTable.findFirst({
        where: and(
          eq(leaveBalanceTable.leaveTypeId, leaveType.id),
          eq(leaveBalanceTable.empId, empId),
        ),
      });
      if (leaveBalance === undefined) return;
      const { id: leaveBalId, balance } = leaveBalance;
      if (balance === 0) return;

      if (status === "rejected") {
        await ctx.db
          .update(leaveBalanceTable)
          .set({ balance: balance + leaveDays })
          .where(eq(leaveBalanceTable.id, leaveBalId));
      }
      await ctx.db
        .update(leaveRequestTable)
        .set({ status })
        .where(eq(leaveRequestTable.id, id));
    }),
});
