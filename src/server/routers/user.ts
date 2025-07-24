import { PERMISSIONS } from "@/constants";
import { UserFormSchema } from "@/lib/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq, not } from "drizzle-orm";
import { z } from "zod";
import { user } from "../db/auth-schema";
import { profile } from "../db/schema";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";

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

   listAll: adminProcedure
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
      if (ctx.user?.systemRole !== "admin" && ctx.user?.systemRole !== "super_admin") {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create users",
         });
      }

      if (ctx.user?.systemRole === "admin" && ctx.user.organizationId !== input.organizationId) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot create user in different organization",
         });
      }

      console.log("Creating user with input:", input);

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
               profileId: input.profileId || undefined,
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
   update: protectedProcedure
      .input(z.object({ id: z.string(), data: UserFormSchema }))
      .mutation(async ({ ctx, input }) => {
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

         const [updatedUser] = await ctx.db.update(user).set(input.data).where(eq(user.id, input.id)).returning();

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
