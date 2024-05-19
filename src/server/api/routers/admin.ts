import {
  addDays,
  isSunday,
  isSameMonth,
  differenceInDays,
  isWithinInterval,
  eachWeekendOfInterval,
} from "date-fns";
import { generateId } from "lucia";
import { and, between, desc, eq, getTableColumns, inArray, isNotNull, ne, or, sql } from "drizzle-orm";
// UTILS
import { env } from "process";
import { pbClient } from "@/server/pb/config";
import { formatDate } from "@/lib/date-time-utils";
import { getPayslipPdf, hashPassword } from "@/server/helpers";
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
  DeletePayslipInput,
  GeneratePayslipSchema,
  GetCreatePayslipDataInput,
  GetEmployeeByIdInput,
  GetEmployeeProfileInput,
  UpdateEmployeeSchema
} from "@/lib/schema";
// TYPES
import type {
  EmployeeLeaveTypeSchemaType,
  EmployeeSalaryComponentType,
  GetEmployeeDataResponse,
} from "@/lib/types";

export const adminRouter = createTRPCRouter({
  /**
  * Returns admin data with profile info
  */
  getData: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findFirst({
      where: eq(userTable.id, ctx.session.user.id),
      with: {
        adminProfile: true,
      }
    })
  }),
  /**
  * Returns employee profile by empId
  */
  getEmployeeProfile: protectedProcedure.input(GetEmployeeProfileInput).query(({ ctx, input }) => {
    return ctx.db.query.empProfileTable.findFirst({ where: eq(empProfileTable.empId, input.empId) })
  }),
  /**
  * Returns existing employee data by empId
  * for updation
  */
  getUpdateEmpData:
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
          .innerJoin(
            empLeaveTypeTable,
            and(
              eq(empLeaveTypeTable.empId, empId),
              eq(empLeaveTypeTable.leaveTypeId, leaveTypeTable.id),
            )
          );

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
  /**
  * Returns all required information by empId, (payslip) startDate, endDate,  like
  * leaveEncashmentDays, leaveEncashmentData, presentDays, paidLeaveDays,
  * daysPayable, empPayslipComponents, totalSalary, calendarDays,
  * lopDays, holidays, unPaidLeaveDays,
  * required by GeneratePayslipForm 
  * to create employee's payslip
  */
  getCreatePayslipData: protectedProcedure
    .input(GetCreatePayslipDataInput)
    .query(async ({ ctx, input }) => {
      const { empId, startDate, endDate } = input
      const calendarDays = differenceInDays(endDate, startDate) + 1

      // STEP 1: Leave encashment
      const empLeaveTypes = await ctx.db.query.empLeaveTypeTable.findMany({
        where: eq(empLeaveTypeTable.empId, empId),
        columns: {
          leaveTypeId: true
        },
        with: {
          leaveType: {
            columns: {
              renewPeriod: true,
              renewPeriodCount: true,
              leaveEncashment: true,
              daysAllowed: true,
            }
          }
        }
      })

      const empLeaveTypesId = empLeaveTypes.map(empLeaveType => empLeaveType.leaveTypeId)
      const leaveBalances = await ctx.db.query.leaveBalanceTable.findMany({
        where: and(
          eq(leaveBalanceTable.empId, empId),
          inArray(leaveBalanceTable.leaveTypeId, empLeaveTypesId)
        )
      })

      const empLeaveBalances = empLeaveTypes.map(empLeaveType => {
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

      // create missing leave balances for employee leave types
      await Promise.all(empLeaveBalances.map(async (empLeaveTypeBalance) => {
        const {
          status, leaveType: _lT,
          encashmentDays: _eE,
          allowEncashment: _aE,
          ...leaveBalanceData
        } = empLeaveTypeBalance

        if (status === "create") {
          await ctx.db.insert(leaveBalanceTable).values(leaveBalanceData)
        }
      }))

      // STEP 2: Present days
      const attendance = await ctx.db.query.empAttendanceTable.findMany({
        where: and(
          or(
            ne(empAttendanceTable.shift, "0"),
            isNotNull(empAttendanceTable.shift),
          ),
          eq(empAttendanceTable.empId, empId),
          between(empAttendanceTable.date, startDate, endDate)
        ),
        columns: {
          date: true,
          shift: true
        }
      })
      const presentDays = attendance.length

      // STEP 3: approved leaves
      const approvedLeaves = await ctx.db
        .select({
          fromDate: leaveRequestTable.fromDate,
          toDate: leaveRequestTable.toDate,
          leaveDays: leaveRequestTable.leaveDays,
          paidLeave: leaveTypeTable.paidLeave
        })
        .from(leaveRequestTable)
        .innerJoin(leaveTypeTable, eq(leaveRequestTable.leaveTypeId, leaveTypeTable.id))
        .where(
          and(
            eq(leaveRequestTable.empId, empId),
            eq(leaveRequestTable.status, "approved"),
            or(
              between(leaveRequestTable.fromDate, startDate, endDate),
              between(leaveRequestTable.toDate, startDate, endDate),
            )
          )
        )

      let paidLeaveDays = 0;
      let unPaidLeaveDays = 0
      for (const approvedLeave of approvedLeaves) {
        let totalDays = 0;
        const { fromDate, toDate, leaveDays, paidLeave } = approvedLeave
        if (leaveDays === 1) {
          totalDays = 1;
        }
        else if (isSameMonth(startDate, endDate)) {
          totalDays = differenceInDays(toDate, fromDate) + 1
        }
        else if (isSameMonth(startDate, toDate)) {
          totalDays = differenceInDays(toDate, startDate) + 1
        }
        else if (isSameMonth(fromDate, endDate)) {
          totalDays = differenceInDays(endDate, fromDate) + 1
        }

        if (paidLeave) paidLeaveDays += totalDays;
        else unPaidLeaveDays += totalDays
      }

      // STEP 4: holidays
      const monthHolidays = await ctx.db.query.holidayTable.findMany({
        where: sql`DATE(${holidayTable.date}) BETWEEN DATE(${formatDate(startDate)}) AND DATE(${formatDate(endDate)})`,
      })
      const holidays = monthHolidays.length


      // STEP 5: non working days
      const weekendDays = eachWeekendOfInterval({ start: startDate, end: endDate })
      const sundays = weekendDays.filter(day => isSunday(day)).length
      const nonWorkingDays = sundays + holidays;

      // STEP 6: lop days
      const lopDays = (calendarDays - presentDays - nonWorkingDays) - paidLeaveDays + unPaidLeaveDays;

      // STEP 7: leave encashment data
      const employeeProfile = await ctx.db.query.empProfileTable.findFirst({
        where: eq(empProfileTable.empId, empId),
        columns: {
          salary: true
        }
      })
      const salary = employeeProfile?.salary ?? 0
      const leaveEncashmentDays = empLeaveBalances.reduce((total, { allowEncashment, encashmentDays }) => (
        allowEncashment ? total + encashmentDays : total
      ), 0)
      const leaveEncashmentAmount = Math.ceil((salary * leaveEncashmentDays) / calendarDays)

      const leaveEncashmentData = {
        amount: leaveEncashmentAmount,
        arrear: 0,
        adjustment: 0,
        amountPaid: leaveEncashmentAmount,
      }

      // STEP 8: days payable
      const daysPayable = presentDays + paidLeaveDays + holidays;

      // STEP 9: payslip components
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
        const compAmtByDaysPayable = Math.ceil((amount * daysPayable) / calendarDays)
        return {
          name: salaryComponent.name,
          amount: compAmtByDaysPayable,
          arrear: 0,
          adjustment: 0,
          amountPaid: compAmtByDaysPayable
        }
      })

      // STEP 10: calculate total salary 
      const salaryCompsTotalAmount = empPayslipComponents.reduce((total, empPaySlipComp) => total + empPaySlipComp.amountPaid, 0)
      const totalSalary = salaryCompsTotalAmount + leaveEncashmentAmount

      return {
        leaveEncashmentDays,
        leaveEncashment: leaveEncashmentData,
        presentDays,
        paidLeaveDays,
        daysPayable,
        payslipComponents: empPayslipComponents,
        totalSalary,
        calendarDays,
        lopDays,
        holidays,
        unPaidLeaveDays,
      }
    }),
  /**
  * Returns all employees with their profile 
  * which contains their salary
  */
  getEmployeesSalaries: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.userTable.findMany({
      where: eq(userTable.role, "EMPLOYEE"),
      columns: {
        id: true,
        name: true,
      },
      with: {
        employeeProfile: true
      }
    })
  }),
  /**
  * Takes all required inputs and creates an employee 
  */
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
          tx.rollback()
          return {
            status: "FAILED",
            message: "Unable to add employee, please try again"
          }
        }
      })

      return createEmployeeTxResponse
    }),
  /**
  * Takes all required information and updates employee
  */
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
          return {
            status: "FAILED",
            message: "Unable to update employee, please try again"
          }
        }
      }),
  /**
  * Deletes employee and their related resources 
  * by empId
  */
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
      return {
        status: "FAILED",
        message: "Unable to remove employee, try again."
      }
    }
  }),
  /**
  * Creates employee payslip by taking required data
  * and also generates payslip's PDF and stores into pocketbase
  */
  createEmpPayslip: protectedProcedure.input(GeneratePayslipSchema).mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {
    const {
      empId,
      date,
      calendarDays,
      lopDays,
      daysPayable,
      totalSalary,
      payslipComponents,
      leaveEncashment,
      presentDays,
      holidays,
      paidLeaveDays,
      unPaidLeaveDays,
      leaveEncashmentDays,
    } = input

    const empPayslipId = generateId(15)
    const pdfUrl = `${env.NEXT_SITE_URL}/api/payslip-pdf/${empPayslipId}`;

    try {
      await ctx.db.insert(empPayslipTable).values({
        id: empPayslipId,
        date,
        createdAt: new Date(),
        calendarDays,
        lopDays,
        daysPayable,
        totalSalary,
        pdfUrl,
        presentDays,
        holidays,
        paidLeaveDays,
        unPaidLeaveDays,
        leaveEncashmentDays,
        empId,
      })

      const empPayslipComponents = payslipComponents.map(payslipComp => ({ ...payslipComp, empPayslipId }))

      await ctx.db.insert(empPayslipCompTable).values(empPayslipComponents)

      await ctx.db.insert(leaveEncashmentTable).values({
        ...leaveEncashment,
        empPayslipId
      })

      const { name: empName } = (await ctx.db.query.userTable.findFirst({
        where: eq(userTable.id, empId),
        columns: {
          name: true,
        }
      }))!

      // add delay of 500ms before generating pdf
      await new Promise(resolve => setTimeout(resolve, 500))
      // generate pdf and store to pocketbase
      const payslipPdf = await getPayslipPdf({
        payslipId: empPayslipId,
        pdfFileName: `${empName}'s ${formatDate(date, "MMMM-yyyy")} payslip`
      })

      await pbClient.collection("payslip").create(payslipPdf)

      // set leave encashment balances to 0
      const empEncashmentLeaves = await ctx.db
        .select({
          id: leaveTypeTable.id,
          renewPeriod: leaveTypeTable.renewPeriod,
          renewPeriodCount: leaveTypeTable.renewPeriodCount,
        })
        .from(empLeaveTypeTable)
        .innerJoin(
          leaveTypeTable,
          eq(empLeaveTypeTable.leaveTypeId, leaveTypeTable.id)
        )
        .where(
          eq(leaveTypeTable.leaveEncashment, true)
        )


      if (empEncashmentLeaves.length === 0) {
        return {
          status: "SUCCESS",
          message: "Payslip generated and pdf stored successfully."
        }
      }

      const encashmentLeaveTypeIds = empEncashmentLeaves.map(leaveType => leaveType.id)

      const encashmentLeaveBal = await ctx.db.query.leaveBalanceTable.findMany({
        where: inArray(leaveBalanceTable.leaveTypeId, encashmentLeaveTypeIds)
      })

      const balanceIdsToUnset = empEncashmentLeaves.map((encashmentLeave) => {
        const { renewPeriod, renewPeriodCount } = encashmentLeave
        const { startDate, endDate } = getRenewPeriodRange({
          renewPeriod,
          renewPeriodCount
        })
        const leaveBal = encashmentLeaveBal
          .find(({ createdAt }) => isWithinInterval(createdAt, { start: startDate, end: endDate }))

        if (leaveBal === undefined) return
        return leaveBal.id
      })

      if (balanceIdsToUnset.length === 0) {
        return {
          status: "SUCCESS",
          message: "Payslip generated and pdf stored successfully."
        }
      }

      await Promise.all(balanceIdsToUnset.map(async (balanceId) => {
        if (balanceId === undefined) return
        await ctx.db
          .update(leaveBalanceTable)
          .set({ balance: 0 })
          .where(eq(leaveBalanceTable.id, balanceId))
      }))

      return {
        status: "SUCCESS",
        message: "Payslip generated and pdf stored successfully."
      }
    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to generate payslip"
      }
    }
  }),
  /**
  * Deletes employee's payslip data and PDF 
  * by empPayslipId
  */
  deleteEmpPayslip: protectedProcedure.input(DeletePayslipInput).mutation(async ({ ctx, input }): Promise<ProcedureStatusType> => {
    try {
      const { payslipId } = input

      await ctx.db.delete(leaveEncashmentTable).where(eq(leaveEncashmentTable.empPayslipId, payslipId))
      await ctx.db.delete(empPayslipCompTable).where(eq(empPayslipCompTable.empPayslipId, payslipId))
      await ctx.db.delete(empPayslipTable).where(eq(empPayslipTable.id, payslipId))

      // eslint-disable-next-line drizzle/enforce-delete-with-where
      await pbClient.collection("payslip").delete(payslipId)

      return {
        status: "SUCCESS",
        message: "Payslip deleted, now you can re-generate it"
      }
    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to delete payslip."
      }
    }
  })
});
