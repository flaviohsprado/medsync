import { AppointmentFormSchema } from "@/lib/schemas";
import { AppointmentStatusEnum } from "@/types";
import { appointment } from "../db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const appointmentRouter = createTRPCRouter({
   createAnonymous: publicProcedure.input(AppointmentFormSchema).mutation(async ({ ctx, input }) => {
      const [newAppointment] = await ctx.db
         .insert(appointment)
         .values({
            ...input,
            date: new Date(input.date),
            status: AppointmentStatusEnum.SCHEDULED,
         })
         .returning();
      return newAppointment;
   }),
});
