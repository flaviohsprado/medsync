import { PERMISSIONS } from "@/constants";
import { canAssignRole } from "@/lib/permissions";
import { UserFormSchema, assignRoleSchema, updateUserSchema } from "@/lib/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { user } from "../db/auth-schema";
import { profile } from "../db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
   // Get current user's permissions
   getPermissions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.systemRole === "super_admin" || ctx.user.systemRole === "admin") {
         return PERMISSIONS;
      }

      // Regular users get permissions from their profile
      if (ctx.user.systemRole === "user" && ctx.user.profileId) {
         try {
            const userProfile = await ctx.db.query.profile.findFirst({
               where: eq(profile.id, ctx.user.profileId),
            });
            if (userProfile) {
               return userProfile.permissions || [];
            }
         } catch (error) {
            console.error("Error fetching user profile permissions:", error);
         }
      }

      return [];
   }),

   // Debug: Get profiles for user's organization
   getOrganizationProfiles: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
         });
      }

      if (!ctx.user.organizationId) {
         return [];
      }

      try {
         const orgProfiles = await ctx.db
            .select()
            .from(profile)
            .where(eq(profile.organizationId, ctx.user.organizationId));
         return orgProfiles;
      } catch (error) {
         console.error("Error fetching organization profiles:", error);
         return [];
      }
   }),

   // Assign profile to user (for debugging/fixing)
   assignProfile: protectedProcedure
      .input(
         z.object({
            userId: z.string(),
            profileId: z.string(),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         // Check permissions
         if (ctx.user?.systemRole !== "admin" && ctx.user?.systemRole !== "super_admin") {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Only admins can assign profiles",
            });
         }

         // Update user with profile
         const [updatedUser] = await ctx.db
            .update(user)
            .set({
               profileId: input.profileId,
               updatedAt: new Date(),
            })
            .where(eq(user.id, input.userId))
            .returning();

         return updatedUser;
      }),

   listAll: protectedProcedure
      .input(
         z
            .object({
               limit: z.number().optional(),
               offset: z.number().optional(),
            })
            .optional(),
      )
      .query(async ({ ctx, input }) => {
         const systemRole = ctx.user?.systemRole;

         if (systemRole !== "super_admin") {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Acesso negado. Apenas Super Administradores podem executar esta ação.",
            });
         }

         try {
            const limit = input?.limit ?? 100;
            const offset = input?.offset ?? 0;

            const users = await ctx.db.select().from(user).limit(limit).offset(offset);

            return users;
         } catch (error) {
            console.error("Erro interno ao buscar usuários:", error);
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Falha ao buscar a lista de usuários.",
            });
         }
      }),

   getAll: protectedProcedure
      .input(
         z.object({
            organizationId: z.string().optional(),
            unitId: z.string().optional(),
         }),
      )
      .query(async ({ ctx, input }) => {
         const whereConditions: any[] = [];

         // Super admin can see all users
         if (ctx.user?.systemRole === "super_admin") {
            if (input.organizationId) {
               whereConditions.push(eq(user.organizationId, input.organizationId));
            }
            if (input.unitId) {
               whereConditions.push(eq(user.unitId, input.unitId));
            }
         }
         // Admin can only see users in their organization
         else if (ctx.user?.systemRole === "admin") {
            whereConditions.push(eq(user.organizationId, ctx.user.organizationId!));
            if (input.unitId) {
               whereConditions.push(eq(user.unitId, input.unitId));
            }
         }
         // Regular users can only see themselves
         else {
            whereConditions.push(eq(user.id, ctx.user!.id));
         }

         const whereClause = whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0];

         const result = whereClause
            ? await ctx.db.select().from(user).where(whereClause)
            : await ctx.db.select().from(user);

         return result;
      }),

   // Get user by ID
   getById: protectedProcedure
      .input(
         z.object({
            id: z.string().min(1, "User ID is required"),
         }),
      )
      .query(async ({ ctx, input }) => {
         const [targetUser] = await ctx.db.select().from(user).where(eq(user.id, input.id));

         if (!targetUser) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "User not found",
            });
         }

         // Check permissions based on user context
         if (ctx.user?.systemRole === "super_admin") {
            // Super admin can see any user
         } else if (ctx.user?.systemRole === "admin") {
            // Admin can only see users in their organization
            if ((targetUser as any).organizationId !== ctx.user.organizationId) {
               throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Cannot access user from different organization",
               });
            }
         } else {
            // Regular users can only see themselves
            if (targetUser.id !== ctx.user?.id) {
               throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Cannot access other users",
               });
            }
         }

         return targetUser;
      }),

   create: protectedProcedure.input(UserFormSchema).mutation(async ({ ctx, input }) => {
      // Check permissions - only admin and super_admin can create users
      if (ctx.user?.systemRole !== "admin" && ctx.user?.systemRole !== "super_admin") {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create users",
         });
      }

      // Admin can only create users in their organization
      if (ctx.user?.systemRole === "admin" && ctx.user.organizationId !== input.organizationId) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot create user in different organization",
         });
      }

      try {
         // Use Better Auth to create the user
         const newUser = await ctx.auth.api.signUpEmail({
            body: {
               email: input.email,
               password: input.password!,
               name: input.name,
               organizationId: input.organizationId,
               unitId: input.unitId,
               systemRole: input.systemRole || "user",
            },
         });

         return newUser;
      } catch (error) {
         console.error("Error creating user:", error);
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
         });
      }
   }),

   // Update user
   update: protectedProcedure.input(updateUserSchema).mutation(async ({ ctx, input }) => {
      // Get existing user first
      const [existingUser] = await ctx.db.select().from(user).where(eq(user.id, input.id));

      if (!existingUser) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
         });
      }

      // Additional role-based checks
      if (ctx.user?.systemRole === "admin") {
         // Admin can only update users in their organization
         if ((existingUser as any).organizationId !== ctx.user.organizationId) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Cannot update user from different organization",
            });
         }
      } else if (ctx.user?.systemRole === "user") {
         // Regular users can only update themselves
         if (existingUser.id !== ctx.user.id) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Cannot update other users",
            });
         }
      }

      const updateData: any = {
         updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.organizationId !== undefined) updateData.organizationId = input.organizationId;
      if (input.unitId !== undefined) updateData.unitId = input.unitId;
      if (input.systemRole !== undefined) updateData.systemRole = input.systemRole;
      if (input.profile !== undefined) updateData.profileId = input.profile;

      const [updatedUser] = await ctx.db.update(user).set(updateData).where(eq(user.id, input.id)).returning();

      return updatedUser;
   }),

   // Assign role to user
   assignRole: protectedProcedure.input(assignRoleSchema).mutation(async ({ ctx, input }) => {
      // Get target user
      const [targetUser] = await ctx.db.select().from(user).where(eq(user.id, input.userId));

      if (!targetUser) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
         });
      }

      // Check if current user can assign this role
      const roleCheck = canAssignRole(ctx.user!, input.systemRole, (targetUser as any).organizationId);
      if (!roleCheck.allowed) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: roleCheck.reason || "Cannot assign this role",
         });
      }

      // Update user with new role
      const updateData: any = {
         systemRole: input.systemRole,
         updatedAt: new Date(),
      };

      if (input.organizationId !== undefined) updateData.organizationId = input.organizationId;
      if (input.unitId !== undefined) updateData.unitId = input.unitId;
      if (input.profile !== undefined) updateData.profileId = input.profile;

      const [updatedUser] = await ctx.db.update(user).set(updateData).where(eq(user.id, input.userId)).returning();

      return updatedUser;
   }),

   // Get users by organization
   getByOrganization: protectedProcedure
      .input(
         z.object({
            organizationId: z.string().min(1, "Organization ID is required"),
         }),
      )
      .query(async ({ ctx, input }) => {
         // Check if user can access this organization
         if (ctx.user?.systemRole !== "super_admin" && ctx.user?.organizationId !== input.organizationId) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Insufficient permissions to read users from this organization",
            });
         }

         const result = await ctx.db.select().from(user).where(eq(user.organizationId, input.organizationId));

         return result;
      }),

   // Get users by unit
   getByUnit: protectedProcedure
      .input(
         z.object({
            unitId: z.string().min(1, "Unit ID is required"),
         }),
      )
      .query(async ({ ctx, input }) => {
         // Check if user can access this unit
         if (ctx.user?.systemRole !== "super_admin" && ctx.user?.unitId !== input.unitId) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Insufficient permissions to read users from this unit",
            });
         }

         const result = await ctx.db.select().from(user).where(eq(user.unitId, input.unitId));

         return result;
      }),

   // Delete user
   delete: protectedProcedure
      .input(
         z.object({
            id: z.string().min(1, "User ID is required"),
         }),
      )
      .mutation(async ({ ctx, input }) => {
         // Get existing user first
         const [existingUser] = await ctx.db.select().from(user).where(eq(user.id, input.id));

         if (!existingUser) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "User not found",
            });
         }

         // Check permissions
         if (ctx.user?.systemRole === "super_admin") {
            // Super admin can delete any user
         } else if (ctx.user?.systemRole === "admin") {
            // Admin can only delete users in their organization
            if ((existingUser as any).organizationId !== ctx.user.organizationId) {
               throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Cannot delete user from different organization",
               });
            }
         } else {
            // Regular users cannot delete users
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Cannot delete users",
            });
         }

         const [deletedUser] = await ctx.db.delete(user).where(eq(user.id, input.id)).returning();

         return deletedUser;
      }),

   // Get current user profile
   getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
         });
      }

      return ctx.user;
   }),
});
