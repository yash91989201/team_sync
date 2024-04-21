import { generateId } from "lucia";
import { and, eq, getTableColumns, like, or, sql } from "drizzle-orm";
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
  employeeLeaveTypeTable,
  employeeDocumentTable,
  sessionTable,
  employeeDocumentFileTable,
} from "@/server/db/schema";
// SCHEMAS
import {
  LeaveApplySchema,
  AttendancePunchOutSchema,
  CreateEmployeeInputSchema,
  GetEmployeeByQueryInput,
  DeleteEmployeeSchema,
} from "@/lib/schema";
import { pbClient } from "@/server/pb/config";

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

  getProfile: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.employeeProfileTable.findFirst({
      where: eq(employeeProfileTable.empId, ctx.session.user.id),
      with: {
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
        leaveTypes,
      } = input;

      try {
        const employeeId = generateId(15);
        const hashedPassword = await hashPassword(password);
        const empLeaveTypeIds = leaveTypes.map(({ id }) => id)
        const empLeaveTypeData = leaveTypes.map(({ id }) => ({ empId: employeeId, leaveTypeId: id }))
        const employeeSalaryComponents = salaryComponents.map((salaryComponent) => ({ ...salaryComponent, empId: employeeId }))

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

        await ctx.db.insert(employeeSalaryComponentTable).values(employeeSalaryComponents)

        await ctx.db.insert(employeeLeaveTypeTable).values(empLeaveTypeData)

        if (availableLeaveTypes.length > 0) {
          await Promise.all(
            availableLeaveTypes.map(async (leaveType) => {
              if (!empLeaveTypeIds.includes(leaveType.id)) return

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

  deleteEmployee: protectedProcedure.input(DeleteEmployeeSchema).mutation(async ({ ctx, input }) => {
    const { empId } = input
    try {

      const userData = await ctx.db.query.userTable.findFirst({ where: eq(userTable.id, empId) })

      const employeeDocumentsQuery = ctx.db
        .select({
          id: employeeDocumentTable.id
        })
        .from(employeeDocumentTable)
        .where(eq(employeeDocumentTable.empId, empId))
        .as("employee_documents_id")

      const employeeDocumentFilesId = await ctx.db
        .select({
          id: employeeDocumentFileTable.id
        })
        .from(employeeDocumentFileTable)
        .leftJoin(
          employeeDocumentsQuery,
          eq(employeeDocumentFileTable.empDocumentId, employeeDocumentsQuery.id)
        )

      if (userData === undefined) {
        return {
          status: "FAILED",
          message: "Employee doesnot exists, or has been already deleted"
        }
      }

      await ctx.db.delete(employeeAttendanceTable).where(eq(employeeAttendanceTable.empId, empId))
      await ctx.db.delete(employeeLeaveTypeTable).where(eq(employeeLeaveTypeTable.empId, empId))
      await ctx.db.delete(employeeProfileTable).where(eq(employeeProfileTable.empId, empId))
      await ctx.db.delete(employeeSalaryComponentTable).where(eq(employeeSalaryComponentTable.empId, empId))
      await ctx.db.delete(employeeShiftTable).where(eq(employeeShiftTable.empId, empId))
      await ctx.db.delete(leaveBalanceTable).where(eq(leaveBalanceTable.empId, empId))
      await ctx.db.delete(leaveRequestTable).where(eq(leaveRequestTable.empId, empId))
      await ctx.db.delete(employeeDocumentFileTable).where(eq(employeeDocumentFileTable.empDocumentId, sql`(select id from ${employeeDocumentsQuery})`))
      await ctx.db.delete(employeeDocumentTable).where(eq(employeeDocumentTable.empId, empId))
      await ctx.db.delete(sessionTable).where(eq(sessionTable.userId, empId))
      await ctx.db.delete(userTable).where(eq(userTable.id, empId))

      // delete employee image on pocketbase
      const employeeImageId = userData.imageUrl?.slice(-15)
      if (employeeImageId !== undefined) {
        // eslint-disable-next-line
        await pbClient.collection("user_profile").delete(employeeImageId)
      }

      // delete employee document files on pocketbase
      if (employeeDocumentFilesId.length > 0) {
        await Promise.all(employeeDocumentFilesId.map(async ({ id }) => {
          // eslint-disable-next-line
          await pbClient.collection("employee_document_file").delete(id)
        }))
      }

      return {
        status: "SUCCESS",
        message: "Successfully removed employee and related resources."
      }
    } catch (e) {
      console.log(e)
      return {
        status: "FAILED",
        message: "Unable to remove employee, try again."
      }
    }
  })

});
