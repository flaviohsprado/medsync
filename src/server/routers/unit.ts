import { UnitFormSchema } from "@/lib/schemas";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { unit } from "../db/schema";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

export const unitRouter = createTRPCRouter({
   // Create a new unit
   create: adminProcedure.input(UnitFormSchema).mutation(async ({ ctx, input }) => {
      const permissionCheck = ctx.hasPermission("unit", "create", input.organizationId);
      if (!permissionCheck.allowed) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: permissionCheck.reason || "Insufficient permissions to create unit",
         });
      }

      const [newUnit] = await ctx.db.insert(unit).values(input).returning();

      return newUnit;
   }),

   // Get all units (filtered by user permissions)
   getAll: protectedProcedure
      .input(
         z.object({
            organizationId: z.string().optional(),
         }),
      )
      .query(async ({ ctx, input }) => {
         // Check permissions
         const permissionCheck = ctx.hasPermission("unit", "read");
         if (!permissionCheck.allowed) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: permissionCheck.reason || "Insufficient permissions to read units",
            });
         }

         let whereClause: any;

         // Super admin can see all units
         if (ctx.user.systemRole === "super_admin") {
            if (input.organizationId) {
               whereClause = eq(unit.organizationId, input.organizationId);
            }
         }
         // Admin can only see units in their organization
         else if (ctx.user.systemRole === "admin") {
            whereClause = eq(unit.organizationId, ctx.user.organizationId!);
         }
         // Regular users can only see their unit
         else {
            if (!ctx.user.unitId) {
               return [];
            }
            whereClause = eq(unit.id, ctx.user.unitId);
         }

         const result = whereClause
            ? await ctx.db.select().from(unit).where(whereClause)
            : await ctx.db.select().from(unit);

         return result;
      }),

   // Get unit by ID
   getById: protectedProcedure
      .input(
         z.object({
            id: z.string().min(1, "Unit ID is required"),
         }),
      )
      .query(async ({ ctx, input }) => {
         const response = await ctx.db.query.unit.findFirst({
            where: eq(unit?.id, input.id),
         });

         if (!response) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Unit not found",
            });
         }

         // Check permissions
         const permissionCheck = ctx.hasPermission("unit", "read", response.organizationId);
         if (!permissionCheck.allowed) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: permissionCheck.reason || "Insufficient permissions to read this unit",
            });
         }

         return unit;
      }),

   // Update unit
   update: protectedProcedure
      .input(z.object({ id: z.string(), data: UnitFormSchema }))
      .mutation(async ({ ctx, input }) => {
         const { id, data } = input;

         const existingUnit = await ctx.db.query.unit.findFirst({
            where: eq(unit.id, id),
         });

         if (!existingUnit) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Unit not found",
            });
         }

         // Check permissions
         const permissionCheck = ctx.hasPermission("unit", "update", existingUnit.organizationId);
         if (!permissionCheck.allowed) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: permissionCheck.reason || "Insufficient permissions to update unit",
            });
         }

         const [updatedUnit] = await ctx.db.update(unit).set(data).where(eq(unit.id, id)).returning();

         return updatedUnit;
      }),

   // Delete unit
   delete: protectedProcedure
      .input(
         z.object({
            id: z.string().min(1, "Unit ID is required"),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         // First get the unit to check organization
         const [existingUnit] = await ctx.db.select().from(unit).where(eq(unit.id, input.id));

         if (!existingUnit) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Unit not found",
            });
         }

         // Check permissions
         const permissionCheck = ctx.hasPermission("unit", "delete", existingUnit.organizationId);
         if (!permissionCheck.allowed) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: permissionCheck.reason || "Insufficient permissions to delete unit",
            });
         }

         await ctx.db.delete(unit).where(eq(unit.id, input.id));

         return { success: true };
      }),

   // Get units by organization
   getByOrganization: protectedProcedure
      .input(
         z.object({
            organizationId: z.string().min(1, "Organization ID is required"),
         }),
      )
      .query(async ({ ctx, input }) => {
         // Check permissions
         const permissionCheck = ctx.hasPermission("unit", "read", input.organizationId);
         if (!permissionCheck.allowed) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: permissionCheck.reason || "Insufficient permissions to read units",
            });
         }

         const result = await ctx.db.select().from(unit).where(eq(unit.organizationId, input.organizationId));

         return result;
      }),
});
