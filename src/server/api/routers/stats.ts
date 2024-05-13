import { count, eq, sql } from "drizzle-orm";
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
  attendance: protectedProcedure.query(async ({ ctx }) => {
    const todaysAttendanceSq = ctx.db
      .select()
      .from(empAttendanceTable)
      .where(
        sql`DATE(${empAttendanceTable.date}) = CURDATE()`
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
  * Returns pending leave requests 
  * that are applied in current month
  */
  pendingLeaveRequests: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.leaveRequestTable.findMany({
      where: sql`MONTH(${leaveRequestTable.appliedOn}) = MONTH(CURDATE())`,
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
   * Returns all employees 
   * whose payslip has not been generated for this month
  */
  missingEmpPayslip: protectedProcedure.query(() => {
    return missingEmpPayslipQuery.execute()
  }),
  /**
   * Returns all holidays of current month
  */
  currentMonthHolidays: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.holidayTable.findMany({
      where: sql`MONTH(${holidayTable.date}) = MONTH(CURDATE())`
    })
  }),
  /**
   * Returns all employees that are on leave today
  */
  onLeaveEmpCount: protectedProcedure.query(async ({ ctx }) => {
    const approvedLeaveRequests = await ctx.db
      .select({
        count: count()
      })
      .from(leaveRequestTable)
      .where(
        sql`CURRENT_DATE() BETWEEN ${leaveRequestTable.fromDate} AND ${leaveRequestTable.toDate} AND ${leaveRequestTable.status} = 'approved'`
      )

    return approvedLeaveRequests[0]?.count ?? 0
  })
});
