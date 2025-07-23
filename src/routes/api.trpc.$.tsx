import { canAccessRoute, hasPermission } from "@/lib/permissions";
import { auth as authClient, type User } from "@/server/auth";
import { db } from "@/server/db";
import { user } from "@/server/db/auth-schema";
import { profile } from "@/server/db/schema";
import { trpcRouter } from "@/server/routers";
import type { Context } from "@/types";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { eq } from "drizzle-orm";

const createTRPCContext = async (opts: { req: Request }): Promise<Context> => {
   const session = await authClient.api.getSession({
      headers: opts.req.headers,
   });

   let userAux: User | null = null;
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

            if (dbUser.systemRole === "user" && dbUser.profileId) {
               try {
                  const userProfile = await db.query.profiles.findFirst({
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
            // Fallback to basic user data if not found in database
            userAux = session.user;
         }
      } catch (error) {
         console.warn("Failed to fetch extended user data:", error);
         userAux = session.user;
      }
   }

   const organization = await db.query.organizations.findFirst({
      where: eq(organization.id, userAux?.organizationId ?? ""),
   });

   return {
      headers: opts.req.headers,
      db,
      auth: authClient,
      session,
      user: userAux,
      organization,
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

function handler({ request }: { request: Request }) {
   return fetchRequestHandler({
      req: request,
      router: trpcRouter,
      endpoint: "/api/trpc",
      createContext: createTRPCContext,
   });
}

export const ServerRoute = createServerFileRoute("/api/trpc/$").methods({
   GET: handler,
   POST: handler,
});
