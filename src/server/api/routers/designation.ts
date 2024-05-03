import { and, count, eq } from "drizzle-orm";
import { generateId } from "lucia";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// SCHEMAS
import { designationTable, empProfileTable } from "@/server/db/schema";
import { CreateDesignationSchema, DeleteDesignationSchema, UpdateDesignationSchema } from "@/lib/schema";

export const designationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.designationTable.findMany({
      with: {
        department: {
          columns: {
            name: true
          }
        },
      }
    });
  }),

  createNew: protectedProcedure
    .input(CreateDesignationSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(designationTable).values({
        id: generateId(15),
        ...input,
      });
    }),

  updateDesignation: protectedProcedure
    .input(UpdateDesignationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(designationTable)
          .set({ name: input.name })
          .where(
            and(
              eq(designationTable.id, input.id),
              eq(designationTable.deptId, input.deptId)
            )
          )

        return {
          status: "SUCCESS",
          message: "Department updated successfully"
        }
      } catch (error) {
        return {
          status: "FAILED",
          message: "Unable to delete department"
        }
      }
    }),

  deleteDesignation: protectedProcedure.input(DeleteDesignationSchema).mutation(async ({ ctx, input }) => {
    try {

      const designationEmployee = await ctx.db
        .select({ employees: count() })
        .from(empProfileTable)
        .where(
          and(
            eq(empProfileTable.deptId, input.deptId),
            eq(empProfileTable.designationId, input.id)
          )
        )

      const employees = designationEmployee[0]?.employees ?? 0

      if (employees > 0) {
        return {
          status: "FAILED",
          message: `There are ${employees} employee(s) with this designation please change their designation before deleting.`
        }
      }

      await ctx.db.delete(designationTable).where(eq(designationTable.id, input.id))

      return {
        status: "SUCCESS",
        message: "Department updated successfully"
      }
    } catch (error) {
      return {
        status: "FAILED",
        message: "Unable to delete department"
      }
    }
  })
});
