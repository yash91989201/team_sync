import { and, count, eq, getTableColumns, sql, like } from "drizzle-orm";
// UTILS
import { formatDate, getWorkHours } from "@/lib/date-time-utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { empsAttendanceQuery, missingEmpDocsQuery, missingEmpPayslipQuery } from "@/server/db/sql";
// TYPES
import type { EmpsAttendanceStatType } from "@/lib/types";
// DB TABLES
import {
  userTable,
  holidayTable,
  empProfileTable,
  departmentTable,
  leaveRequestTable,
  empAttendanceTable,
} from "@/server/db/schema";
import {
  GetAttendanceInput,
  GetAttendanceByDateInput,
  GetEmpsMonthlyAttendanceInput,
  GetEmployeeCountByJoinDateInput,
  GetMissingEmpPayslipByMonthInput
} from "@/lib/schema";

export const statsRouter = createTRPCRouter({
  /**
  * Returns total employee count
  */
  empCount: protectedProcedure.query(async ({ ctx }) => {
    const employees = await ctx.db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.role, "EMPLOYEE"))
    const empCount = employees[0]?.count ?? 0
    return empCount
  }),
  /**
  * Returns total employee count
  */
  empCountByJoiningDate: protectedProcedure.input(GetEmployeeCountByJoinDateInput).query(async ({ ctx, input }) => {
    const employees = await ctx.db
      .select({ count: count() })
      .from(userTable)
      .innerJoin(empProfileTable, eq(userTable.id, empProfileTable.empId))
      .where(
        and(
          eq(userTable.role, "EMPLOYEE"),
          sql`DATE(${empProfileTable.joiningDate}) <= DATE(${formatDate(input.date)})`,
        )
      )
    const empCount = employees[0]?.count ?? 0
    return empCount
  }),
  /**
  * Returns total admin count
  */
  adminCount: protectedProcedure.query(async ({ ctx }) => {
    const admins = await ctx.db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.role, "ADMIN"))
    const adminCount = admins[0]?.count ?? 0
    return adminCount
  }),
  /**
  * Returns count of those employees who have not updated their profile 
  * i.e not updated default provided password
  */
  empStaleProfileCount: protectedProcedure.query(async ({ ctx }) => {
    const empProfile = await ctx.db
      .select({ count: count() })
      .from(empProfileTable)
      .where(eq(empProfileTable.isProfileUpdated, false))
    const staleProfileCount = empProfile[0]?.count ?? 0
    return staleProfileCount
  }),
  /**
  * Returns total department count
  */
  deptCount: protectedProcedure.query(async ({ ctx }) => {
    const departments = await ctx.db
      .select({ count: count() })
      .from(departmentTable)

    const deptCount = departments[0]?.count ?? 0
    return deptCount
  }),
  /**
  * Returns total employee attendance , employee present, total employees with late login
  * on current date
  */
  attendance: protectedProcedure.input(GetAttendanceInput).query(async ({ ctx, input }) => {
    const todaysAttendanceSq = ctx.db
      .select()
      .from(empAttendanceTable)
      .where(
        sql`DATE(${empAttendanceTable.date}) = DATE(${formatDate(input.date)})`
      )
      .as("todays_attendance")

    const todaysAttendance = await ctx.db
      .select({
        punchIn: todaysAttendanceSq.punchIn,
        punchOut: todaysAttendanceSq.punchOut,
        hours: todaysAttendanceSq.hours,
        shift: todaysAttendanceSq.shift,
        name: userTable.name,
      })
      .from(todaysAttendanceSq)
      .innerJoin(userTable, eq(todaysAttendanceSq.empId, userTable.id))

    const empsPresent = await ctx.db
      .select({
        count: count()
      })
      .from(todaysAttendanceSq)

    const empsLateLogin = await ctx.db
      .select({
        count: count()
      })
      .from(todaysAttendanceSq)
      .where(eq(todaysAttendanceSq.shift, "0.75"))

    return {
      attendance: todaysAttendance,
      empsPresent: empsPresent[0]?.count ?? 0,
      empsLateLogin: empsLateLogin[0]?.count ?? 0,
    }
  }),
  /**
  * Returns employee attendance by given date
  */
  attendanceByDate: protectedProcedure.input(GetAttendanceByDateInput).query(async ({ ctx, input }) => {
    const query = input.query;

    const empAttendanceDynamicQuery = ctx.db
      .select({
        ...getTableColumns(empAttendanceTable),
        employee: {
          name: userTable.name
        }
      })
      .from(empAttendanceTable)
      .innerJoin(
        userTable,
        eq(empAttendanceTable.empId, userTable.id)
      )
      .where(
        sql`DATE(${empAttendanceTable.date}) = DATE(${formatDate(input.date)})`
      )
      .$dynamic()

    if (query !== undefined) {
      await empAttendanceDynamicQuery
        .where(
          and(
            sql`DATE(${empAttendanceTable.date}) = DATE(${formatDate(input.date)})`,
            query.shift !== undefined ? eq(empAttendanceTable.shift, query.shift) : undefined,
            query.employeeName !== undefined ? like(userTable.name, `%${query.employeeName}%`) : undefined,
          )
        )
    }

    const attendance = await empAttendanceDynamicQuery
    return attendance;
  }),
  /**
  * Returns aggregated attendance data 
  * of all employee by given month
  */
  attendanceByMonth: protectedProcedure.input(GetEmpsMonthlyAttendanceInput).query(async ({ ctx, input }) => {
    const empsAttendanceData = empsAttendanceQuery
      .iterator({
        month: formatDate(input.month),
        name: `%${input.name.toLowerCase()}%`
      })

    const monthHolidays = await ctx.db
      .select({
        count: count()
      })
      .from(holidayTable)
      .where(
        sql`MONTH(${holidayTable.date}) = MONTH(${formatDate(input.month)})`
      )
    const holidays = monthHolidays[0]?.count ?? 0

    // aggredate all employees attendances into stats
    const empsAttendanceStat: EmpsAttendanceStatType[] = [];
    for await (const employee of empsAttendanceData) {
      const { employeeAttendance, employeeLeaveRequest, employeeProfile, ...employeeData } = employee

      let approvedLeaves = 0;
      let rejectedLeaves = 0;
      let paidLeaves = 0;
      let unPaidLeaves = 0;
      for (const leaveRequest of employeeLeaveRequest) {
        const { status, leaveType } = leaveRequest
        // count by leave status
        if (status === "approved")
          approvedLeaves++;
        else if (status === "rejected")
          rejectedLeaves++;

        // count paid/unpaid leaves
        if (leaveType.paidLeave)
          paidLeaves++;
        else
          unPaidLeaves++;
      }

      const empAttendanceStat: EmpsAttendanceStatType = {
        ...employeeData,
        workHours: getWorkHours(employeeAttendance),
        workDays: employeeAttendance.length,
        holidays,
        approvedLeaves,
        rejectedLeaves,
        paidLeaves,
        unPaidLeaves,
        department: employeeProfile?.department.name ?? ""
      }
      empsAttendanceStat.push(empAttendanceStat)
    }

    return empsAttendanceStat;
  }),
  /**
  * Returns pending leave requests 
  * that are applied in current month
  */
  pendingLeaveRequests: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: and(
        eq(leaveRequestTable.status, "pending"),
        sql`MONTH(CURRENT_DATE()) BETWEEN MONTH(${leaveRequestTable.fromDate}) AND MONTH(${leaveRequestTable.toDate})`
      ),
      columns: {
        id: true,
        leaveDays: true,
        fromDate: true,
        toDate: true,
      },
      with: {
        employee: {
          columns: {
            name: true,
            imageUrl: true,
          }
        },
        leaveType: {
          columns: {
            type: true,
          }
        },
      }
    })
  }),
  /**
  * Returns document types 
  * that are not added for employees
  */
  missingEmpDocs: protectedProcedure.query(() => {
    return missingEmpDocsQuery.execute()
  }),
  /**
   * Returns all employees payslip by given month
  */
  employeesPayslip: protectedProcedure.input(GetMissingEmpPayslipByMonthInput).query(({ input }) => {
    return missingEmpPayslipQuery.execute({ month: formatDate(input.month) })
  }),
  /**
   * Returns all holidays of current month
  */
  monthHolidays: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.holidayTable.findMany({
      where: sql`MONTH(${holidayTable.date}) = MONTH(CURRENT_DATE())`,
    })
  }),
  /**
   * Returns all employees that are on leave today
  */
  onLeaveEmps: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: and(
        eq(leaveRequestTable.status, "approved"),
        sql`CURRENT_DATE() BETWEEN DATE(${leaveRequestTable.fromDate}) AND DATE(${leaveRequestTable.toDate})`
      ),
      columns: {
        id: true,
        fromDate: true,
        toDate: true,
        leaveDays: true,
      },
      with: {
        employee: {
          columns: {
            name: true,
            imageUrl: true
          }
        },
        leaveType: {
          columns: {
            type: true,
          }
        }
      }
    })
  })
});
