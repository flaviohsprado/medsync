import { OrganizationFormSchema } from "@/lib/schemas";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { organization } from "../db/schema";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const organizationRouter = createTRPCRouter({
   getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
      if (ctx.user.systemRole !== "super_admin" && ctx.user.organizationId !== input.id) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Insufficient permissions to read this organization",
         });
      }

      const org = await ctx.db.query.organization.findFirst({
         where: eq(organization.id, input.id),
      });

      if (!org) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
         });
      }

      return org;
   }),

   getActiveOrganization: protectedProcedure.query(async ({ ctx }) => {
      console.log("====================> getActiveOrganization", ctx);
      const currentOrganization = await ctx.db.query.organization.findFirst({
         where: eq(organization.id, ctx.user.organizationId ?? ""),
      });

      if (!currentOrganization) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
         });
      }

      return currentOrganization;
   }),

   getAllOrganizations: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      const response =
         user?.systemRole === "super_admin"
            ? await ctx.db.query.organization.findMany()
            : user?.organizationId
              ? await ctx.db.query.organization.findMany({
                   where: eq(organization.id, user?.organizationId),
                })
              : [];

      const buildHierarchy = (items: any[], parentId: string | null = null): any[] => {
         return items
            .filter((item) => item.parentId === parentId)
            .map((item) => ({
               ...item,
               children: buildHierarchy(items, item.id),
            }));
      };

      return buildHierarchy(response);
   }),

   create: adminProcedure.input(OrganizationFormSchema).mutation(async ({ ctx, input }) => {
      const [newOrg] = await ctx.db.insert(organization).values(input).returning();
      return newOrg;
   }),

   update: adminProcedure
      .input(z.object({ id: z.string(), data: OrganizationFormSchema }))
      .mutation(async ({ ctx, input }) => {
         const existingOrg = await ctx.db.query.organization.findFirst({
            where: eq(organization.id, input.id),
         });

         if (!existingOrg) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Organization not found",
            });
         }

         const [updatedOrg] = await (await ctx).db
            .update(organization)
            .set(input.data)
            .where(eq(organization.id, input.id))
            .returning();

         return updatedOrg;
      }),

   delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
      await ctx.db.delete(organization).where(eq(organization.id, input.id));

      return { success: true };
   }),

   setActiveOrganization: adminProcedure
      .input(z.object({ organizationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
         if (ctx.user.systemRole !== "super_admin" && ctx.user.organizationId !== input.organizationId) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Cannot access this organization",
            });
         }

         return { status: "ok" };

         /*return await (await ctx).auth.api.setActiveOrganization({
            headers: (await ctx).headers,
            body: {
               organizationId: input.organizationId,
            },
         });*/
      }),

   /*getActiveMember: protectedProcedure.query(async ({ ctx }) => {
      const member = await ctx.auth.api.getActiveMember({
         headers: ctx.headers,
      });
      return member;
   }),*/
});
