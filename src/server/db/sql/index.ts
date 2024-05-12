import { and, eq, isNull, sql } from "drizzle-orm";
// UTILS
import { db } from "@/server/db";
// DB TABLES
import { documentTypeTable, empDocumentTable, empPayslipTable, userTable } from "@/server/db/schema";

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
    imageUrl: userTable.imageUrl
  })
  .from(empPayslipTable)
  .rightJoin(
    userTable,
    and(
      eq(empPayslipTable.empId, userTable.id),
      sql`MONTH(${empPayslipTable.date}) = MONTH(CURDATE())`
    )
  )
  .where(
    and(
      isNull(empPayslipTable.empId),
      eq(userTable.role, "EMPLOYEE"),
    )
  )
  .prepare()