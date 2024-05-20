import { eq, or, and, between, asc, sql } from "drizzle-orm";
import { eachDayOfInterval, isSameDay, isSunday, isWithinInterval } from "date-fns";
// UTILS
import { formatDate } from "@/lib/date-time-utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { empAttendanceTable, holidayTable, leaveRequestTable } from "@/server/db/schema";
// SCHEMAS
import { GetAttendanceGapsInput } from "@/lib/schema";

export const attendanceRouter = createTRPCRouter({
  getAttendanceGaps: protectedProcedure.input(GetAttendanceGapsInput).query(async ({ ctx, input }) => {
    const { start, end } = input
    const emp = ctx.session.user

    const holidays = await ctx.db.query.holidayTable.findMany({
      where: between(holidayTable.date, start, end),
      columns: {
        date: true,
      }
    })

    const approvedLeaves = await ctx.db.query.leaveRequestTable.findMany({
      where: and(
        eq(leaveRequestTable.empId, emp.id),
        eq(leaveRequestTable.status, "approved"),
        or(
          between(leaveRequestTable.fromDate, start, end),
          between(leaveRequestTable.toDate, start, end),
        )
      ),
      columns: {
        fromDate: true,
        toDate: true,
        leaveDays: true,
      }
    })

    const attendances = await ctx.db.query.empAttendanceTable.findMany({
      where: and(
        eq(empAttendanceTable.empId, emp.id),
        sql`DATE(${empAttendanceTable.date}) BETWEEN DATE(${formatDate(start)}) AND DATE(${formatDate(end)})`
      ),
      columns: {
        date: true,
      },
      orderBy: [asc(empAttendanceTable.date)],
    })

    const days = eachDayOfInterval({ start, end })

    const regularizations = days.map(day => {

      const present = attendances.find(attendance => isSameDay(attendance.date, day))
      const holiday = holidays.find(holiday => isSameDay(holiday.date, day))
      const leaveDay = approvedLeaves.find(leave => leave.leaveDays === 1 ? isSameDay(leave.fromDate, day) : isWithinInterval(day, {
        start: leave.fromDate,
        end: leave.toDate,
      }))

      const isHoliday = !!holiday
      const isLeaveDay = !!leaveDay
      const isPresent = !!present;
      const isOffDay = isSunday(day)

      const gap = !isPresent && !isOffDay && !(isHoliday || isLeaveDay);

      return {
        date: formatDate(day),
        present,
        holiday, leaveDay,
        gap,
        isHoliday,
        isLeaveDay,
      };
    })

    return regularizations
  })
});
