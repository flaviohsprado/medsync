import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const doctorRouter = createTRPCRouter({
   getAll: protectedProcedure
      .input(z.object({ organizationId: z.string(), unitId: z.string() }))
      .query(async ({ input, ctx }) => {
         return [];
      }),

   protected: protectedProcedure.input(z.object({ message: z.string() })).query(({ input, ctx }) => {
      return {
         message: `${input.message} - authenticated as ${ctx.user?.email || "unknown"}`,
         session: ctx.session?.session.id || "no-session",
      };
   }),
});
