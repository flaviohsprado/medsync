import { ProfileFormSchema } from "@/lib/schemas";
import type { Permission } from "@/types";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { profile } from "../db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const profileRouter = createTRPCRouter({
   getMyPermissions: protectedProcedure.query(async ({ ctx }) => {
      // Super admin can see all profiles
      if (ctx.user?.systemRole === "super_admin") {
         return await ctx.db.query.profile.findMany();
      }

      // Admin can only see profiles in their organization
      if (ctx.user?.systemRole === "admin") {
         return await ctx.db.query.profile.findMany({
            where: eq(profile.organizationId, ctx.user!.organizationId!),
         });
      }

      // Regular users cannot see profiles
      throw new TRPCError({
         code: "FORBIDDEN",
         message: "Only admins can view profiles",
      });
   }),

   getAll: protectedProcedure.query(async ({ ctx }) => {
      // Super admin can see all profiles
      if (ctx.user?.systemRole === "super_admin") {
         return await ctx.db.query.profile.findMany();
      }

      // Admin can only see profiles in their organization
      if (ctx.user?.systemRole === "admin") {
         return await ctx.db.query.profile.findMany({
            where: eq(profile.organizationId, ctx.user!.organizationId!),
         });
      }

      // Regular users cannot see profiles
      throw new TRPCError({
         code: "FORBIDDEN",
         message: "Only admins can view profiles",
      });
   }),

   create: protectedProcedure.input(ProfileFormSchema).mutation(async ({ ctx, input }) => {
      // Only admin and super admin can create profiles
      if (ctx.user?.systemRole === "user") {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create profiles",
         });
      }

      // Admin can only create profiles in their organization
      if (ctx.user?.systemRole === "admin" && ctx.user.organizationId !== input.organizationId) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot create profile in different organization",
         });
      }

      const [newProfile] = await ctx.db
         .insert(profile)
         .values({
            name: input.name,
            description: input.description,
            organizationId: input.organizationId!,
            permissions: input.permissions as unknown as Permission[],
         })
         .returning();

      return newProfile;
   }),

   update: protectedProcedure
      .input(
         ProfileFormSchema.extend({
            id: z.string().min(1, "Profile ID is required"),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         // Only admin and super admin can update profiles
         if (ctx.user?.systemRole === "user") {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Only admins can update profiles",
            });
         }

         // Get existing profile
         const [existingProfile] = await ctx.db.select().from(profile).where(eq(profile.id, input.id));

         if (!existingProfile) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Profile not found",
            });
         }

         // Admin can only update profiles in their organization
         if (ctx.user?.systemRole === "admin" && existingProfile.organizationId !== ctx.user.organizationId) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Cannot update profile from different organization",
            });
         }

         const [updatedProfile] = await ctx.db
            .update(profile)
            .set({
               name: input.name,
               description: input.description,
               permissions: input.permissions as unknown as Permission[],
               updatedAt: new Date(),
            })
            .where(eq(profile.id, input.id))
            .returning();

         return updatedProfile;
      }),

   delete: protectedProcedure
      .input(
         z.object({
            id: z.string().min(1, "Profile ID is required"),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         // Only admin and super admin can delete profiles
         if (ctx.user?.systemRole === "user") {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Only admins can delete profiles",
            });
         }

         // Get existing profile
         const [existingProfile] = await ctx.db.select().from(profile).where(eq(profile.id, input.id));

         if (!existingProfile) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Profile not found",
            });
         }

         // Admin can only delete profiles in their organization
         if (ctx.user?.systemRole === "admin" && existingProfile.organizationId !== ctx.user.organizationId) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Cannot delete profile from different organization",
            });
         }

         const [deletedProfile] = await ctx.db.delete(profile).where(eq(profile.id, input.id)).returning();

         return deletedProfile;
      }),
});
