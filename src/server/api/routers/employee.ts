import { generateId } from "lucia";
import { and, eq, getTableColumns, like, or } from "drizzle-orm";
// UTILS
import {
  calculateShiftHours,
  getCurrentDate
} from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/server/helpers";
// DB TABLES
import {
  employeeAttendanceTable,
  employeeDocumentTable,
  employeeLeaveTypeTable,
  employeeProfileTable,
  employeeSalaryComponentTable,
  employeeShiftTable,
  leaveBalanceTable,
  leaveRequestTable,
  leaveTypeTable,
  userTable
} from "@/server/db/schema";
// SCHEMAS
import {
  AttendancePunchOutSchema,
  CreateEmployeeInputSchema,
  GetEmployeeByQueryInput
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

});
