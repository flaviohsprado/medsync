import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appointmentRouter = createTRPCRouter({
   test: publicProcedure.input(z.object({ name: z.string() })).query(({ input }) => {
      return {
         greeting: `Hello, ${input.name}!`,
         timestamp: new Date().toISOString(),
      };
   }),

   protected: protectedProcedure.input(z.object({ message: z.string() })).query(({ input, ctx }) => {
      return {
         message: `${input.message} - authenticated as ${ctx.user?.email || "unknown"}`,
         session: ctx.session?.session.id || "no-session",
      };
   }),
});
