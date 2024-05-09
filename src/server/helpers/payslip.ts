import "server-only";
import { eq } from "drizzle-orm";
// UTILS
import { db } from "@/server/db";
// DB TABLES
import {
  userTable,
  empPayslipTable,
  empProfileTable,
  empPayslipCompTable,
  leaveEncashmentTable,
} from "@/server/db/schema";
// TYPES
import type { GetPayslipDataStatus } from "@/lib/types";

export async function getPayslipDataForPdf({ payslipId }: { payslipId: string; }): Promise<GetPayslipDataStatus> {
  try {
    const payslip = await db.query.empPayslipTable.findFirst({
      where: eq(empPayslipTable.id, payslipId)
    })

    if (payslip === undefined) throw new Error("No payslip found for this payslip Id")

    const { empId } = payslip
    const empData = await db.query.userTable.findFirst({
      where: eq(userTable.id, empId),
      columns: {
        password: false
      }
    })

    if (empData === undefined) throw new Error("No employee found.")

    const empProfile = await db.query.empProfileTable.findFirst({
      where: eq(empProfileTable.empId, empId),
      with: {
        department: true,
        designation: true
      }
    })

    if (empProfile === undefined) throw new Error("Employee profile not found!")

    const payslipComps = await db.query.empPayslipCompTable.findMany({
      where: eq(empPayslipCompTable.empPayslipId, payslipId)
    })

    const leaveEncashment = await db.query.leaveEncashmentTable.findFirst({
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
      message: ""
    }
  }


}