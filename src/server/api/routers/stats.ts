import { and, count, eq, getTableColumns, sql } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { missingEmpDocsQuery, missingEmpPayslipQuery } from "@/server/db/sql";
// DB TABLES
import {
  userTable,
  holidayTable,
  empProfileTable,
  departmentTable,
  leaveRequestTable,
  empAttendanceTable,
} from "@/server/db/schema";
import { GetAttendanceByDateInput, GetAttendanceInput, GetEmployeeCountByJoinDateInput, GetMissingEmpPayslipByMonthInput } from "@/lib/schema";
import { formatDate } from "@/lib/date-time-utils";

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
  empCountByJoinDate: protectedProcedure.input(GetEmployeeCountByJoinDateInput).query(async ({ ctx, input }) => {
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
          ...getTableColumns(userTable),
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
      if (query.shift !== undefined) {
        await empAttendanceDynamicQuery
          .where(
            and(
              sql`DATE(${empAttendanceTable.date}) = DATE(${formatDate(input.date)})`,
              eq(empAttendanceTable.shift, query.shift)
            )
          )
      }
    }

    const attendance = await empAttendanceDynamicQuery
    return attendance;
  }),
  /**
  * Returns pending leave requests 
  * that are applied in current month
  */
  pendingLeaveRequests: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: and(
        eq(leaveRequestTable.status, "pending"),
        sql`MONTH(${leaveRequestTable.appliedOn}) = MONTH(CURRENT_DATE())`
      ),
      with: {
        employee: true,
        leaveType: true,
        reviewer: true
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
      where: sql`MONTH(${holidayTable.date}) = MONTH(CURRENT_DATE())`
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
      with: {
        employee: {
          columns: {
            password: false
          }
        },
        leaveType: true
      }
    })
  })
});
