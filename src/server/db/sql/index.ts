import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
// UTILS
import { db } from "@/server/db";
// TYPES
import type { MissingEmpsDocsSQLResult } from "@/lib/types";
// DB TABLES
import {
  userTable,
  empProfileTable,
  empPayslipTable,
  leaveRequestTable,
  empAttendanceTable,
  documentTypeTable,
  empDocumentTable,
} from "@/server/db/schema";


export const missingEmpsDocsSQL = sql<MissingEmpsDocsSQLResult[]>`
        SELECT 
            ${userTable.id} AS id,
            ${userTable.name} AS name,
            ${userTable.imageUrl} AS imageUrl,
            COUNT(${documentTypeTable.id}) AS missingDocumentCount
        FROM 
            ${userTable} 
        CROSS JOIN 
            ${documentTypeTable}
        LEFT JOIN 
            ${empDocumentTable} ON ${userTable.id} = ${empDocumentTable.empId} AND ${documentTypeTable.id} = ${empDocumentTable.documentTypeId}
        WHERE 
            ${empDocumentTable.id} IS NULL AND ${userTable.role} = 'EMPLOYEE'
        GROUP BY 
            ${userTable.id}
        ORDER BY 
            ${userTable.id};
        `;

export const missingEmpPayslipQuery = db
  .select({
    id: userTable.id,
    name: userTable.name,
    imageUrl: userTable.imageUrl,
    salary: empProfileTable.salary,
    joiningDate: empProfileTable.joiningDate,
    payslip: {
      id: empPayslipTable.id,
      pdfUrl: empPayslipTable.pdfUrl,
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
  .orderBy(asc(empPayslipTable.id))
  .prepare()

export const empsAttendanceQuery = db.query.userTable.findMany({
  where: and(
    eq(userTable.role, "EMPLOYEE"),
    sql`LOWER(${userTable.name}) LIKE ${sql.placeholder('name')}`
  ),
  columns: {
    id: true,
    name: true,
    code: true,
    email: true,
  },
  with: {
    employeeAttendance: {
      where: and(
        isNotNull(empAttendanceTable.hours),
        sql`MONTH(${empAttendanceTable.date}) = MONTH(${sql.placeholder("month")})`
      ),
      columns: {
        hours: true,
      },
    },
    employeeLeaveRequest: {
      where: and(
        eq(leaveRequestTable.status, "approved"),
        sql`MONTH(${sql.placeholder("month")}) BETWEEN MONTH(${leaveRequestTable.fromDate}) AND MONTH(${leaveRequestTable.toDate})`,
      ),
      columns: {
        status: true,
      },
      with: {
        leaveType: {
          columns: {
            paidLeave: true
          }
        }
      },
    },
    employeeProfile: {
      columns: {
        joiningDate: true
      },
      with: {
        department: {
          columns: {
            name: true
          }
        }
      },
    }
  }
}).prepare()