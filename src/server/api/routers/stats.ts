import { count, eq, sql } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  userTable,
  departmentTable,
  empProfileTable,
  empAttendanceTable,
} from "@/server/db/schema";

export const statsRouter = createTRPCRouter({
  empCount: protectedProcedure.query(async ({ ctx }) => {
    const employees = await ctx.db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.role, "EMPLOYEE"))
    const empCount = employees[0]?.count ?? 0
    return empCount
  }),
  adminCount: protectedProcedure.query(async ({ ctx }) => {
    const admins = await ctx.db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.role, "ADMIN"))
    const adminCount = admins[0]?.count ?? 0
    return adminCount
  }),
  empStaleProfileCount: protectedProcedure.query(async ({ ctx }) => {
    const empProfile = await ctx.db
      .select({ count: count() })
      .from(empProfileTable)
      .where(eq(empProfileTable.isProfileUpdated, false))
    const staleProfileCount = empProfile[0]?.count ?? 0
    return staleProfileCount
  }),
  deptCount: protectedProcedure.query(async ({ ctx }) => {
    const departments = await ctx.db
      .select({ count: count() })
      .from(departmentTable)

    const deptCount = departments[0]?.count ?? 0
    return deptCount
  }),
  attendance: protectedProcedure.query(async ({ ctx }) => {
    const empsPresentSq = ctx.db
      .select()
      .from(empAttendanceTable)
      .where(
        sql`DATE(${empAttendanceTable.date}) = CURDATE()`
      )
      .as("emps_present")

    const empsPresent = await ctx.db
      .select({
        count: count()
      })
      .from(empsPresentSq)

    const empsLateLogin = await ctx.db
      .select({
        count: count()
      })
      .from(empsPresentSq)
      .where(eq(empsPresentSq.shift, "0.75"))

    return {
      empsPresent: empsPresent[0]?.count ?? 0,
      empsLateLogin: empsLateLogin[0]?.count ?? 0
    }
  })
});
