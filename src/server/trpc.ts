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

const timingMiddleware = t.middleware(async ({ next, path }) => {
   const start = Date.now();
   const result = await next();
   const end = Date.now();

   console.info(`[TRPC] ${path} took ${end - start}ms to execute`);

   return result;
});

const isAuthed = t.middleware(async ({ ctx, next }) => {
   const resolvedCtx = await ctx;
   if (!resolvedCtx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
   }

   return next({
      ctx: resolvedCtx,
   });
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
   const resolvedCtx = await ctx;
   const user = resolvedCtx.user;

   if (!user) {
      throw new TRPCError({
         code: "FORBIDDEN",
         message: "The user doesn't exists",
      });
   }

   if (user.systemRole !== "admin" && user.systemRole !== "super_admin") {
      throw new TRPCError({
         code: "FORBIDDEN",
         message: "Only admin can create organizations",
      });
   }

   return next({
      ctx: resolvedCtx,
   });
});

export const createTRPCRouter = t.router;
export const adminProcedure = t.procedure.use(isAdmin);
export const protectedProcedure = t.procedure.use(isAuthed);
export const publicProcedure = t.procedure.use(timingMiddleware);
