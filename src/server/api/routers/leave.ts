import { generateId } from "lucia";
import { isSameDay } from "date-fns";
import { and, asc, eq, getTableColumns, sql, like } from "drizzle-orm";
// UTILS
import { getDateRangeByRenewPeriod } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// SCHEMAS
import {
  ApproveLeaveSchema,
  CreateLeaveTypeSchema,
  DeleteLeaveTypeSchema,
  GetLeaveRequestsInput,
  RejectLeaveSchema,
  UpdateLeaveTypeSchema,
} from "@/lib/schema";
// DB TABLES
import {
  empLeaveTypeTable,
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable,
} from "@/server/db/schema";

export const leaveRouter = createTRPCRouter({
  /**
  * Takes CreateLeaveTypeSchema and 
  * creates a new leave type
  */
  createLeaveType: protectedProcedure
    .input(CreateLeaveTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(leaveTypeTable).values({
        id: generateId(15),
        ...input,
      });
    }),
  /**
  * Returns all leave requests by given query input
  */
  getLeaveRequests: protectedProcedure.input(GetLeaveRequestsInput).query(async ({ ctx, input }) => {
    const leaveRequestsDynamicQuery = ctx.db
      .select({
        ...getTableColumns(leaveRequestTable),
        leaveType: getTableColumns(leaveTypeTable),
        employee: {
          name: userTable.name
        },
      })
      .from(leaveRequestTable)
      .innerJoin(userTable,
        and(
          eq(userTable.role, "EMPLOYEE"),
          eq(userTable.id, leaveRequestTable.empId)
        )
      )
      .innerJoin(
        leaveTypeTable,
        eq(leaveRequestTable.leaveTypeId, leaveTypeTable.id)
      )

    if (input !== undefined) {
      await leaveRequestsDynamicQuery
        .where(
          and(
            input.month !== undefined ?
              sql`MONTH(${input.month}) BETWEEN MONTH(${leaveRequestTable.fromDate}) AND MONTH(${leaveRequestTable.toDate})`
              : undefined,
            input.status !== undefined ? eq(leaveRequestTable.status, input.status) : undefined,
            input.isPaid !== undefined ? eq(leaveTypeTable.paidLeave, input.isPaid) : undefined,
            input.employeeName !== undefined ? like(userTable.name, `%${input.employeeName}%`) : undefined,
          )
        )
    }

    const leaveRequests = await leaveRequestsDynamicQuery
    return leaveRequests;
  }),
  /**
  * Returns all leave types by increasing number of days allowed
  */
  getLeaveTypes: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveTypeTable.findMany({
      orderBy: [asc(leaveTypeTable.daysAllowed)]
    });
  }),
  /**
  * Returns leave balances along with leaveType
  */
  getLeaveBalances: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveBalanceTable.findMany({
      with: {
        leaveType: true,
      },
    });
  }),
  /**
  * Returns leave reviewers 
  */
  getLeaveReviewers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "ADMIN"),
    });
  }),
  /**
  * Returns takes in leaveRequestId and accepts 
  * an employees leave
  */
  approveLeave: protectedProcedure
    .input(ApproveLeaveSchema)
    .mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {
      try {
        await ctx.db
          .update(leaveRequestTable)
          .set({ status: "approved" })
          .where(eq(leaveRequestTable.id, input.leaveRequestId));
        return {
          status: "SUCCESS",
          message: "Leave approved"
        }
      } catch (error) {
        return {
          status: "FAILED",
          message: "Unable to approve leave, try again"
        }
      }
    }),
  /**
  * Returns takes in leaveRequestId and rejects 
  * an employees leave
  */
  rejectLeave: protectedProcedure
    .input(RejectLeaveSchema)
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<ProcedureStatusType> => {
        const { leaveRequestId } = input;

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
              eq(leaveBalanceTable.empId, leaveRequest.empId),
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
  /**
  * Takes leave type data, leaveTypeId and updates leave type 
  */
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
  /**
  * Takes leaveTypeId and deletes leave type 
  */
  deleteLeaveType: protectedProcedure.input(DeleteLeaveTypeSchema).mutation(async ({ ctx, input }) => {

    try {
      await ctx.db.delete(empLeaveTypeTable).where(eq(empLeaveTypeTable.leaveTypeId, input.id))
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
