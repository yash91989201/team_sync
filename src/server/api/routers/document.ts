// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// DB TABLES
import { documentTypeTable, employeeDocumentFileTable, employeeDocumentTable } from "@/server/db/schema";
// SCHEMAS
import { CreateDocumentTypeSchema, CreateEmployeeDocumentInputSchema } from "@/lib/schema";

export const documentRouter = createTRPCRouter({
  getTypes: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.documentTypeTable.findMany();
  }),

  createDocumentType: protectedProcedure
    .input(CreateDocumentTypeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(documentTypeTable).values(input);
    }),

  getEmployeesDocuments: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.employeeDocumentTable.findMany({
      with: {
        documentFiles: true,
        employee: true
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

      await ctx.db.insert(employeeDocumentTable).values({
        id,
        verified,
        uniqueDocumentId,
        empId,
        documentTypeId,
      })

      await ctx.db.insert(employeeDocumentFileTable).values(documentFiles)
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
  })
});
