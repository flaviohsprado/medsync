import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { ALL_NAVIGATION_ITEMS } from "@/lib/navigation-config";
import { usePermissions } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/server/react";
import type { SystemRole } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { X } from "lucide-react";

interface SidebarProps {
   isOpen: boolean;
   onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
   const trpc = useTRPC();
   const routerState = useRouterState();
   const params = useParams({ strict: false });
   const { data: session } = useSession();

   const { user, hasPermission, hasRole } = usePermissions();

   const { data: organization } = useQuery(
      trpc.organization.getActiveOrganization.queryOptions(undefined, {
         enabled: !!user?.organizationId,
      }),
   );

   // Filter navigation items based on the user's permissions
   const filteredItems = ALL_NAVIGATION_ITEMS.filter((item) => {
      if (!user) return false;

      // 1. Check if the user's system role is allowed to see the item
      if (item.systemRoles && !item.systemRoles.includes(user.systemRole as SystemRole)) {
         return false;
      }

      // 2. Check if the user has the specific permission for the item's resource and action
      const permissionCheck = hasPermission(item.resource, item.action);
      if (!permissionCheck.allowed) {
         return false;
      }

      return true;
   });

   const isActiveRoute = (path: string) => {
      const { pathname } = routerState.location;

      // Replace placeholders like $id with actual values from URL params
      let processedPath = path;
      if ("id" in params && params.id) {
         processedPath = processedPath.replace("$id", params.id);
      }
      if ("unitId" in params && params.unitId) {
         processedPath = processedPath.replace("$unitId", params.unitId);
      }

      return pathname === processedPath;
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

               {/* Navigation */}
               <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                     {filteredItems.map((item) => {
                        const isActive = isActiveRoute(item.to!);
                        return (
                           <li key={item.to}>
                              <Link
                                 to={item.to}
                                 //@ts-ignore
                                 params={params}
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
                           </li>
                        );
                     })}
                  </ul>
               </nav>

               {/* User Info */}
               <div className="p-4 border-t mt-auto">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{session?.user?.name?.charAt(0).toUpperCase()}</span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                           {user?.systemRole?.replace("_", " ")}
                        </p>
                        {organization && (
                           <p className="text-xs text-muted-foreground/70 truncate">Org: {organization.name}</p>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </aside>
      </>
   );
}
