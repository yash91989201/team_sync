import { eq } from "drizzle-orm";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// SCHEMAS
import { holidayTable } from "@/server/db/schema";
import { CreateHolidaySchema, DeleteHolidaySchema, UpdateHolidaySchema } from "@/lib/schema";

export const holidayRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.holidayTable.findMany();
  }),

  createNew: protectedProcedure
    .input(CreateHolidaySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(holidayTable).values(input);
        return {
          status: "SUCCESS",
          message: "Holiday added successfully"
        }
      } catch (error) {
        return {
          status: "FAILED",
          message: "Unable to add holiday, please try again."
        }
      }
    }),

  updateHoliday: protectedProcedure
    .input(UpdateHolidaySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.update(holidayTable).set({
          name: input.name,
          date: input.date
        }).where(eq(holidayTable.id, input.id));
        return {
          status: "SUCCESS",
          message: "Holiday updated successfully"
        }
      } catch (error) {
        return {
          status: "FAILED",
          message: "Unable to update holiday, please try again."
        }
      }
    }),

  deleteHoliday: protectedProcedure.input(DeleteHolidaySchema).mutation(({ ctx, input }) => {
    return ctx.db.delete(holidayTable).where(eq(holidayTable.id, input.id))
  }),
});
