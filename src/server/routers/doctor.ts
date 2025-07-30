import { and, eq, not } from "drizzle-orm";
import { z } from "zod";
import { user } from "../db/auth-schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const doctorRouter = createTRPCRouter({
   getAll: protectedProcedure
      .input(
         z.object({
            organizationId: z.string().optional(),
            unitId: z.string().optional(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const whereConditions: any[] = [];

         whereConditions.push(eq(user.systemRole, "doctor"));

         if (ctx.user?.systemRole === "admin") {
            whereConditions.push(eq(user.organizationId, ctx.user.organizationId!));
            if (input.unitId) {
               whereConditions.push(eq(user.unitId, input.unitId));
            }
         }

         whereConditions.push(not(eq(user.id, ctx.user.id)));

         const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

         const result = whereClause
            ? await ctx.db.query.user.findMany({
                 where: whereClause,
                 orderBy: (user, { asc }) => [asc(user.name)],
                 with: {
                    organization: true,
                 },
              })
            : await ctx.db.query.user.findMany({
                 orderBy: (user, { asc }) => [asc(user.name)],
              });

         return result;
      }),

   protected: protectedProcedure.input(z.object({ message: z.string() })).query(({ input, ctx }) => {
      return {
         message: `${input.message} - authenticated as ${ctx.user?.email || "unknown"}`,
         session: ctx.session?.session.id || "no-session",
      };
   }),
});
