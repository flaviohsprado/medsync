import {
   Building2,
   Calendar,
   Hospital,
   LayoutDashboard,
   Settings,
   Shield,
   Stethoscope,
   UserPlus,
   Users,
} from "lucide-react";
import type { NavItem, Permission, RoutePermission } from "./types";

export const PERMISSIONS: Permission[] = [
   {
      resource: "dashboard",
      actions: ["read"],
      scope: "organization",
   },
   {
      resource: "organization",
      actions: ["read", "update"],
      scope: "organization",
   },
   {
      resource: "unit",
      actions: ["create", "read", "update", "delete"],
      scope: "organization",
   },
   {
      resource: "user",
      actions: ["create", "read", "update", "delete"],
      scope: "organization",
   },
   {
      resource: "patient",
      actions: ["create", "read", "update", "delete"],
      scope: "unit",
   },
   {
      resource: "appointment",
      actions: ["create", "read", "update", "delete"],
      scope: "unit",
   },
   {
      resource: "doctor",
      actions: ["read", "create", "update", "delete"],
      scope: "unit",
   },
   /*{
      resource: "schedule",
      actions: ["read", "update"],
      scope: "unit",
   },
   {
      resource: "prescription",
      actions: ["create", "read", "update", "delete"],
      scope: "unit",
   },
   {
      resource: "medical_record",
      actions: ["create", "read", "update", "delete"],
      scope: "unit",
   },
   {
      resource: "doctor",
      actions: ["read", "create", "update", "delete"],
      scope: "unit",
   },
   {
      resource: "report",
      actions: ["read"],
      scope: "organization",
   },*/
   {
      resource: "profile",
      actions: ["read", "create", "update", "delete"],
      scope: "organization",
   },
];

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
   "/organizations/$id": { resource: "organization", action: "read" },
   "/organizations/$id/dashboard": { resource: "dashboard", action: "read" },
   "/organizations/$id/organizations": { resource: "organization", action: "read", requiredRole: "admin" },
   "/organizations/$id/units": { resource: "unit", action: "read" },
   "/organizations/$id/users": { resource: "user", action: "read" },
   "/organizations/$id/profiles": { resource: "profile", action: "read", requiredRole: "admin" },
   "/organizations/$id/units/$unitId/patients": { resource: "patient", action: "read" },
   "/organizations/$id/units/$unitId/appointments": { resource: "appointment", action: "read" },
   "/organizations/$id/units/$unitId/doctors": { resource: "doctor", action: "read" },
   //"/organizations/$id/units/$unitId/schedule": { resource: "schedule", action: "read" },
   //"/organizations/$id/units/$unitId/medical-records": { resource: "medical_record", action: "read" },
   // "/organizations/$id/units/$unitId/prescriptions": { resource: "prescription", action: "read" },
   // "/organizations/$id/units/$unitId/reports": { resource: "report", action: "read", requiredRole: "admin" },
   // Keep dashboard route for backward compatibility but redirect to organization
   "/dashboard": { resource: "dashboard", action: "read" },
} as const;

export const ORGANIZATION_NAV_ITEMS: NavItem[] = [
   {
      to: "/organizations/$id/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      resource: "dashboard",
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

export const ADMIN_NAV_ITEMS: NavItem[] = [
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
      resource: "profile",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];

export const ADMIN_UNIT_NAV_ITEMS: NavItem[] = [
   {
      to: "/organizations/$id/units/$unitId/users",
      label: "Usuários",
      icon: UserPlus,
      resource: "user",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/units/$unitId/profiles",
      label: "Perfis",
      icon: Shield,
      resource: "profile",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];

export const UNIT_NAV_ITEMS: NavItem[] = [
   {
      to: "/organizations/$id/units/$unitId/appointments",
      label: "Consultas",
      icon: Calendar,
      resource: "appointment",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
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
      to: "/organizations/$id/units/$unitId/doctors",
      label: "Médicos",
      icon: Stethoscope,
      resource: "doctor",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
];

export const SYSTEM_NAV_ITEMS: NavItem[] = [
   {
      to: "/organizations/$id/organizations",
      label: "Organizações",
      icon: Building2,
      resource: "organization",
      action: "read",
      systemRoles: ["super_admin"],
   },
   {
      to: "/organizations/settings",
      label: "Configurações",
      icon: Settings,
      resource: "settings", // Assuming 'settings' is a defined resource
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];

export const ALL_NAVIGATION_ITEMS: NavItem[] = [
   ...ORGANIZATION_NAV_ITEMS,
   ...ADMIN_NAV_ITEMS,
   ...UNIT_NAV_ITEMS,
   ...SYSTEM_NAV_ITEMS,
];
