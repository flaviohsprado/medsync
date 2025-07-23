import { useRouterState } from "@tanstack/react-router";
import { useMemo } from "react";

export type NavigationContext = "admin" | "organization" | "unit";

export interface AppContext {
   type: NavigationContext;
   organizationId?: string;
   unitId?: string;
   isInOrganization: boolean;
   isInUnit: boolean;
}

export const useAppContext = (): AppContext => {
   const routerState = useRouterState();
   const pathname = routerState.location.pathname;

   return useMemo(() => {
      // Extract IDs from URL path
      const pathSegments = pathname.split("/").filter(Boolean);

      // Check if we're in organization context
      const orgIndex = pathSegments.indexOf("organizations");
      const unitIndex = pathSegments.indexOf("units");

      let organizationId: string | undefined;
      let unitId: string | undefined;
      let context: NavigationContext = "admin";

      if (orgIndex !== -1 && pathSegments[orgIndex + 1]) {
         organizationId = pathSegments[orgIndex + 1];
         context = "organization";
      }

      if (unitIndex !== -1 && pathSegments[unitIndex + 1]) {
         unitId = pathSegments[unitIndex + 1];
         context = "unit";
      }

      // If we have a unit ID but no organization ID in path, we're still in unit context
      // This handles cases like /dashboard/patients where we might be in a unit context
      // but the URL doesn't explicitly show organization/unit structure

      return {
         type: context,
         organizationId,
         unitId,
         isInOrganization: context === "organization" || context === "unit",
         isInUnit: context === "unit",
      };
   }, [pathname]);
};

// Hook to determine current navigation level for sidebar
export const useNavigationLevel = () => {
   const context = useAppContext();
   const routerState = useRouterState();
   const pathname = routerState.location.pathname;

   return useMemo(() => {
      // If we're in a unit context or unit-specific routes, show unit-level navigation
      if (
         context.isInUnit ||
         pathname.includes("/patients") ||
         pathname.includes("/appointments") ||
         pathname.includes("/doctors") ||
         pathname.includes("/reports")
      ) {
         return "unit";
      }

      // If we're in organization context, show organization-level navigation
      if (context.isInOrganization) {
         return "organization";
      }

      // Default to admin level (system-wide)
      return "admin";
   }, [context, pathname]);
};
