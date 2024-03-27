import { generateId } from "lucia";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// SCHEMAS
import { designationTable } from "@/server/db/schema";
import { CreateDesignationSchema } from "@/lib/schema";

export const designationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.designationTable.findMany();
  }),
  createNew: protectedProcedure
    .input(CreateDesignationSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(designationTable).values({
        id: generateId(15),
        name: input.name,
      });
    }),
});
