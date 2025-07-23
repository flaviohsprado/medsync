import { Button } from "@/components/ui/button";
import { useNavigationLevel } from "@/hooks/use-context";
import { useSession } from "@/lib/auth-client";
import { getNavigationItems } from "@/lib/navigation-config";
import { usePermissions } from "@/lib/permissions";
import { PermissionGate } from "@/lib/route-protection";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/server/react";
import type { SystemRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";

interface SidebarProps {
   isOpen: boolean;
   onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
   const trpc = useTRPC();
   const routerState = useRouterState();
   const { data: session } = useSession();

   const { data: organization, error } = useQuery(trpc.organization.getActiveOrganization.queryOptions());

   console.log("====================> organization", organization);
   console.log("====================> error", error);

   // Extract organization ID from the current path
   const getOrganizationIdFromPath = () => {
      const pathname = routerState.location.pathname;
      const pathSegments = pathname.split("/").filter(Boolean);
      const orgIndex = pathSegments.indexOf("organizations");

      if (orgIndex !== -1 && pathSegments[orgIndex + 1]) {
         return pathSegments[orgIndex + 1];
      }
      return null;
   };

   const organizationId = getOrganizationIdFromPath();

   const { user, hasPermission, hasRole, isSuperAdmin, isAdmin, isUser } = usePermissions();

   // Get current navigation level and corresponding navigation items
   const navigationLevel = useNavigationLevel();
   const navigationItems = getNavigationItems(navigationLevel);

   // Filter navigation items based on permissions and user context
   const filteredItems = navigationItems.filter((item) => {
      if (!user) return false;

      // Check system role requirement
      if (item.systemRoles && !item.systemRoles.includes(user.systemRole! as SystemRole)) {
         return false;
      }

      // Check specific role requirement
      if (item.requiredRole && !hasRole(item.requiredRole)) {
         return false;
      }

      // Check permission for the resource
      const permissionCheck = hasPermission(item.resource, item.action);
      if (!permissionCheck.allowed) {
         return false;
      }

      // Additional profile-based filtering for user role
      if (user.systemRole === "user" && item.profiles) {
         const userProfile = user.profileId;
         if (!userProfile || !item.profiles.includes(userProfile)) {
            return false;
         }
      }

      return true;
   });

   const isActiveRoute = (path: string) => {
      //pathname: /organizations/e4a42933-9370-42eb-a4df-200fed0d8b9a/dashboard
      //path: /organizations/$id/dashboard
      const pathname = routerState.location.pathname;

      // Extract organization ID from current pathname
      const pathSegments = pathname.split("/").filter(Boolean);
      const orgIndex = pathSegments.indexOf("organizations");
      const unitIndex = pathSegments.indexOf("units");

      let processedPath = path;

      // Replace $id with actual organization ID if found
      if (orgIndex !== -1 && pathSegments[orgIndex + 1]) {
         processedPath = processedPath.replace("$id", pathSegments[orgIndex + 1]);
      }

      // Replace $unitId with actual unit ID if found
      if (unitIndex !== -1 && pathSegments[unitIndex + 1]) {
         processedPath = processedPath.replace("$unitId", pathSegments[unitIndex + 1]);
      }

      return pathname === processedPath;
   };

   const getRoleDisplayName = () => {
      if (isSuperAdmin) return "Super Admin";
      if (isAdmin) return "Administrador";
      if (isUser) {
         const profile = user?.profileId;
         // For now, just show the profile name or "Usuário" if no profile
         // In a real implementation, you could fetch the profile name from the database
         if (profile) return `Usuário (${profile})`;
         return "Usuário";
      }
      return "Usuário";
   };

   const getContextDisplayName = () => {
      switch (navigationLevel) {
         case "admin":
            return "Sistema";
         case "organization":
            return "Organização";
         case "unit":
            return "Unidade";
         default:
            return "Sistema";
      }
   };

   return (
      <>
         {/* Mobile Overlay */}
         {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} aria-hidden="true" />}

         {/* Sidebar */}
         <aside
            className={cn(
               "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r transition-transform duration-300 z-50",
               "md:translate-x-0 md:relative md:top-0 md:h-[calc(100vh-4rem)]",
               isOpen ? "translate-x-0" : "-translate-x-full",
            )}
         >
            <div className="flex flex-col h-full">
               {/* Mobile Close Button */}
               <div className="flex items-center justify-between p-4 border-b md:hidden">
                  <h2 className="font-semibold">Menu</h2>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                     <X className="h-4 w-4" />
                  </Button>
               </div>

               {/* Context Indicator */}
               <div className="p-4 border-b bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                     Contexto: {getContextDisplayName()}
                  </p>
               </div>

               {/* Navigation */}
               <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                     {filteredItems.map((item) => {
                        const isActive = isActiveRoute(item.to);
                        return (
                           <li key={item.to}>
                              <PermissionGate
                                 resource={item.resource}
                                 action={item.action}
                                 requireRole={item.requiredRole}
                              >
                                 <Link
                                    to={item.to}
                                    onClick={onClose}
                                    className={cn(
                                       "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                       "hover:bg-accent hover:text-accent-foreground",
                                       isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                                    )}
                                 >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                 </Link>
                              </PermissionGate>
                           </li>
                        );
                     })}
                  </ul>
               </nav>

               {/* User Info */}
               <div className="p-4 border-t">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{session?.user?.name?.charAt(0).toUpperCase()}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{getRoleDisplayName()}</p>
                        {user?.organizationId && organizationId && (
                           <p className="text-xs text-muted-foreground/70">
                              Org: {organization?.name || "Organização"}
                           </p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </aside>
      </>
   );
}
