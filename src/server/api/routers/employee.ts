import { generateId } from "lucia";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/server/helpers";
// SCHEMAS
import {
  employeeAttendanceTable,
  employeeProfileTable,
  employeeShiftTable,
  userTable,
} from "@/server/db/schema";
import { AttendancePunchOutSchema, CreateEmployeeSchema } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { calculateShiftHours, getCurrentDate } from "@/lib/utils";

export const employeeRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
    });
  }),
  createNew: protectedProcedure
    .input(CreateEmployeeSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        code,
        name,
        email,
        password,
        role,
        isTeamLead,
        joiningDate,
        dept,
        designation,
        salary,
        paidLeaves,
        location,
        empBand,
        shiftStart,
        shiftEnd,
        breakMinutes,
      } = input;

      const employeeId = generateId(15);
      const hashedPassword = await hashPassword(password);
      await ctx.db.insert(userTable).values({
        id: employeeId,
        code,
        name,
        email,
        password: hashedPassword,
        role,
        isTeamLead,
        emailVerified: new Date(),
      });

      await ctx.db.insert(employeeProfileTable).values({
        empId: employeeId,
        joiningDate,
        dept,
        designation,
        salary,
        paidLeaves,
        location,
        empBand,
      });

      await ctx.db.insert(employeeShiftTable).values({
        empId: employeeId,
        shiftStart: shiftStart.toLocaleTimeString("en-IN", { hour12: false }),
        shiftEnd: shiftEnd.toLocaleTimeString("en-IN", { hour12: false }),
        breakMinutes,
      });
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

  punchIn: protectedProcedure.mutation(async ({ ctx }) => {
    const punchIn = new Date().toLocaleTimeString("en-IN", { hour12: false });
    const { id } = ctx.session.user;
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
