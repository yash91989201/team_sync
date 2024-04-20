import { generateId } from "lucia";
import { and, eq, like, or } from "drizzle-orm";
import { isWithinInterval, format } from "date-fns";
// UTILS
import {
  getCurrentDate,
  calculateShiftHours,
  getDateRangeByRenewPeriod,
} from "@/lib/utils";
import { hashPassword } from "@/server/helpers";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  userTable,
  leaveTypeTable,
  leaveRequestTable,
  leaveBalanceTable,
  employeeShiftTable,
  employeeProfileTable,
  employeeAttendanceTable,
  employeeSalaryComponentTable,
} from "@/server/db/schema";
// SCHEMAS
import {
  LeaveApplySchema,
  AttendancePunchOutSchema,
  CreateEmployeeInputSchema,
  GetEmployeeByQueryInput,
} from "@/lib/schema";

export const employeeRouter = createTRPCRouter({
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

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
    });
  }),

  getProfile: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.employeeProfileTable.findFirst({
      where: eq(employeeProfileTable.empId, ctx.session.user.id),
      with: {
        designation: true,
      }
    })
  }),

  createNew: protectedProcedure
    .input(CreateEmployeeInputSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        code,
        name,
        email,
        password,
        role,
        isTeamLead,
        joiningDate,
        deptId,
        designationId,
        salaryComponents,
        salary,
        dob,
        location,
        empBand,
        shiftStart,
        shiftEnd,
        breakMinutes,
        imageUrl,
      } = input;

      try {
        const employeeId = generateId(15);
        const hashedPassword = await hashPassword(password);
        const availableLeaveTypes = await ctx.db.query.leaveTypeTable.findMany();

        // add employee to userTable
        await ctx.db.insert(userTable).values({
          id: employeeId,
          code,
          name,
          email,
          password: hashedPassword,
          role,
          isTeamLead,
          emailVerified: new Date(),
          imageUrl,
        });

        // create profile for employee
        await ctx.db.insert(employeeProfileTable).values({
          empId: employeeId,
          joiningDate,
          deptId,
          designationId,
          salary,
          location,
          dob,
          empBand,
        });

        // create shift timing for the employee
        await ctx.db.insert(employeeShiftTable).values({
          empId: employeeId,
          shiftStart: shiftStart.toLocaleTimeString("en-IN", { hour12: false }),
          shiftEnd: shiftEnd.toLocaleTimeString("en-IN", { hour12: false }),
          breakMinutes,
        });

        const employeeSalaryComponents = salaryComponents.map((salaryComponent) => ({ ...salaryComponent, empId: employeeId }))
        await ctx.db.insert(employeeSalaryComponentTable).values(employeeSalaryComponents)

        if (availableLeaveTypes.length > 0) {
          await Promise.all(
            availableLeaveTypes.map(async (leaveType) => {
              const [newLeaveBalance] = await ctx.db
                .insert(leaveBalanceTable)
                .values({
                  id: generateId(15),
                  leaveTypeId: leaveType.id,
                  empId: employeeId,
                  balance: leaveType.daysAllowed,
                  createdAt: new Date(),
                });
              return newLeaveBalance.affectedRows === 1;
            }),
          );
        }
        return {
          status: "SUCCESS",
          message: "Employee added successfully"
        }
      } catch (error) {
        return {
          status: "FAILED",
          message: "Unable to add employee, please try again"
        }
      }
    }),

  getAttendanceStatus: protectedProcedure.query(async ({ ctx }) => {
    const { id } = ctx.session.user;
    const currentDate = getCurrentDate();

    const employeeAttendance =
      await ctx.db.query.employeeAttendanceTable.findFirst({
        where: and(
          eq(employeeAttendanceTable.empId, id),
          eq(employeeAttendanceTable.date, currentDate),
        ),
      });

    return {
      isAttendanceMarked: !!employeeAttendance,
      isShiftComplete: employeeAttendance?.punchOut !== null,
      attendanceData: employeeAttendance,
    };
  }),

  getLeaveApplications: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: eq(leaveRequestTable.empId, ctx.session.user.id),
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

  punchIn: protectedProcedure.mutation(async ({ ctx }) => {
    const { id } = ctx.session.user;
    const punchIn = new Date().toLocaleTimeString("en-IN", { hour12: false });

    const [attendancePunchInQuery] = await ctx.db
      .insert(employeeAttendanceTable)
      .values({
        id: generateId(15),
        empId: id,
        date: getCurrentDate(),
        punchIn,
      });

    return {
      punchInSuccess: attendancePunchInQuery.affectedRows === 1,
    };
  }),

  punchOut: protectedProcedure
    .input(AttendancePunchOutSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = ctx.session.user;
      const { attendanceId } = input;
      const currentDate = getCurrentDate();
      const punchOut = new Date().toLocaleTimeString("en-IN", {
        hour12: false,
      });

      const attendanceData =
        await ctx.db.query.employeeAttendanceTable.findFirst({
          where: and(
            eq(employeeAttendanceTable.empId, id),
            eq(employeeAttendanceTable.date, currentDate),
          ),
        });

      if (!attendanceData) return { punchOutSuccess: false };

      const shiftHours = calculateShiftHours({
        punchIn: attendanceData?.punchIn,
        punchOut,
      });

      const [attendancePunchOutQuery] = await ctx.db
        .update(employeeAttendanceTable)
        .set({
          punchOut,
          shiftHours,
        })
        .where(eq(employeeAttendanceTable.id, attendanceId));

      return {
        punchOutSuccess: attendancePunchOutQuery.affectedRows === 1,
      };
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
          });

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
          const negativeBalanceMonths = negativeBalance
            .map(({ createdAt }) => format(createdAt, "MMMM"))
            .join(", ");

          return {
            status: "FAILED",
            message: `Not enough leave balance for ${negativeBalanceMonths} month(s)`,
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
      },
    ),

});
