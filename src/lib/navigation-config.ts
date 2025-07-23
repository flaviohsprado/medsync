import type { SystemRole } from "@/types";
import {
   Building2,
   Calendar,
   Clock,
   FileText,
   Hospital,
   LayoutDashboard,
   Pill,
   Settings,
   Shield,
   Stethoscope,
   UserPlus,
   Users,
} from "lucide-react";

export interface NavItem {
   to: string;
   label: string;
   icon: React.ComponentType<{ className?: string }>;
   resource: string;
   action: "create" | "read" | "update" | "delete";
   requiredRole?: SystemRole;
   systemRoles?: SystemRole[];
   profiles?: string[]; // For user role profile filtering
}

// Function to build dynamic routes based on organization and unit context
export const buildRoute = (basePath: string, organizationId?: string, unitId?: string): string => {
   if (unitId && organizationId) {
      return `/organizations/${organizationId}/units/${unitId}${basePath}`;
   }
   if (organizationId) {
      return `/organizations/${organizationId}${basePath}`;
   }
   return basePath;
};

// Super Admin-level navigation (system-wide, no organization/unit context)
export const superAdminNavigationItems: NavItem[] = [
   {
      to: "/organizations/$id/dashboard",
      label: "Organizações",
      icon: Building2,
      resource: "organization",
      action: "read",
      requiredRole: "super_admin",
      systemRoles: ["super_admin"],
   },
   {
      to: "/organizations/$id/users",
      label: "Usuários",
      icon: UserPlus,
      resource: "user",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/profiles",
      label: "Perfis",
      icon: Shield,
      resource: "role",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/units",
      label: "Unidades",
      icon: Hospital,
      resource: "unit",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];

export const adminNavigationItems: NavItem[] = [
   {
      to: "/organizations/$id/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      resource: "dashboard",
      action: "read",
   },
   {
      to: "/organizations/$id/users",
      label: "Usuários",
      icon: UserPlus,
      resource: "user",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/profiles",
      label: "Perfis",
      icon: Shield,
      resource: "role",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/organizations",
      label: "Organizações",
      icon: Building2,
      resource: "organization",
      action: "read",
      requiredRole: "super_admin",
      systemRoles: ["super_admin"],
   },
];

// Organization-level navigation (when admin enters an organization)
export const organizationNavigationItems: NavItem[] = [
   {
      to: "/organizations/$id/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      resource: "dashboard",
      action: "read",
   },
   {
      to: "/organizations/$id/users",
      label: "Usuários",
      icon: UserPlus,
      resource: "user",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/profiles",
      label: "Perfis",
      icon: Shield,
      resource: "role",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/units",
      label: "Unidades",
      icon: Hospital,
      resource: "unit",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];

// Unit-level navigation (when entering a unit or unit-specific routes)
export const unitNavigationItems: NavItem[] = [
   {
      to: "/organizations/$id/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      resource: "dashboard",
      action: "read",
   },
   {
      to: "/organizations/$id/users",
      label: "Usuários",
      icon: UserPlus,
      resource: "user",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
   {
      to: "/organizations/$id/profiles",
      label: "Perfis",
      icon: Shield,
      resource: "role",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/units/$unitId/patients",
      label: "Pacientes",
      icon: Users,
      resource: "patient",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
   {
      to: "/organizations/$id/units/$unitId/appointments",
      label: "Consultas",
      icon: Calendar,
      resource: "appointment",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
   {
      to: "/organizations/$id/units/$unitId/doctors",
      label: "Médicos",
      icon: Stethoscope,
      resource: "user",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
      // Note: User access will be determined by their profile permissions
   },
   {
      to: "/organizations/$id/units/$unitId/reports",
      label: "Relatórios",
      icon: FileText,
      resource: "report",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },

   // User-level routes (access determined by profile permissions)
   {
      to: "/organizations/$id/units/$unitId/schedule",
      label: "Agenda",
      icon: Clock,
      resource: "schedule",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
   {
      to: "/organizations/$id/units/$unitId/medical-records",
      label: "Prontuários",
      icon: FileText,
      resource: "medical_record",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
   {
      to: "/organizations/$id/units/$unitId/prescriptions",
      label: "Receitas",
      icon: Pill,
      resource: "prescription",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },

   // Settings (Admin level)
   {
      to: "/settings",
      label: "Configurações",
      icon: Settings,
      resource: "settings",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];

// Function to get navigation items based on context
export const getNavigationItems = (context: "super_admin" | "admin" | "organization" | "unit"): NavItem[] => {
   switch (context) {
      case "super_admin":
         return superAdminNavigationItems;
      case "admin":
         return adminNavigationItems;
      case "organization":
         return organizationNavigationItems;
      case "unit":
         return unitNavigationItems;
      default:
         return adminNavigationItems;
   }
};

// Function to resolve dynamic routes with actual IDs
export const resolveNavigationItems = (items: NavItem[], organizationId?: string, unitId?: string): NavItem[] => {
   return items.map((item) => ({
      ...item,
      to: item.to.replace("$id", organizationId || "").replace("$unitId", unitId || ""),
   }));
};
