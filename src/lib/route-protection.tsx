import { useSession } from "@/lib/auth-client";
import { canAccessRoute, hasPermission, hasRequiredRole } from "@/lib/permissions";
import { useTRPC } from "@/server/react";
import type { RoutePermission, SystemRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import type React from "react";

export function withPermission<T extends Record<string, any>>(
   Component: React.ComponentType<T>,
   requiredPermission: RoutePermission,
) {
   return function ProtectedComponent(props: T) {
      const trpc = useTRPC();
      const { data: session } = useSession();
      const { data: user } = useQuery(trpc.user.getById.queryOptions({ id: session?.user?.id! }));

      if (!user) {
         return <UnauthorizedComponent message="Please log in to access this page" />;
      }

      // Check role requirement
      if (requiredPermission.requiredRole && !hasRequiredRole(user, requiredPermission.requiredRole)) {
         return <UnauthorizedComponent message="Insufficient role permissions" />;
      }

      // Check resource permission
      const permissionCheck = hasPermission(user, requiredPermission.resource, requiredPermission.action);
      if (!permissionCheck.allowed) {
         return <UnauthorizedComponent message={permissionCheck.reason || "Access denied"} />;
      }

      return <Component {...props} />;
   };
}

// HOC for role-based protection
export function withRole<T extends Record<string, any>>(
   Component: React.ComponentType<T>,
   requiredRole: SystemRole,
) {
   return function RoleProtectedComponent(props: T) {
      const trpc = useTRPC();
      const { data: session } = useSession();
      const { data: user } = useQuery(trpc.user.getById.queryOptions({ id: session?.user?.id! }));

      if (!user) {
         return <UnauthorizedComponent message="Please log in to access this page" />;
      }

      if (!hasRequiredRole(user, requiredRole)) {
         return <UnauthorizedComponent message="Insufficient role permissions" />;
      }

      return <Component {...props} />;
   };
}

// HOC for organization-scoped protection
export function withOrganization<T extends Record<string, any>>(Component: React.ComponentType<T>) {
   return function OrganizationProtectedComponent(props: T) {
      const trpc = useTRPC();
      const { data: session } = useSession();
      const { data: user } = useQuery(trpc.user.getById.queryOptions({ id: session?.user?.id! }));

      if (!user) {
         return <UnauthorizedComponent message="Please log in to access this page" />;
      }

      if (user.systemRole !== "super_admin") {
         return (
            <UnauthorizedComponent message="No organization assigned. Please contact your administrator." />
         );
      }

      return <Component {...props} />;
   };
}

// Component-level permission checker
export function PermissionGate({
   children,
   resource,
   action,
   fallback,
   requireRole,
}: {
   children: React.ReactNode;
   resource: string;
   action: "create" | "read" | "update" | "delete";
   fallback?: React.ReactNode;
   requireRole?: SystemRole;
}) {
   const trpc = useTRPC();
   const { data: session } = useSession();
   const { data: user } = useQuery(trpc.user.getById.queryOptions({ id: session?.user?.id! }));

   if (!user) {
      return fallback || null;
   }

   // Check role requirement
   if (requireRole && !hasRequiredRole(user, requireRole)) {
      return fallback || null;
   }

   // Check resource permission
   const permissionCheck = hasPermission(user, resource, action);
   if (!permissionCheck.allowed) {
      return fallback || null;
   }

   return <>{children}</>;
}

// Role-based visibility component
export function RoleGate({
   children,
   role,
   fallback,
}: {
   children: React.ReactNode;
   role: SystemRole | SystemRole[];
   fallback?: React.ReactNode;
}) {
   const trpc = useTRPC();
   const { data: session } = useSession();
   const { data: user } = useQuery(trpc.user.getById.queryOptions({ id: session?.user?.id! }));

   if (!user) {
      return fallback || null;
   }

   const requiredRoles = Array.isArray(role) ? role : [role];
   const hasRequiredRoleAccess = requiredRoles.some((r) => hasRequiredRole(user, r));

   if (!hasRequiredRoleAccess) {
      return fallback || null;
   }

   return <>{children}</>;
}

// Unauthorized component
function UnauthorizedComponent({ message }: { message: string }) {
   return (
      <div className="flex items-center justify-center min-h-[400px]">
         <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
               type="button"
               onClick={() => window.history.back()}
               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
               Go Back
            </button>
         </div>
      </div>
   );
}

// Hook for checking permissions
export function usePermissions() {
   const trpc = useTRPC();
   const { data: session } = useSession();
   const { data: user } = useQuery(trpc.user.getById.queryOptions({ id: session?.user?.id! }));

   const permissions = user?.profile?.permissions || [];

   return {
      user,
      permissions,
      hasPermission: (resource: string, action: "create" | "read" | "update" | "delete") => {
         if (!user) return { allowed: false, reason: "Not authenticated" };
         return hasPermission(user, resource, action, undefined, undefined, permissions);
      },
      hasRole: (role: SystemRole) => {
         if (!user) return false;
         return hasRequiredRole(user, role);
      },
      canAccessRoute: (route: string) => {
         if (!user) return false;
         return canAccessRoute(user, route);
      },
      isSuperAdmin: user?.systemRole === "super_admin",
      isAdmin: user?.systemRole === "admin",
      isUser: user?.systemRole === "user",
   };
}

// Route permission definitions for each route
export const PROTECTED_ROUTES: Record<string, RoutePermission> = {
   "/organizations/$id": { resource: "organization", action: "read" },
   "/organizations/$id/dashboard": { resource: "dashboard", action: "read" },
   "/organizations/$id/organizations": { resource: "organization", action: "read", requiredRole: "admin" },
   "/organizations/$id/units": { resource: "unit", action: "read" },
   "/organizations/$id/users": { resource: "user", action: "read" },
   "/organizations/$id/profiles": { resource: "profile", action: "read", requiredRole: "admin" },
   "/organizations/$id/units/$unitId/patients": { resource: "patient", action: "read" },
   "/organizations/$id/units/$unitId/appointments": { resource: "appointment", action: "read" },
   "/organizations/$id/units/$unitId/doctors": { resource: "doctor", action: "read" },
   "/organizations/$id/units/$unitId/schedule": { resource: "schedule", action: "read" },
   "/organizations/$id/units/$unitId/medical-records": { resource: "medical_record", action: "read" },
   "/organizations/$id/units/$unitId/prescriptions": { resource: "prescription", action: "read" },
   "/organizations/$id/units/$unitId/reports": { resource: "report", action: "read", requiredRole: "admin" },
   // Keep dashboard route for backward compatibility but redirect to organization
   "/dashboard": { resource: "dashboard", action: "read" },
} as const;

// Helper function to check if current route is protected
export function isRouteProtected(pathname: string): boolean {
   return pathname in PROTECTED_ROUTES;
}

// Helper function to get route permission config
export function getRoutePermission(pathname: string): RoutePermission | null {
   return PROTECTED_ROUTES[pathname] || null;
}
