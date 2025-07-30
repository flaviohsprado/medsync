import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { createTRPCContext } from "./api";

export const t = initTRPC.context<ReturnType<typeof createTRPCContext>>().create({
   transformer: superjson,
   errorFormatter({ shape, error }) {
      return {
         ...shape,
         data: {
            ...shape.data,
            zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
         },
      };
   },
});

const timingMiddleware = t.middleware(async ({ ctx, next, path }) => {
   const context = await ctx;
   const start = Date.now();
   const end = Date.now();

   console.info(`[TRPC] ${path} took ${end - start}ms to execute`);

   return next({
      ctx: context,
   });
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
   const context = await ctx;
   if (!context.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
   }

   if (!context.user.organizationId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not part of an organization" });
   }

   return next({
      ctx: context,
   });
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
   const context = await ctx;
   const user = context.user;

   if (!user) {
      throw new TRPCError({
         code: "FORBIDDEN",
         message: "The user doesn't exists",
      });
   }

   if (!context.user.organizationId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User is not part of an organization" });
   }

   if (user.systemRole !== "admin" && user.systemRole !== "super_admin") {
      throw new TRPCError({
         code: "FORBIDDEN",
         message: "Only admin can create organizations",
      });
   }

   return next({
      ctx: context,
   });
});

export const createTRPCRouter = t.router;
export const adminProcedure = t.procedure.use(isAdmin);
export const protectedProcedure = t.procedure.use(isAuthed);
export const publicProcedure = t.procedure.use(timingMiddleware);
