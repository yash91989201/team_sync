import { generateId } from "lucia";
import { eq, sql } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/server/helpers";
import { pbClient } from "@/server/pb/config";
// DB TABLES
import {
  employeeAttendanceTable,
  employeeDocumentFileTable,
  employeeDocumentTable,
  employeeLeaveTypeTable,
  employeeProfileTable,
  employeeSalaryComponentTable,
  employeeShiftTable,
  leaveBalanceTable,
  leaveRequestTable,
  sessionTable,
  userTable
} from "@/server/db/schema";
// SCHEMAS
import {
  CreateEmployeeInputSchema,
  DeleteEmployeeSchema,
  UpdateEmployeeInputSchema
} from "@/lib/schema";

export const adminRouter = createTRPCRouter({
  createEmployee: protectedProcedure
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

  updateEmployee: protectedProcedure.input(UpdateEmployeeInputSchema).mutation(async ({ ctx }) => {
    //
    return {
      status: "",
      message: ""
    }

  }),

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
