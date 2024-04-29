import { generateId } from "lucia";
import { isSameDay } from "date-fns";
import { and, asc, eq } from "drizzle-orm";
// UTILS
import { getDateRangeByRenewPeriod } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// SCHEMAS
import {
  ApproveLeaveSchema,
  CreateLeaveTypeSchema,
  DeleteLeaveTypeSchema,
  RejectLeaveSchema,
  UpdateLeaveTypeSchema,
} from "@/lib/schema";
// DB TABLES
import {
  employeeLeaveTypeTable,
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable,
} from "@/server/db/schema";

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
        employee: {
          columns: {
            password: false
          }
        },
        leaveType: true,
      },
    });
  }),

  getLeaveTypes: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveTypeTable.findMany({
      orderBy: [asc(leaveTypeTable.daysAllowed)]
    });
  }),

  getLeaveBalances: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveBalanceTable.findMany({
      with: {
        leaveType: true,
      },
    });
  }),

  getLeaveReviewers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "ADMIN"),
    });
  }),

  approveLeave: protectedProcedure
    .input(ApproveLeaveSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(leaveRequestTable)
        .set({ status: "approved" })
        .where(eq(leaveRequestTable.id, input.leaveRequestId));
    }),

  rejectLeave: protectedProcedure
    .input(RejectLeaveSchema)
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{ status: "SUCCESS" | "FAILED"; message: string }> => {
        const { leaveRequestId, empId } = input;

        const leaveRequest = await ctx.db.query.leaveRequestTable.findFirst({
          where: eq(leaveRequestTable.id, leaveRequestId),
          with: {
            leaveType: true,
          },
        });
        if (leaveRequest === undefined) {
          return {
            status: "FAILED",
            message:
              "This leave request doesnot exists, or maybe employee has deleted it.",
          };
        }

        const { fromDate, toDate, leaveType } = leaveRequest;
        const { id: leaveTypeId, renewPeriod, renewPeriodCount } = leaveType;

        const leaveDateRange = getDateRangeByRenewPeriod({
          leaveDate: { from: fromDate, to: toDate },
          renewPeriod,
          renewPeriodCount,
        });

        const existingLeaveBalances =
          await ctx.db.query.leaveBalanceTable.findMany({
            where: and(
              eq(leaveBalanceTable.empId, empId),
              eq(leaveBalanceTable.leaveTypeId, leaveTypeId),
            ),
          });

        await Promise.all(
          leaveDateRange.map(async (leaveDate) => {
            const { startDate, days } = leaveDate;
            const { id: leaveBalanceId, balance: currentBalance } =
              existingLeaveBalances.find(({ createdAt }) =>
                isSameDay(createdAt, startDate),
              )!;

            await ctx.db
              .update(leaveBalanceTable)
              .set({
                balance: currentBalance + days,
              })
              .where(eq(leaveBalanceTable.id, leaveBalanceId));
          }),
        );

        await ctx.db
          .update(leaveRequestTable)
          .set({ status: "rejected" })
          .where(eq(leaveRequestTable.id, leaveRequestId));

        return {
          status: "SUCCESS",
          message: "Leave request rejected.",
        };
      },
    ),

  updateLeaveType: protectedProcedure.input(UpdateLeaveTypeSchema).mutation(async ({ ctx, input }) => {
    try {
      await ctx.db.update(leaveTypeTable)
        .set({
          type: input.type
        })
        .where(eq(leaveTypeTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Leave type updated successfully"
      }
    } catch (error) {

      return {
        status: "FAILED",
        message: "Unable to update leave type, please try again"
      }
    }
  }),

  deleteLeaveType: protectedProcedure.input(DeleteLeaveTypeSchema).mutation(async ({ ctx, input }) => {

    try {
      await ctx.db.delete(employeeLeaveTypeTable).where(eq(employeeLeaveTypeTable.leaveTypeId, input.id))

      await ctx.db.delete(leaveBalanceTable).where(eq(leaveBalanceTable.leaveTypeId, input.id))

      await ctx.db.delete(leaveRequestTable).where(eq(leaveRequestTable.leaveTypeId, input.id))

      await ctx.db.delete(leaveTypeTable).where(eq(leaveTypeTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Leave type deleted successfully"
      }
    } catch (error) {

      return {
        status: "FAILED",
        message: "Unable to delete leave type, please try again"
      }
    }
  }),
});
