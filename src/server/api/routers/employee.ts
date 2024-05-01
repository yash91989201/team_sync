import { generateId } from "lucia";
import { format, isSameDay, isWithinInterval } from "date-fns";
import { and, between, eq, getTableColumns, like, or } from "drizzle-orm";
// UTILS
import {
  calculateShift,
  getDateRangeByRenewPeriod
} from "@/lib/utils";
import { formatDate, } from "@/lib/date-time-utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  employeeAttendanceTable,
  employeeDocumentTable,
  employeeLeaveTypeTable,
  employeeProfileTable,
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable
} from "@/server/db/schema";
// SCHEMAS
import {
  GetAttendanceByMonthInput,
  GetAttendanceStatusInputSchema,
  GetEmployeeByQueryInput,
  LeaveApplySchema,
  LeaveWithdrawInputSchema,
  PunchInInputSchema,
  PunchOutInputSchema
} from "@/lib/schema";

export const employeeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
      columns: {
        password: false,
      },
      with: {
        employeeProfile: {
          with: {
            department: true,
            designation: true,
          }
        },
      }
    });
  }),

  getByCodeOrName: protectedProcedure
    .input(GetEmployeeByQueryInput)
    .query(({ ctx, input }) => {
      return ctx.db.query.userTable.findMany({
        where: and(
          eq(userTable.role, "EMPLOYEE"),
          or(
            like(userTable.name, `%${input.query.toLowerCase()}%`),
            like(userTable.code, `%${input.query.toLowerCase()}%`),
          ),
        ),
      });
    }),

  getData: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.employeeProfileTable.findFirst({
      where: eq(employeeProfileTable.empId, ctx.session.user.id),
      with: {
        employee: true,
        designation: true,
      }
    })
  }),

  getLeaveTypes: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(leaveTypeTable)
      })
      .from(leaveTypeTable)
      .innerJoin(
        employeeLeaveTypeTable,
        and(
          eq(employeeLeaveTypeTable.empId, ctx.session.user.id),
          eq(leaveTypeTable.id, employeeLeaveTypeTable.leaveTypeId)
        )
      )
  }),

  getDocuments: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.employeeDocumentTable.findMany({
      where: eq(employeeDocumentTable.empId, ctx.session.user.id),
      with: {
        documentType: true,
        documentFiles: true,
        employee: {
          columns: {
            password: false,
          }
        }
      }
    })
  }),

  getAttendanceByMonth: protectedProcedure.input(GetAttendanceByMonthInput).query(({ ctx, input }) => {
    return ctx.db.query.employeeAttendanceTable.findMany({
      where: and(
        eq(employeeAttendanceTable.empId, ctx.session.user.id),
        between(employeeAttendanceTable.date, formatDate(input.start), formatDate(input.end))
      ),
    })
  }),

  getLeaveApplications: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: and(
        eq(leaveRequestTable.empId, ctx.session.user.id),
      ),
      with: {
        reviewer: {
          columns: {
            password: false,
          }
        },
        leaveType: true,
      }
    })
  }),

  getApprovedLeaveApplications: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: and(
        eq(leaveRequestTable.empId, ctx.session.user.id),
        eq(leaveRequestTable.status, "approved")
      ),
      with: {
        reviewer: {
          columns: {
            password: false,
          }
        },
        leaveType: true,
      }
    })
  }),

  getAttendanceStatus: protectedProcedure.input(GetAttendanceStatusInputSchema).query(async ({ ctx }) => {
    const { id } = ctx.session.user;

    const employeeAttendance =
      await ctx.db.query.employeeAttendanceTable.findFirst({
        where: and(
          eq(employeeAttendanceTable.empId, id),
          eq(employeeAttendanceTable.date, formatDate()),
        ),
      });

    return {
      isAttendanceMarked: !!employeeAttendance,
      isShiftComplete: employeeAttendance?.punchOut !== null,
      attendanceData: employeeAttendance,
    };
  }),

  punchIn: protectedProcedure.input(PunchInInputSchema).mutation(async ({ ctx, input }): Promise<{ status: "SUCCESS", message: string } | { status: "FAILED", message: string; }> => {
    const { id } = ctx.session.user;
    const { date, time: punchIn } = input

    const [punchInQuery] = await ctx.db
      .insert(employeeAttendanceTable)
      .values({
        id: generateId(15),
        empId: id,
        date,
        punchIn,
      });

    if (punchInQuery.affectedRows === 1) {
      return {
        status: "SUCCESS",
        message: "You have successfully punched in"
      }
    }

    return {
      status: "FAILED",
      message: "Unable to punch in, try again!"
    }
  }),

  punchOut: protectedProcedure
    .input(PunchOutInputSchema)
    .mutation(async ({ ctx, input }): Promise<{ status: "SUCCESS", message: string } | { status: "FAILED", message: string; }> => {

      const { id } = ctx.session.user;
      const { attendanceId, date, time: punchOut } = input;

      const attendanceData =
        await ctx.db.query.employeeAttendanceTable.findFirst({
          where: and(
            eq(employeeAttendanceTable.empId, id),
            eq(employeeAttendanceTable.date, date),
          ),
        });

      if (!attendanceData) {
        return {
          status: "FAILED",
          message: "Unable to punch out, try again!"
        }
      }
      const { punchIn } = attendanceData
      const { shift, hours } = calculateShift({ punchIn, punchOut, });

      const [punchOutQuery] = await ctx.db
        .update(employeeAttendanceTable)
        .set({
          punchOut,
          shift,
          hours
        })
        .where(eq(employeeAttendanceTable.id, attendanceId));

      if (punchOutQuery.affectedRows === 1) {
        return {
          status: "SUCCESS",
          message: "Punched out successfully."
        }
      } else {
        return {
          status: "FAILED",
          message: "Unable to punch in, try again!"
        }
      }


    }),

  leaveApply: protectedProcedure
    .input(LeaveApplySchema)
    .mutation(
      async ({
        ctx,
        input,
      }): Promise<{ status: "FAILED" | "SUCCESS"; message: string }> => {
        const empId = ctx.session.user.id;
        const { leaveDate, reason, leaveTypeId, reviewerId, leaveDays } = input;

        try {
          const leaveType = await ctx.db.query.leaveTypeTable.findFirst({
            where: eq(leaveTypeTable.id, leaveTypeId),
          });

          if (leaveType === undefined) {
            return { status: "FAILED", message: "No such leave type exists" };
          }

          const { renewPeriod, renewPeriodCount, daysAllowed } = leaveType;
          const leaveDateRange = getDateRangeByRenewPeriod({
            leaveDate,
            renewPeriod,
            renewPeriodCount,
          });

          const existingLeaveBalances =
            await ctx.db.query.leaveBalanceTable.findMany({
              where: and(
                eq(leaveBalanceTable.empId, empId),
                eq(leaveBalanceTable.leaveTypeId, leaveTypeId),
              ),
            })

          const updatedLeaveBalances = leaveDateRange.map((leaveDate) => {
            const existingLeaveBalance = existingLeaveBalances.find(
              ({ createdAt }) =>
                isWithinInterval(createdAt, {
                  start: leaveDate.startDate,
                  end: leaveDate.endDate,
                }),
            );
            if (existingLeaveBalance === undefined) {
              return {
                id: generateId(15),
                createdAt: leaveDate.startDate,
                balance: daysAllowed - leaveDate.days,
                empId,
                leaveTypeId,
                status: "create",
              };
            }
            return {
              id: existingLeaveBalance.id,
              createdAt: leaveDate.startDate,
              balance: existingLeaveBalance.balance - leaveDate.days,
              empId,
              leaveTypeId,
              status: "update",
            };
          });


          const negativeBalance = updatedLeaveBalances.filter(
            ({ balance }) => balance < 0,
          );

          if (negativeBalance.length > 0) {
            const negativeBalancePeriods = negativeBalance
              .map(({ createdAt }) => {
                const dateFormatter = leaveType.renewPeriod === "month" ? "MMM" : "yyyy"
                return format(createdAt, dateFormatter)
              })
              .join(", ");

            return {
              status: "FAILED",
              message: `Not enough leave balance for ${negativeBalancePeriods} ${leaveType.renewPeriod}${negativeBalance.length === 1 ? "" : "s"}`,
            };
          }

          await ctx.db.insert(leaveRequestTable).values({
            id: generateId(15),
            leaveTypeId,
            fromDate: leaveDate.from,
            toDate: leaveDate.to,
            leaveDays,
            reason,
            appliedOn: new Date(),
            status: "pending",
            empId,
            reviewerId,
          });

          await Promise.all(
            updatedLeaveBalances.map(async (leaveBalance) => {
              if (leaveBalance.status === "update") {
                await ctx.db
                  .update(leaveBalanceTable)
                  .set({ balance: leaveBalance.balance })
                  .where(eq(leaveBalanceTable.id, leaveBalance.id));
              } else {
                const { status: _, ...leaveBalanceData } = leaveBalance;
                await ctx.db.insert(leaveBalanceTable).values(leaveBalanceData);
              }
            }),
          );

          return {
            status: "SUCCESS",
            message: "Leave applied",
          };
        } catch (error) {
          return {
            status: "FAILED",
            message: "Leave applied",
          };
        }
      },
    ),

  leaveWithdraw: protectedProcedure.input(LeaveWithdrawInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const empId = ctx.session.user.id
      const { leaveRequestId } = input;

      const leaveRequest = await ctx.db.query.leaveRequestTable.findFirst({
        where: and(
          eq(leaveRequestTable.empId, empId),
          eq(leaveRequestTable.id, leaveRequestId),
        ),
        with: {
          leaveType: true,
        },
      });

      if (leaveRequest === undefined) {
        return {
          status: "FAILED",
          message:
            "This leave request doesnot exists, or maybe admin has deleted it.",
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
        .set({ status: "withdrawn" })
        .where(eq(leaveRequestTable.id, leaveRequestId));

      return {
        status: "SUCCESS",
        message: "Leave request withdrawn",
      };
    }
    catch (error) {
      return {
        status: "FAILED",
        message:
          "This leave request doesnot exists, or maybe employee has deleted it.",
      };
    }
  })
});
