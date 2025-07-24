import { PERMISSIONS, ROUTE_PERMISSIONS } from "@/constants";
import type { User } from "@/server/auth";
import type { Db } from "@/server/db";
import { profile } from "@/server/db/schema";
import { useTRPC } from "@/server/react";
import type { Permission, PermissionCheckResult, SystemRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc } from "better-auth/plugins/organization/access";
import { eq } from "drizzle-orm";

const statement = {
   organization: ["create", "read", "update", "delete"],
   unit: ["create", "read", "update", "delete"],
   user: ["read", "create", "update", "delete", "impersonate"],
   appointment: ["read", "create", "update", "delete"],
   patient: ["read", "create", "update", "delete"],
   medical_record: ["read", "create", "update", "delete"],
   prescription: ["read", "create", "update", "delete"],
   schedule: ["read", "create", "update", "delete"],
   report: ["read", "create", "update", "delete"],
   dashboard: ["read"],
   profile: ["read", "create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

// Super Admin: Global access across all organizations
export const super_admin = ac.newRole({
   ...adminAc.statements,
   organization: ["create", "read", "update", "delete"],
   unit: ["create", "read", "update", "delete"],
   user: ["read", "create", "update", "delete", "impersonate"],
   appointment: ["read", "create", "update", "delete"],
   patient: ["read", "create", "update", "delete"],
   medical_record: ["read", "create", "update", "delete"],
   prescription: ["read", "create", "update", "delete"],
   schedule: ["read", "create", "update", "delete"],
   report: ["read", "create", "update", "delete"],
   dashboard: ["read"],
   profile: ["read", "create", "update", "delete"],
});

// Admin: Organization-level access (can control everything in their organization)
export const admin = ac.newRole({
   organization: ["read", "update"], // Can only read/update their own org
   unit: ["create", "read", "update", "delete"], // Full access to units in their org
   user: ["read", "create", "update", "delete", "impersonate"], // Manage users in their org, can impersonate
   appointment: ["read", "create", "update", "delete"],
   patient: ["read", "create", "update", "delete"],
   medical_record: ["read", "create", "update", "delete"],
   prescription: ["read", "create", "update", "delete"],
   schedule: ["read", "create", "update", "delete"],
   report: ["read", "create", "update", "delete"],
   dashboard: ["read"],
   profile: ["read", "create", "update", "delete"], // Manage profiles in their org
});

// User: Basic access (permissions will be defined by admin through profiles)
export const user = ac.newRole({
   dashboard: ["read"],
   // Other permissions will be defined by admin through profiles
});

// Permission middleware for TRPC
export function createPermissionMiddleware() {
   return async (opts: any) => {
      const { ctx, next } = opts;

      // Add permission checking functions to context
      ctx.hasPermission = (resource: string, action: string, targetOrgId?: string, targetUnitId?: string) => {
         if (!ctx.user) return { allowed: false, reason: "User not authenticated" };

         // Import permission helpers dynamically to avoid circular imports
         const { hasPermission } = require("@/lib/permissions");
         return hasPermission(ctx.user, resource, action, targetOrgId, targetUnitId);
      };

      ctx.canAccessRoute = (route: string) => {
         if (!ctx.user) return false;

         const { canAccessRoute } = require("@/lib/permissions");
         return canAccessRoute(ctx.user, route);
      };

      return next();
   };
}

// Helper function to check permissions in routes
export function requirePermission(resource: string, action: string) {
   return (ctx: any) => {
      const permissionCheck = ctx.hasPermission(resource, action);
      if (!permissionCheck.allowed) {
         throw new Error(permissionCheck.reason || "Insufficient permissions");
      }
   };
}

// Helper function to check role requirements
export function requireRole(role: "super_admin" | "admin" | "user") {
   return (ctx: any) => {
      if (!ctx.user) {
         throw new Error("User not authenticated");
      }

      const { hasRequiredRole } = require("@/lib/permissions");
      if (!hasRequiredRole(ctx.user, role)) {
         throw new Error("Insufficient role permissions");
      }
   };
}

// Available permissions that can be assigned to profiles

// Route permission definitions

/**
 * Check if user has permission for a specific resource and action
 *
 * Simplified permission checking that:
 * - Validates system role hierarchy (super_admin > admin > user)
 * - Checks organization boundaries for admin users
 * - Evaluates profile-based permissions for regular users (defined by admin)
 * - Provides detailed failure reasons
 *
 * @param user - The user to check permissions for
 * @param resource - The resource being accessed (e.g., "patient", "appointment")
 * @param action - The action being performed ("create", "read", "update", "delete")
 * @param targetOrganizationId - Optional organization ID for cross-org access checks
 * @param targetUnitId - Optional unit ID for cross-unit access checks
 * @param cachedPermissions - Optional cached permissions array for performance
 * @returns PermissionCheckResult with allowed status and reason if denied
 */
export function hasPermission(
   user: User,
   resource: string,
   action: "create" | "read" | "update" | "delete",
   targetOrganizationId?: string,
   targetUnitId?: string,
   cachedPermissions?: Permission[],
): PermissionCheckResult {
   if (!user) {
      return { allowed: false, reason: "User not authenticated" };
   }

   // Super admin has access to everything
   if (user.systemRole === "super_admin") {
      return { allowed: true };
   }

   // Admin has access within their organization
   if (user.systemRole === "admin") {
      if (targetOrganizationId && user.organizationId !== targetOrganizationId) {
         return { allowed: false, reason: "Access denied to different organization" };
      }
      return { allowed: true };
   }

   // Regular users need specific permissions defined by admin through profiles
   if (user.systemRole === "user") {
      // Check organization boundary first
      if (targetOrganizationId && user.organizationId !== targetOrganizationId) {
         return { allowed: false, reason: "Access denied to different organization" };
      }

      // Get user's permissions based on their profile
      const userPermissions = getUserPermissions(user, cachedPermissions);

      // Check if user has permission for this resource and action
      for (const permission of userPermissions) {
         // Check if this permission applies to the resource
         if (permission.resource !== resource && permission.resource !== "*") {
            continue;
         }

         // Check if the action is allowed
         if (!permission.actions.includes(action)) {
            continue;
         }

         // Check scope-based restrictions
         if (permission.scope) {
            switch (permission.scope) {
               case "organization":
                  // User can access within their organization
                  if (targetOrganizationId && user.organizationId !== targetOrganizationId) {
                     continue;
                  }
                  break;

               case "unit":
                  // User can only access within their unit
                  if (targetUnitId && user.unitId !== targetUnitId) {
                     continue;
                  }
                  // If no specific unit is targeted, but user is restricted to unit scope,
                  // they can only access their own unit
                  if (!targetUnitId && targetOrganizationId && user.organizationId === targetOrganizationId) {
                     // Allow access to their own unit data
                     break;
                  }
                  break;

               case "self":
                  // User can only access their own data
                  // This would typically require additional context about which user's data is being accessed
                  // For now, we'll allow it and let the calling code handle the specific user checks
                  break;
            }
         }

         // If we reach here, the permission matches and scope is satisfied
         return { allowed: true };
      }

      return { allowed: false, reason: "Insufficient permissions for this resource and action" };
   }

   return { allowed: false, reason: "Unknown role" };
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(user: User, route: string): boolean {
   if (!user) return false;

   const routePermission = ROUTE_PERMISSIONS[route];
   if (!routePermission) {
      // If route is not defined in permissions, allow access for authenticated users
      return true;
   }

   // Check role requirement
   if (routePermission.requiredRole) {
      if (!hasRequiredRole(user, routePermission.requiredRole)) {
         return false;
      }
   }

   // Check resource permission
   const permissionCheck = hasPermission(user, routePermission.resource, routePermission.action);
   return permissionCheck.allowed;
}

/**
 * Get list of routes user can access (for sidebar rendering)
 */
export function getAccessibleRoutes(user: User): string[] {
   if (!user) return [];

   const allRoutes = Object.keys(ROUTE_PERMISSIONS);
   return allRoutes.filter((route) => canAccessRoute(user, route));
}

/**
 * Check if user has required role or higher
 */
export function hasRequiredRole(user: User, requiredRole: SystemRole): boolean {
   if (!user) return false;

   const roleHierarchy: Record<SystemRole, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
   };

   const userRoleLevel = roleHierarchy[user.systemRole as SystemRole] || 0;
   const requiredRoleLevel = roleHierarchy[requiredRole] || 999;

   return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if user can perform action on specific resource
 */
export function canPerformAction(
   user: User,
   resource: string,
   action: "create" | "read" | "update" | "delete",
   targetOrganizationId?: string,
   targetUnitId?: string,
): boolean {
   const permissionCheck = hasPermission(user, resource, action, targetOrganizationId, targetUnitId);
   return permissionCheck.allowed;
}

/**
 * Check if user has a specific permission without scope restrictions
 */
export function hasBasicPermission(
   user: User,
   resource: string,
   action: "create" | "read" | "update" | "delete",
): boolean {
   if (!user) return false;

   const userPermissions = getUserPermissions(user);

   return userPermissions.some(
      (permission) =>
         (permission.resource === resource || permission.resource === "*") &&
         permission.actions.includes(action),
   );
}

/**
 * Get user's permissions based on their profile
 * This is a synchronous function that works with cached permissions
 * For client-side use, the permissions should be fetched via TRPC
 */
export function getUserPermissions(user: User, cachedPermissions?: Permission[]): Permission[] {
   if (!user) return [];

   // If permissions are cached (from TRPC), use them
   if (cachedPermissions) {
      return cachedPermissions;
   }

   // For super admin and admin, return all permissions
   if (user.systemRole === "super_admin" || user.systemRole === "admin") {
      return PERMISSIONS; // All available permissions
   }

   // For regular users without cached permissions, return empty array
   // The permissions should be fetched via TRPC on the client side
   if (user.systemRole === "user") {
      // If we have no profile assigned and no cached permissions, return basic read permissions
      // This is a fallback to prevent users from being completely locked out
      if (!user.profileId && !cachedPermissions) {
         return [{ resource: "dashboard", actions: ["read"], scope: "organization" }];
      }
      return [];
   }

   return [];
}

/**
 * Fetch user permissions from database based on their profile
 * This function should be called from TRPC procedures to get real-time permissions
 */
export async function fetchUserPermissionsFromDatabase(db: Db, user: User): Promise<Permission[]> {
   if (!user || user.systemRole !== "user" || !user.profileId) {
      return [];
   }

   try {
      const response = await db.query.profile.findFirst({
         where: eq(profile.id, user.profileId),
      });

      if (!response) return [];

      return response.permissions || [];
   } catch (error) {
      console.error("Error fetching user permissions from database:", error);
      return [];
   }
}

export function usePermissions() {
   const trpc = useTRPC();
   const { data: user } = useQuery(trpc.user.getCurrentUser.queryOptions());

   // Fetch user permissions from server
   const { data: userPermissions } = useQuery({
      ...trpc.user.getPermissions.queryOptions(),
      enabled: !!user,
   });

   return {
      user: user,
      permissions: userPermissions || [],
      hasPermission: (resource: string, action: "create" | "read" | "update" | "delete") => {
         if (!user) return { allowed: false, reason: "Not authenticated" };
         return hasPermission(user, resource, action, undefined, undefined, userPermissions);
      },
      hasRole: (role: SystemRole) => {
         if (!user) return false;
         return hasRequiredRole(user, role);
      },
      canAccessRoute: (route: string) => {
         if (!user) return false;
         return canAccessRoute(user, route);
      },
      isSuperAdmin: user?.role === "super_admin",
      isAdmin: user?.role === "admin",
      isUser: user?.role === "user",
   };
}

/**
 * Check if user can assign a specific role to another user
 */
export function canAssignRole(
   assignerUser: User,
   targetRole: SystemRole,
   targetOrganizationId?: string,
): PermissionCheckResult {
   if (!assignerUser) {
      return { allowed: false, reason: "User not authenticated" };
   }

   // Super admin can assign any role
   if (assignerUser.systemRole === "super_admin") {
      return { allowed: true };
   }

   // Admin can only assign user role within their organization
   if (assignerUser.systemRole === "admin") {
      if (targetRole === "super_admin" || targetRole === "admin") {
         return { allowed: false, reason: "Admin cannot assign super_admin or admin roles" };
      }

      if (targetOrganizationId && assignerUser.organizationId !== targetOrganizationId) {
         return { allowed: false, reason: "Admin can only assign roles within their organization" };
      }

      return { allowed: true };
   }

   // Regular users cannot assign roles
   return { allowed: false, reason: "Regular users cannot assign roles" };
}

/**
 * Check if user belongs to a specific organization
 */
export function belongsToOrganization(user: User, organizationId: string): boolean {
   if (!user) return false;
   return user.organizationId === organizationId;
}

/**
 * Check if user belongs to a specific unit
 */
export function belongsToUnit(user: User, unitId: string): boolean {
   if (!user) return false;
   return user.unitId === unitId;
}

/**
 * Check if user can access a resource with context
 */
export function canAccessResource(
   user: User,
   resource: string,
   action: "create" | "read" | "update" | "delete",
   context?: {
      organizationId?: string;
      unitId?: string;
      ownerId?: string; // For user-scoped resources
   },
): PermissionCheckResult {
   if (!user) {
      return { allowed: false, reason: "User not authenticated" };
   }

   // Super admin can access everything
   if (user.systemRole === "super_admin") {
      return { allowed: true };
   }

   // Admin can access everything within their organization
   if (user.systemRole === "admin") {
      if (context?.organizationId && user.organizationId !== context.organizationId) {
         return { allowed: false, reason: "Access denied to different organization" };
      }
      return { allowed: true };
   }

   // Regular users need specific permissions
   if (user.systemRole === "user") {
      // Check organization boundary
      if (context?.organizationId && user.organizationId !== context.organizationId) {
         return { allowed: false, reason: "Access denied to different organization" };
      }

      // Get user's permissions
      const userPermissions = getUserPermissions(user);

      // Check if user has permission for this resource and action
      for (const permission of userPermissions) {
         if (permission.resource !== resource && permission.resource !== "*") {
            continue;
         }

         if (!permission.actions.includes(action)) {
            continue;
         }

         // Check scope restrictions
         if (permission.scope) {
            switch (permission.scope) {
               case "organization":
                  if (context?.organizationId && user.organizationId !== context.organizationId) {
                     continue;
                  }
                  break;

               case "unit":
                  if (context?.unitId && user.unitId !== context.unitId) {
                     continue;
                  }
                  break;

               case "self":
                  if (context?.ownerId && user.id !== context.ownerId) {
                     continue;
                  }
                  break;
            }
         }

         return { allowed: true };
      }

      return { allowed: false, reason: "Insufficient permissions for this resource and action" };
   }

   return { allowed: false, reason: "Unknown role" };
}

/**
 * Get a summary of user's permissions for display purposes
 */
export function getPermissionSummary(user: User): string[] {
   if (!user) return [];

   const summary: string[] = [];

   switch (user.systemRole) {
      case "super_admin":
         summary.push("Full system access");
         summary.push("Can manage all organizations");
         summary.push("Can assign any role");
         break;

      case "admin":
         summary.push("Organization-level access");
         summary.push("Can manage organization users");
         summary.push("Can create and manage profiles");
         summary.push("Can assign user roles");
         break;

      case "user":
         summary.push("Profile-based permissions");
         summary.push("Access defined by admin");
         break;
   }

   return summary;
}
