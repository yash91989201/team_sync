import { generateId } from "lucia";
// UTILS
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
// SCHEMAS
import { departmentTable } from "@/server/db/schema";
import { CreateDepartmentSchema } from "@/lib/schema";

export const documentRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.departmentTable.findMany();
  }),
  createNew: protectedProcedure
    .input(CreateDepartmentSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(departmentTable).values({
        id: generateId(15),
        name: input.name,
      });
    }),
});
