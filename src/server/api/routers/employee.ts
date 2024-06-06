import { generateId } from "lucia";
import { format, isSameDay, isWithinInterval } from "date-fns";
import { and, between, eq, getTableColumns, like, or, sql } from "drizzle-orm";
// UTILS
import {
  calculateShift,
  getDateRangeByRenewPeriod
} from "@/lib/utils";
import { formatTime, parseTime, toUTC, } from "@/lib/date-time-utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  empAttendanceTable,
  empDocumentTable,
  empLeaveTypeTable,
  empProfileTable,
  empShiftTable,
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
            like(userTable.name, `%${input.query}%`),
            like(userTable.code, `%${input.query}%`),
          ),
        ),
        columns: {
          id: true,
          name: true,
          code: true,
        }
      });
    }),

  getData: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.empProfileTable.findFirst({
      where: eq(empProfileTable.empId, ctx.session.user.id),
      with: {
        employee: true,
        designation: true,
      }
    })
  }),

  getShift: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.empShiftTable.findFirst({ where: eq(empShiftTable.empId, ctx.session.user.id) })
  }),

  getLeaveTypes: protectedProcedure.query(({ ctx }) => {
    return ctx.db
      .select({
        ...getTableColumns(leaveTypeTable)
      })
      .from(leaveTypeTable)
      .innerJoin(
        empLeaveTypeTable,
        and(
          eq(empLeaveTypeTable.empId, ctx.session.user.id),
          eq(leaveTypeTable.id, empLeaveTypeTable.leaveTypeId)
        )
      )
  }),

  getDocuments: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.empDocumentTable.findMany({
      where: eq(empDocumentTable.empId, ctx.session.user.id),
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
    return ctx.db.query.empAttendanceTable.findMany({
      where: and(
        eq(empAttendanceTable.empId, ctx.session.user.id),
        between(empAttendanceTable.date, input.start, input.end)
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
      await ctx.db.query.empAttendanceTable.findFirst({
        where: and(
          eq(empAttendanceTable.empId, id),
          sql`DATE(${empAttendanceTable.date}) = CURRENT_DATE()`,
        ),
      });

    return {
      isAttendanceMarked: !!employeeAttendance,
      isShiftComplete: employeeAttendance?.punchOut !== null,
      attendanceData: employeeAttendance,
    };
  }),

  punchIn:
    protectedProcedure
      .input(PunchInInputSchema)
      .mutation(async ({ ctx, input }):
        Promise<ProcedureStatusType> => {
        const { id } = ctx.session.user;
        const { date } = input

        try {
          const empShift = await ctx.db.query.empShiftTable.findFirst({
            where: eq(empShiftTable.empId, id),
            columns: {
              shiftStart: true
            }
          })

          if (empShift === undefined) {
            throw new Error("Employee shift timming not defined.")
          }

          const empShiftStart = toUTC(parseTime(empShift.shiftStart))
          const shiftStart = toUTC(new Date())
          shiftStart.setHours(
            empShiftStart.getHours(),
            empShiftStart.getMinutes(),
            empShiftStart.getSeconds()
          )

          const isLateLogin = toUTC(date).getTime() > shiftStart.getTime()

          await ctx.db
            .insert(empAttendanceTable)
            .values({
              id: generateId(15),
              empId: id,
              date,
              punchIn: formatTime(date),
              shift: isLateLogin ? "0.75" : null
            });

          return {
            status: "SUCCESS",
            message: isLateLogin ? `Your shift time is ${empShift.shiftStart}, late login will be applied.` : "You have successfully punched in."
          }
        } catch (error) {
          if (error instanceof Error) {
            return {
              status: "FAILED",
              message: error.message
            }
          } else {
            return {
              status: "FAILED",
              message: "Unable to punch in, try again!"
            }
          }
        }
      }),

  punchOut: protectedProcedure
    .input(PunchOutInputSchema)
    .mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {

      const { id } = ctx.session.user;
      const { attendanceId, date } = input;
      const punchOut = formatTime(date)

      try {
        const attendanceData =
          await ctx.db.query.empAttendanceTable.findFirst({
            where: eq(empAttendanceTable.empId, id)
          });

        if (attendanceData === undefined) {
          throw new Error("Punch In not initiated.")
        }

        const { punchIn } = attendanceData
        const { shift, hours } = calculateShift({ punchIn, punchOut, });

        await ctx.db
          .update(empAttendanceTable)
          .set({
            punchOut,
            shift,
            hours
          })
          .where(eq(empAttendanceTable.id, attendanceId));

        return {
          status: "SUCCESS",
          message: "Punched out successfully."
        }
      } catch (error) {
        if (error instanceof Error) {
          return {
            status: "FAILED",
            message: error.message
          }
        } else {
          return {
            status: "FAILED",
            message: "Unable to punch out, try again!"
          }
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
              ...existingLeaveBalance,
              balance: existingLeaveBalance.balance - leaveDate.days,
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
            updatedLeaveBalances.map(async ({ status, ...leaveBalanceData }) => {
              if (status === "update") {
                await ctx.db
                  .update(leaveBalanceTable)
                  .set({ balance: leaveBalanceData.balance })
                  .where(eq(leaveBalanceTable.id, leaveBalanceData.id));
              } else {
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
