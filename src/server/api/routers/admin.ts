import { generateId } from "lucia";
import { and, eq, getTableColumns, sql } from "drizzle-orm";
// UTILS
import { pbClient } from "@/server/pb/config";
import { getShiftTimeDate } from "@/lib/utils";
import { hashPassword } from "@/server/helpers";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  userTable,
  sessionTable,
  leaveTypeTable,
  leaveBalanceTable,
  leaveRequestTable,
  employeeShiftTable,
  employeeProfileTable,
  employeeDocumentTable,
  employeeLeaveTypeTable,
  employeeAttendanceTable,
  employeeDocumentFileTable,
  employeeSalaryComponentTable,
} from "@/server/db/schema";
// SCHEMAS
import {
  CreateEmployeeInputSchema,
  DeleteEmployeeSchema,
  GetEmployeeByIdInput,
  UpdateEmployeeSchema
} from "@/lib/schema";
// TYPES
import type { EmployeeLeaveTypeSchemaType, EmployeeSalaryComponentType, GetEmployeeDataResponse } from "@/lib/types";

export const adminRouter = createTRPCRouter({
  // get employee data for update
  getEmployeeData:
    protectedProcedure
      .input(GetEmployeeByIdInput)
      .query(async ({ ctx, input }): Promise<GetEmployeeDataResponse> => {
        const { empId } = input

        const employee = await ctx.db.query.userTable.findFirst({
          where: eq(userTable.id, empId),
          columns: {
            password: false,
          }
        })

        if (employee === undefined) {
          return {
            status: "FAILED",
            message: "Employee doesnot exists or have been deleted by other"
          }
        }

        const { empId: _empId1, ...empProfileData } = (await ctx.db.query.employeeProfileTable.findFirst({
          where: eq(employeeProfileTable.empId, empId),
        }))!

        const { shiftStart, shiftEnd, breakMinutes } = (await ctx.db.query.employeeShiftTable.findFirst({
          where: eq(employeeShiftTable.empId, empId)
        }))!

        const salaryComponents = await ctx.db.query.employeeSalaryComponentTable.findMany({
          where: eq(employeeSalaryComponentTable.empId, empId)
        })

        const leaveTypes = await ctx.db
          .select({
            ...getTableColumns(leaveTypeTable)
          })
          .from(leaveTypeTable)
          .innerJoin(employeeLeaveTypeTable, eq(employeeLeaveTypeTable.leaveTypeId, leaveTypeTable.id))

        return {
          status: "SUCCESS",
          message: "Fetched employee data successfully",
          data: {
            name: employee.name,
            empId,
            code: employee.code,
            isTeamLead: employee.isTeamLead,
            ...empProfileData,
            salaryComponents,
            leaveTypes,
            shiftStart: getShiftTimeDate(shiftStart),
            shiftEnd: getShiftTimeDate(shiftEnd),
            breakMinutes,
          }
        }

      }),

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

  updateEmployee:
    protectedProcedure
      .input(UpdateEmployeeSchema)
      .mutation(async ({ ctx, input }): Promise<{ status: "SUCCESS"; message: string } | { status: "FAILED", message: string; }> => {
        try {
          const {
            empId,
            code,
            isTeamLead,
            joiningDate,
            deptId,
            designationId,
            salaryComponents,
            salary,
            location,
            empBand,
            shiftStart,
            shiftEnd,
            breakMinutes,
            leaveTypes,
          } = input;

          await ctx.db.update(userTable)
            .set({
              code,
              isTeamLead
            })
            .where(eq(userTable.id, empId))

          await ctx.db.update(employeeProfileTable)
            .set({
              joiningDate,
              deptId,
              designationId,
              salary,
              location,
              empBand,
            })
            .where(eq(employeeProfileTable.empId, empId))

          await ctx.db.update(employeeShiftTable)
            .set({
              shiftStart: shiftStart.toLocaleTimeString("en-IN", { hour12: false }),
              shiftEnd: shiftEnd.toLocaleTimeString("en-IN", { hour12: false }),
              breakMinutes
            })
            .where(eq(employeeShiftTable.empId, empId))

          const empSalaryComponents = await ctx.db.query.employeeSalaryComponentTable
            .findMany({
              where: eq(employeeSalaryComponentTable.empId, empId)
            })

          const newSalaryComponents: EmployeeSalaryComponentType[] = []
          const updatedSalaryComponents: EmployeeSalaryComponentType[] = []
          const deletedSalaryComponents: EmployeeSalaryComponentType[] = []

          salaryComponents.forEach((salaryComponent) => {
            const existingSalaryComponent = empSalaryComponents.find(empSalaryComponent => empSalaryComponent.id === salaryComponent.id)

            if (existingSalaryComponent === undefined) {
              newSalaryComponents.push({ ...salaryComponent, empId })
              return
            }

            if (salaryComponent.amount !== existingSalaryComponent.amount) {
              updatedSalaryComponents.push({ ...salaryComponent, empId })
            }
          })

          empSalaryComponents.forEach((empSalaryComponent) => {
            const salaryComponent = salaryComponents.find(salaryComponent => salaryComponent.id === empSalaryComponent.id)
            if (salaryComponent === undefined) {
              deletedSalaryComponents.push({ ...empSalaryComponent, empId })
            }
          })

          if (newSalaryComponents.length > 0) {
            await ctx.db.insert(employeeSalaryComponentTable).values(newSalaryComponents)
          }

          if (updatedSalaryComponents.length > 0) {
            await Promise.all(updatedSalaryComponents.map(async ({ id, amount, empId }) => {
              await ctx.db.update(employeeSalaryComponentTable).set({
                amount,
              }).where(
                and(
                  eq(employeeSalaryComponentTable.id, id,),
                  eq(employeeSalaryComponentTable.empId, empId)
                )
              )
            }))
          }

          if (deletedSalaryComponents.length > 0) {
            await Promise.all(deletedSalaryComponents.map(async ({ id, empId }) => {
              await ctx.db
                .delete(employeeSalaryComponentTable)
                .where(
                  and(
                    eq(employeeSalaryComponentTable.id, id,),
                    eq(employeeSalaryComponentTable.empId, empId)
                  )
                )
            }))
          }

          const empLeaveTypes = await ctx.db.query.employeeLeaveTypeTable.findMany({
            where: eq(employeeLeaveTypeTable.empId, empId)
          })

          const newLeaveTypes: EmployeeLeaveTypeSchemaType[] = []
          const deletedLeaveTypes: EmployeeLeaveTypeSchemaType[] = []

          leaveTypes.forEach(({ id: leaveTypeId }) => {
            const empLeaveType = empLeaveTypes.find(empLeaveType => empLeaveType.leaveTypeId === leaveTypeId)
            if (empLeaveType === undefined) {
              newLeaveTypes.push({ empId, leaveTypeId })
            }
          })

          empLeaveTypes.forEach(({ leaveTypeId }) => {
            const leaveType = leaveTypes.find(leaveType => leaveType.id === leaveTypeId)
            if (leaveType === undefined) {
              deletedLeaveTypes.push({ empId, leaveTypeId })
            }
          })

          if (newLeaveTypes.length > 0) {
            await ctx.db.insert(employeeLeaveTypeTable).values(newLeaveTypes)
          }

          if (deletedLeaveTypes.length > 0) {
            await Promise.all(deletedLeaveTypes.map(async ({ leaveTypeId, empId }) => {
              await ctx.db
                .delete(employeeLeaveTypeTable)
                .where(
                  and(
                    eq(employeeLeaveTypeTable.empId, empId),
                    eq(employeeLeaveTypeTable.leaveTypeId, leaveTypeId),
                  )
                )
            }))
          }
          return {
            status: "SUCCESS",
            message: "Employee updated successfully"
          }
        } catch (error) {
          console.log(error)
          return {
            status: "FAILED",
            message: "Unable to update employee, please try again"
          }
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
