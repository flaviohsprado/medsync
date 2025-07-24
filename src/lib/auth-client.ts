import { ac, admin, super_admin } from "@/lib/permissions";
import { adminClient, multiSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
   baseURL: typeof window !== "undefined" ? window.location.origin : "",
   plugins: [
      adminClient({
         ac,
         roles: {
            admin: admin,
            super_admin: super_admin,
         },
      }),
      multiSessionClient(),
   ],
   user: {
      additionalFields: {
         organizationId: {
            type: "string",
            required: true,
         },
         unitId: {
            type: "string",
            required: false,
         },
         systemRole: {
            type: "string",
            required: true,
            defaultValue: "user",
         },
         profileId: {
            type: "string",
            required: false,
         },
      },
   },
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Determines the appropriate redirect path after successful authentication
 * based on the user's role and organization context
 */
export const getPostAuthRedirectPath = async (): Promise<string> => {
   try {
      // Get the current session to access user and organization info
      const session = await authClient.getSession();

      if (!session?.data?.user) {
         return "/auth/sign-in";
      }

      const user = session.data.user;
      const role = user.role;
      // @ts-ignore
      const organizationId = user.organizationId;
      // @ts-ignore
      const unitId = user.unitId;

      // NEW: If user is scoped to a unit, go directly to the unit's page
      if (organizationId && unitId) {
         return `/organizations/${organizationId}/units/${unitId}/appointments`;
      }

      // For users with an organization, redirect to their organization dashboard
      if (organizationId) {
         return `/organizations/${organizationId}/dashboard`;
      }

      // For admins without an organization (shouldn't happen normally), redirect to settings
      if (role === "admin") {
         return "/settings";
      }

      // Fallback to the old dashboard route for backward compatibility
      return "/dashboard";
   } catch (error) {
      console.error("Error determining redirect path:", error);
      return "/dashboard";
   }
};
