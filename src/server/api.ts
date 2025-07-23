import { canAccessRoute, hasPermission } from "@/lib/permissions";
import { auth, type User } from "@/server/auth";
import { db } from "@/server/db";
import type { Context } from "@/types";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { eq } from "drizzle-orm";
import { organization, profile, user } from "./db/schema";

export const createTRPCContext = async (opts: CreateNextContextOptions): Promise<Context> => {
   const { req } = opts;
   const session = await auth.api.getSession({ headers: req.headers });

   let userAux: User = {
      id: "",
      name: "",
      email: "",
      emailVerified: false,
      image: "",
      role: "user",
      banned: false,
      unitId: "",
      profileId: "",
      organizationId: "",
      banReason: "",
      banExpires: null,
      updatedAt: new Date(),
      createdAt: new Date(),
      systemRole: "user",
   };

   if (session?.user) {
      try {
         const dbUser = await db.query.user.findFirst({
            where: eq(user.id, session.user.id),
         });

         if (dbUser) {
            userAux = {
               ...session.user,
               organizationId: dbUser.organizationId,
               unitId: dbUser.unitId,
               systemRole: dbUser.systemRole,
               profileId: dbUser.profileId,
            };

            // For regular users, also fetch their profile permissions
            if (dbUser.systemRole === "user" && dbUser.profileId) {
               try {
                  const userProfile = await db.query.profile.findFirst({
                     where: eq(profile.id, dbUser.profileId),
                  });

                  if (userProfile) {
                     Object.assign(userAux, { permissions: userProfile.permissions ?? [] });
                  }
               } catch (error) {
                  console.error("Error fetching user profile permissions:", error);
               }
            }
         } else {
            userAux = session.user;
         }
      } catch (error) {
         console.warn("Failed to fetch extended user data:", error);
         userAux = session.user;
      }
   }

   console.log("===================> DB", db);

   const currentOrganization = await db.query.organization.findFirst({
      where: eq(organization.id, userAux.organizationId ?? ""),
   });

   return {
      headers: req.headers,
      db,
      auth,
      session,
      user: userAux,
      organization: currentOrganization,
      hasPermission: (
         resource: string,
         action: "create" | "read" | "update" | "delete",
         targetOrgId?: string,
         targetUnitId?: string,
      ) => {
         if (!userAux) return { allowed: false, reason: "User not authenticated" };
         return hasPermission(userAux, resource, action, targetOrgId, targetUnitId, (userAux as any).permissions);
      },
      canAccessRoute: (route: string) => {
         if (!userAux) return false;
         return canAccessRoute(userAux, route);
      },
   };
};
