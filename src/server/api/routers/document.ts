import { eq, inArray } from "drizzle-orm";
// UTILS
import { pbClient } from "@/server/pb/config";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { documentTypeTable, empDocumentFileTable, empDocumentTable } from "@/server/db/schema";
// SCHEMAS
import {
  CreateDocumentTypeSchema,
  GetEmployeeDocumentsInput,
  DeleteEmployeeDocumentSchema,
  CreateEmployeeDocumentInputSchema,
  UpdateEmployeeDocumentSchema,
  DeleteDocumentTypeSchema,
} from "@/lib/schema";

export const documentRouter = createTRPCRouter({
  getTypes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.documentTypeTable.findMany();
  }),

  createDocumentType: protectedProcedure
    .input(CreateDocumentTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(documentTypeTable).values(input);
    }),

  getEmployeeDocuments: protectedProcedure.input(GetEmployeeDocumentsInput).query(({ ctx, input }) => {
    return ctx.db.query.empDocumentTable.findFirst({
      where: eq(empDocumentTable.id, input.id),
      with: {
        documentType: true,
        documentFiles: true,
        employee: {
          columns: {
            password: false,
          }
        }
      }
    })
  }),

  getEmployeesDocuments: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.empDocumentTable.findMany({
      with: {
        documentType: true,
        documentFiles: true,
        employee: {
          columns: {
            password: false,
          }
        }
      }
    })
  }),

  createEmployeeDocument: protectedProcedure.input(CreateEmployeeDocumentInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const {
        id,
        empId,
        verified,
        documentTypeId,
        uniqueDocumentId,
        documentFiles
      } = input

      await ctx.db.insert(empDocumentTable).values({
        id,
        verified,
        uniqueDocumentId,
        empId,
        documentTypeId,
      })

      await ctx.db.insert(empDocumentFileTable).values(documentFiles)
      return {
        status: "SUCCESS",
        message: "Employee Document added successfully."
      }
    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to add employee documents try again."
      }
    }
  }),

  updateEmployeeDocument: protectedProcedure.input(UpdateEmployeeDocumentSchema).mutation(async ({ ctx, input }) => {
    try {
      await ctx.db.update(empDocumentTable).set({
        uniqueDocumentId: input.uniqueDocumentId,
        verified: input.verified
      }).where(eq(empDocumentTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Employee document data updated successfully"
      }
    } catch (error) {
      return {
        status: "SUCCESS",
        message: "Unable to update employee document data"
      }
    }
  }),

  deleteDocumentType: protectedProcedure.input(DeleteDocumentTypeSchema).mutation(async ({ ctx, input }) => {
    try {
      const employeesDocuments = await ctx.db.query.empDocumentTable.findMany({
        where: eq(empDocumentTable.documentTypeId, input.id),
        with: {
          documentFiles: true
        }
      })

      const employeesDocumentsId = employeesDocuments.map(employeeDocument => employeeDocument.id)
      const employeesDocumentFiles = employeesDocuments.flatMap(employeeDocuments => employeeDocuments.documentFiles)
      const employeesDocumentFilesId = employeesDocumentFiles.map(employeeDocumentFile => employeeDocumentFile.id)

      if (employeesDocumentFilesId.length > 0) {
        await ctx.db.delete(empDocumentFileTable).where(inArray(empDocumentFileTable.id, employeesDocumentFilesId))

        await ctx.db.delete(empDocumentTable).where(inArray(empDocumentTable.id, employeesDocumentsId))

        await Promise.all(employeesDocumentFilesId.map(async (fileId) => {
          // eslint-disable-next-line
          await pbClient
            .collection("employee_document_file")
            .delete(fileId)
        }))
      }

      await ctx.db.delete(documentTypeTable).where(eq(documentTypeTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Document type deleted successfully"
      }

    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to delete document type"
      }
    }
  }),

  deleteEmployeeDocument: protectedProcedure.input(DeleteEmployeeDocumentSchema).mutation(async ({ ctx, input }) => {
    try {
      await ctx.db
        .delete(empDocumentFileTable)
        .where(
          inArray(empDocumentFileTable.id, input.filesId)
        )

      await ctx.db
        .delete(empDocumentTable)
        .where(eq(empDocumentTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Deleted employee documents"
      }
    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to delete employee documents"
      }
    }
  })
});
