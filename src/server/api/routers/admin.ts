import { generateId } from "lucia";
import { addDays, differenceInDays, isSameMonth } from "date-fns";
import { and, between, count, desc, eq, getTableColumns, inArray, or, sql } from "drizzle-orm";
// UTILS
import { pbClient } from "@/server/pb/config";
import { hashPassword } from "@/server/helpers";
import { getRenewPeriodRange, getShiftTimeDate } from "@/lib/utils";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  userTable,
  sessionTable,
  leaveTypeTable,
  leaveBalanceTable,
  leaveRequestTable,
  empShiftTable,
  empProfileTable,
  empDocumentTable,
  empLeaveTypeTable,
  empAttendanceTable,
  empDocumentFileTable,
  empSalaryCompTable,
  empPayslipTable,
  leaveEncashmentTable,
  empPayslipCompTable,
  holidayTable,
} from "@/server/db/schema";
// SCHEMAS
import {
  CreateEmployeeInputSchema,
  DeleteEmployeeSchema,
  GeneratePayslipSchema,
  GetEmpSalaryDataInput,
  GetEmployeeByIdInput,
  GetEmployeeProfileInput,
  UpdateEmployeeSchema
} from "@/lib/schema";
// TYPES
import type { EmployeeLeaveTypeSchemaType, EmployeeSalaryComponentType, GetEmployeeDataResponse } from "@/lib/types";

export const adminRouter = createTRPCRouter({
  getData: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findFirst({
      where: eq(userTable.id, ctx.session.user.id),
      with: {
        adminProfile: true,
      }
    })
  }),

  getEmployeeProfile: protectedProcedure.input(GetEmployeeProfileInput).query(({ ctx, input }) => {
    return ctx.db.query.empProfileTable.findFirst({ where: eq(empProfileTable.empId, input.empId) })
  }),

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

        const { empId: _empId1, ...empProfileData } = (await ctx.db.query.empProfileTable.findFirst({
          where: eq(empProfileTable.empId, empId),
        }))!

        const { shiftStart, shiftEnd, breakMinutes } = (await ctx.db.query.empShiftTable.findFirst({
          where: eq(empShiftTable.empId, empId)
        }))!

        const salaryComponents = await ctx.db.query.empSalaryCompTable.findMany({
          where: eq(empSalaryCompTable.empId, empId),
          orderBy: [desc(empSalaryCompTable.amount)],
          with: {
            salaryComponent: true
          }
        })

        const leaveTypes = await ctx.db
          .select({
            ...getTableColumns(leaveTypeTable)
          })
          .from(leaveTypeTable)
          .innerJoin(empLeaveTypeTable, eq(empLeaveTypeTable.leaveTypeId, leaveTypeTable.id))

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

  getEmpPayslipData: protectedProcedure.input(GetEmpSalaryDataInput).query(async ({ ctx, input }) => {
    const { empId, startDate, endDate } = input

    // Step 1: Leave encashment
    const empLeaveTypes = await ctx.db.query.empLeaveTypeTable.findMany({
      where: eq(empLeaveTypeTable.empId, empId),
      with: {
        leaveType: true
      }
    })

    const empLeaveTypesId = empLeaveTypes.map(empLeaveType => empLeaveType.leaveTypeId)

    const leaveBalances = await ctx.db.query.leaveBalanceTable.findMany({
      where: inArray(leaveBalanceTable.leaveTypeId, empLeaveTypesId)
    })

    const empLeaveTypeBalances = empLeaveTypes.map(empLeaveType => {
      const { renewPeriod, renewPeriodCount, leaveEncashment, daysAllowed } = empLeaveType.leaveType
      // get renew period range according to start date
      const { startDate: renewPeriodStart, endDate: renewPeriodEnd } = getRenewPeriodRange({
        renewPeriod,
        renewPeriodCount,
        referenceDate: startDate,
      })

      // check if leave balance for current payslip month exists
      const leaveTypeBalance = leaveBalances.find(leaveBalance => isSameMonth(leaveBalance.createdAt, renewPeriodStart))
      const allowEncashment = leaveEncashment && isSameMonth(endDate, renewPeriodEnd)

      if (leaveTypeBalance === undefined) {
        return {
          id: generateId(15),
          createdAt: renewPeriodStart,
          balance: daysAllowed,
          empId,
          leaveTypeId: empLeaveType.leaveTypeId,
          status: "create",
          leaveType: empLeaveType.leaveType,
          allowEncashment,
          encashmentDays: daysAllowed
        }
      } else {
        return {
          ...leaveTypeBalance,
          status: "update",
          leaveType: empLeaveType.leaveType,
          allowEncashment,
          encashmentDays: leaveTypeBalance.balance
        }
      }
    })

    await Promise.all(empLeaveTypeBalances.map(async (empLeaveTypeBalance) => {
      const {
        status, leaveType: _lT,
        encashmentDays: _eE,
        allowEncashment: _aE,
        ...leaveTypeBalanceData
      } = empLeaveTypeBalance

      if (status === "create") {
        await ctx.db.insert(leaveBalanceTable).values(leaveTypeBalanceData)
      }
    }))

    const leaveEncashmentDays = empLeaveTypeBalances.reduce((total, { allowEncashment, encashmentDays }) => (
      allowEncashment ? total + encashmentDays : total
    ), 0)

    // Step 2: Present days
    const attendance = await ctx.db
      .select({
        date: empAttendanceTable.date,
      })
      .from(empAttendanceTable)
      .where(
        and(
          eq(empAttendanceTable.empId, empId),
          between(empAttendanceTable.date, startDate, endDate)
        )
      )
      .groupBy(empAttendanceTable.date)

    const presentDays = attendance.length

    // Step 3: Paid leave days
    const paidLeaves = await ctx.db
      .select({
        fromDate: leaveRequestTable.fromDate,
        toDate: leaveRequestTable.toDate,
        leaveDays: leaveRequestTable.leaveDays,
      })
      .from(leaveRequestTable)
      .innerJoin(leaveTypeTable, eq(leaveRequestTable.leaveTypeId, leaveTypeTable.id))
      .where(
        and(
          eq(leaveRequestTable.empId, empId),
          eq(leaveRequestTable.status, "approved"),
          eq(leaveTypeTable.paidLeave, true),
          or(
            between(leaveRequestTable.fromDate, startDate, endDate),
            between(leaveRequestTable.toDate, startDate, endDate),
          )
        )
      )

    const paidLeaveDays = paidLeaves.reduce((total, paidLeave) => {
      const { fromDate, toDate, leaveDays } = paidLeave
      if (leaveDays === 1) {
        return total + 1
      }
      else if (isSameMonth(fromDate, startDate)) {
        return total + differenceInDays(fromDate, startDate) + 1
      }
      else if (isSameMonth(toDate, endDate)) {
        return total + differenceInDays(endDate, toDate) + 1
      }
      else return total
    }, 0)

    // Step 4: days payable
    const daysPayable = presentDays + paidLeaveDays;

    // Step 5: salary components with payslip comp data
    const monthDays = differenceInDays(endDate, startDate) + 1
    const empSalaryComps = await ctx.db.query.empSalaryCompTable.findMany({
      where: eq(
        empSalaryCompTable.empId, input.empId,
      ),
      orderBy: [desc(empSalaryCompTable.amount)],
      with: {
        salaryComponent: true
      }
    })

    const empPayslipComponents = empSalaryComps.map(empSalaryComp => {
      const { amount, salaryComponent } = empSalaryComp
      const compAmtByDaysPayable = Math.ceil((amount * daysPayable) / monthDays)
      return {
        name: salaryComponent.name,
        amount: compAmtByDaysPayable,
        arrear: 0,
        adjustment: 0,
        amountPaid: compAmtByDaysPayable
      }
    })

    const salaryCompAmount = empPayslipComponents.reduce((total, empPaySlipComp) => total + empPaySlipComp.amountPaid, 0)

    // Step 6: Leave encashment data
    const employeeProfile = await ctx.db.query.empProfileTable.findFirst({
      where: eq(empProfileTable.empId, empId),
      columns: {
        salary: true
      }
    })
    const salary = employeeProfile?.salary
    const leaveEncashmentAmount = Math.ceil((salary! * leaveEncashmentDays) / monthDays)

    const leaveEncashmentData = {
      amount: leaveEncashmentAmount,
      arrear: 0,
      adjustment: 0,
      amountPaid: leaveEncashmentAmount,
    }

    // Step 7: LOP days
    const lopDays = monthDays - daysPayable

    // Step 8: total salary
    const totalSalary = salaryCompAmount + leaveEncashmentAmount

    // Step 9: Holidays (optional)
    const holidays = await ctx.db
      .select({
        count: count()
      })
      .from(holidayTable)
      .where(
        between(holidayTable.date, startDate, endDate)
      )
    const holidaysCount = holidays[0]?.count ?? 0

    return {
      leaveEncashmentDays,
      leaveEncashmentData,
      presentDays,
      paidLeaveDays,
      daysPayable,
      empPayslipComponents,
      totalSalary,
      calendarDays: monthDays,
      lopDays,
      holidays: holidaysCount
    }
  }),

  getEmployeesSalaries: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
      columns: {
        password: false
      },
      with: {
        employeeProfile: true
      }
    })
  }),

  createEmployee: protectedProcedure
    .input(CreateEmployeeInputSchema)
    .mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {
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

      const createEmployeeTxResponse = await ctx.db.transaction(async (tx): Promise<ProcedureStatusType> => {
        try {
          const employeeId = generateId(15);
          const hashedPassword = await hashPassword(password);
          const empLeaveTypeIds = leaveTypes.map(({ id }) => id)
          const empLeaveTypeData = leaveTypes.map(({ id }) => ({ empId: employeeId, leaveTypeId: id }))
          const employeeSalaryComponents = salaryComponents
            .map((salaryComponent) => (
              {
                ...salaryComponent,
                salaryComponentId: salaryComponent.salaryComponent.id,
                empId: employeeId
              }
            ))

          const existingEmp = await ctx.db.query.userTable.findFirst({
            where: and(
              eq(userTable.role, "EMPLOYEE"),
              eq(userTable.code, code)
            ),
          })

          if (existingEmp !== undefined) {
            return {
              status: "FAILED",
              message: `${code} has been given assigned to ${existingEmp.name} , use another code.`
            }
          }

          // add employee to userTable
          await tx.insert(userTable).values({
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
          await tx.insert(empProfileTable).values({
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
          await tx.insert(empShiftTable).values({
            empId: employeeId,
            shiftStart: shiftStart.toLocaleTimeString("en-IN", { hour12: false }),
            shiftEnd: shiftEnd.toLocaleTimeString("en-IN", { hour12: false }),
            breakMinutes,
          });

          await tx.insert(empSalaryCompTable).values(employeeSalaryComponents)

          await tx.insert(empLeaveTypeTable).values(empLeaveTypeData)

          const availableLeaveTypes = await ctx.db.query.leaveTypeTable.findMany();

          if (availableLeaveTypes.length > 0) {
            await Promise.all(
              availableLeaveTypes.map(async (leaveType) => {
                if (!empLeaveTypeIds.includes(leaveType.id)) return

                const { startDate } = getRenewPeriodRange({
                  renewPeriod: leaveType.renewPeriod,
                  renewPeriodCount: leaveType.renewPeriodCount,
                  referenceDate: new Date(),
                });

                const [newLeaveBalance] = await tx
                  .insert(leaveBalanceTable)
                  .values({
                    id: generateId(15),
                    leaveTypeId: leaveType.id,
                    empId: employeeId,
                    balance: leaveType.daysAllowed,
                    createdAt: addDays(startDate, 1),
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
          console.log(error)
          tx.rollback()
          return {
            status: "FAILED",
            message: "Unable to add employee, please try again"
          }
        }
      })

      return createEmployeeTxResponse
    }),

  updateEmployee:
    protectedProcedure
      .input(UpdateEmployeeSchema)
      .mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {
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

          await ctx.db.update(empProfileTable)
            .set({
              joiningDate,
              deptId,
              designationId,
              salary,
              location,
              empBand,
            })
            .where(eq(empProfileTable.empId, empId))

          await ctx.db.update(empShiftTable)
            .set({
              shiftStart: shiftStart.toLocaleTimeString("en-IN", { hour12: false }),
              shiftEnd: shiftEnd.toLocaleTimeString("en-IN", { hour12: false }),
              breakMinutes
            })
            .where(eq(empShiftTable.empId, empId))

          const empSalaryComponents = await ctx.db.query.empSalaryCompTable
            .findMany({
              where: eq(empSalaryCompTable.empId, empId)
            })

          const newSalaryComponents: EmployeeSalaryComponentType[] = []
          const updatedSalaryComponents: EmployeeSalaryComponentType[] = []
          const deletedSalaryComponents: EmployeeSalaryComponentType[] = []

          salaryComponents.forEach((salaryComponent) => {
            const existingSalaryComponent = empSalaryComponents.find(empSalaryComponent => empSalaryComponent.id === salaryComponent.id)

            if (existingSalaryComponent === undefined) {
              newSalaryComponents.push({ ...salaryComponent, id: generateId(15), salaryComponentId: salaryComponent.id, empId })
              return
            }

            if (salaryComponent.amount !== existingSalaryComponent.amount) {
              updatedSalaryComponents.push({ ...salaryComponent, id: existingSalaryComponent.id, salaryComponentId: salaryComponent.id, empId })
            }
          })

          empSalaryComponents.forEach((empSalaryComponent) => {
            const salaryComponent = salaryComponents.find(salaryComponent => salaryComponent.id === empSalaryComponent.id)
            if (salaryComponent === undefined) {
              deletedSalaryComponents.push({ ...empSalaryComponent, empId })
            }
          })

          if (newSalaryComponents.length > 0) {
            await ctx.db.insert(empSalaryCompTable).values(newSalaryComponents)
          }

          if (updatedSalaryComponents.length > 0) {
            await Promise.all(updatedSalaryComponents.map(async ({ id, amount, empId }) => {
              await ctx.db.update(empSalaryCompTable).set({
                amount,
              }).where(
                and(
                  eq(empSalaryCompTable.id, id,),
                  eq(empSalaryCompTable.empId, empId)
                )
              )
            }))
          }

          if (deletedSalaryComponents.length > 0) {
            await Promise.all(deletedSalaryComponents.map(async ({ salaryComponentId, empId }) => {
              await ctx.db
                .delete(empSalaryCompTable)
                .where(
                  and(
                    eq(empSalaryCompTable.id, salaryComponentId),
                    eq(empSalaryCompTable.empId, empId)
                  )
                )
            }))
          }

          const empLeaveTypes = await ctx.db.query.empLeaveTypeTable.findMany({
            where: eq(empLeaveTypeTable.empId, empId)
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
            await ctx.db.insert(empLeaveTypeTable).values(newLeaveTypes)
          }

          if (deletedLeaveTypes.length > 0) {
            await Promise.all(deletedLeaveTypes.map(async ({ leaveTypeId, empId }) => {
              await ctx.db
                .delete(empLeaveTypeTable)
                .where(
                  and(
                    eq(empLeaveTypeTable.empId, empId),
                    eq(empLeaveTypeTable.leaveTypeId, leaveTypeId),
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
          id: empDocumentTable.id
        })
        .from(empDocumentTable)
        .where(eq(empDocumentTable.empId, empId))
        .as("employee_documents_id")

      const employeeDocumentFilesId = await ctx.db
        .select({
          id: empDocumentFileTable.id
        })
        .from(empDocumentFileTable)
        .leftJoin(
          employeeDocumentsQuery,
          eq(empDocumentFileTable.empDocumentId, employeeDocumentsQuery.id)
        )

      if (userData === undefined) {
        return {
          status: "FAILED",
          message: "Employee doesnot exists, or has been already deleted"
        }
      }

      await ctx.db.delete(empAttendanceTable).where(eq(empAttendanceTable.empId, empId))
      await ctx.db.delete(empLeaveTypeTable).where(eq(empLeaveTypeTable.empId, empId))
      await ctx.db.delete(empProfileTable).where(eq(empProfileTable.empId, empId))
      await ctx.db.delete(empSalaryCompTable).where(eq(empSalaryCompTable.empId, empId))
      await ctx.db.delete(empShiftTable).where(eq(empShiftTable.empId, empId))
      await ctx.db.delete(leaveBalanceTable).where(eq(leaveBalanceTable.empId, empId))
      await ctx.db.delete(leaveRequestTable).where(eq(leaveRequestTable.empId, empId))
      await ctx.db.delete(empDocumentFileTable).where(eq(empDocumentFileTable.empDocumentId, sql`(select id from ${employeeDocumentsQuery})`))
      await ctx.db.delete(empDocumentTable).where(eq(empDocumentTable.empId, empId))
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
  }),

  createEmployeePayslip: protectedProcedure.input(GeneratePayslipSchema).mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {

    const {
      empId,
      date,
      createdAt,
      calendarDays,
      lopDays,
      daysPayable,
      totalSalary,
      payslipComponents,
      leaveEncashment,
    } = input

    const empPayslipId = generateId(15)

    try {
      await ctx.db.insert(empPayslipTable).values({
        id: empPayslipId,
        date,
        createdAt,
        calendarDays,
        lopDays,
        daysPayable,
        totalSalary,
        empId,
      })

      const empPayslipComponents = payslipComponents.map(payslipComp => ({ ...payslipComp, empPayslipId }))

      await ctx.db.insert(empPayslipCompTable).values(empPayslipComponents)

      await ctx.db.insert(leaveEncashmentTable).values({
        ...leaveEncashment,
        empPayslipId
      })

      return {
        status: "SUCCESS",
        message: "Payslip generated and pdf stored successfully."
      }
    } catch (error) {
      console.debug(error)
      return {
        status: "FAILED",
        message: "Unable to generate payslip"
      }
    }


  })
});
