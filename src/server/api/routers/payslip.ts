import { and, eq, sql } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import {
  empPayslipCompTable,
  empPayslipTable,
  empProfileTable,
  leaveEncashmentTable,
  userTable
} from "@/server/db/schema";
// SCHEMAS
import {
  GetMonthPayslipInput,
  GetPayslipDataInput
} from "@/lib/schema";
// TYPES
import type { GetMonthPayslipStatus, GetPayslipDataStatus } from "@/lib/types";

export const payslipRouter = createTRPCRouter({
  getMonthPayslip: protectedProcedure.input(GetMonthPayslipInput).query(async ({ ctx, input }): Promise<GetMonthPayslipStatus> => {
    const empMonthPayslip = await ctx.db.query.empPayslipTable.findFirst({
      where: and(
        eq(empPayslipTable.empId, input.empId),
        sql`MONTH(${empPayslipTable.date}) = ${input.month.getMonth() + 1}`
      )
    })
    if (empMonthPayslip === undefined) {
      return {
        status: "FAILED",
        message: "Payslip not found for given month."
      }
    } else {
      return {
        status: "SUCCESS",
        message: "Payslip found for given month.",
        data: empMonthPayslip
      }
    }
  }),

  getPayslipData: protectedProcedure.input(GetPayslipDataInput).query(async ({ ctx, input }): Promise<GetPayslipDataStatus> => {
    const { payslipId } = input
    try {
      const payslip = await ctx.db.query.empPayslipTable.findFirst({
        where: eq(empPayslipTable.id, payslipId)
      })

      if (payslip === undefined) throw new Error("No payslip found for this payslip Id")

      const { empId } = payslip
      const empData = await ctx.db.query.userTable.findFirst({
        where: eq(userTable.id, empId),
        columns: {
          password: false
        }
      })

      if (empData === undefined) throw new Error("No employee found.")

      const empProfile = await ctx.db.query.empProfileTable.findFirst({
        where: eq(empProfileTable.empId, empId),
        with: {
          department: true,
          designation: true
        }
      })

      if (empProfile === undefined) throw new Error("Employee profile not found!")

      const payslipComps = await ctx.db.query.empPayslipCompTable.findMany({
        where: eq(empPayslipCompTable.empPayslipId, payslipId)
      })

      const leaveEncashment = await ctx.db.query.leaveEncashmentTable.findFirst({
        where: eq(leaveEncashmentTable.empPayslipId, payslipId)
      })

      if (leaveEncashment === undefined) throw new Error("No leave encashment found for this payslip id")

      return {
        status: "SUCCESS",
        message: "Payslip pdf data fetch success",
        data: {
          empData,
          empProfile,
          payslip,
          payslipComps,
          leaveEncashment
        }
      }

    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to get payslip data"
      }
    }
  }),
});
