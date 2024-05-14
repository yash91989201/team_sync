import { and, eq, sql } from "drizzle-orm";
// UTILS
import { db } from "@/server/db";
// DB TABLES
import { documentTypeTable, empDocumentTable, empPayslipTable, empProfileTable, userTable } from "@/server/db/schema";

export const missingEmpDocsQuery = db
  .select({
    type: documentTypeTable.type,
    empCount: sql<number>`(SELECT COUNT(*) FROM ${userTable} WHERE ${userTable.role} = "EMPLOYEE") - COUNT(${empDocumentTable.empId}) as empCount`
  })
  .from(documentTypeTable)
  .leftJoin(
    empDocumentTable,
    eq(documentTypeTable.id, empDocumentTable.documentTypeId)
  )
  .groupBy(documentTypeTable.id)
  .prepare()

export const missingEmpPayslipQuery = db
  .select({
    id: userTable.id,
    name: userTable.name,
    imageUrl: userTable.imageUrl,
    payslip: {
      id: empPayslipTable.id,
      pdfUrl: empPayslipTable.pdfUrl
    }
  })
  .from(userTable)
  .innerJoin(
    empProfileTable,
    and(
      eq(userTable.role, "EMPLOYEE"),
      eq(userTable.id, empProfileTable.empId),
      sql`MONTH(${empProfileTable.joiningDate}) <= MONTH(${sql.placeholder("month")})`,
    )
  )
  .leftJoin(
    empPayslipTable,
    and(
      eq(empPayslipTable.empId, userTable.id),
      sql`MONTH(${empPayslipTable.date}) = MONTH(${sql.placeholder("month")})`
    )
  )
  .prepare()