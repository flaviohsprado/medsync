import type { SystemRole } from "@/types";
import type { LinkOptions } from "@tanstack/react-router";
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
   to: LinkOptions["to"];
   label: string;
   icon: React.ComponentType<{ className?: string }>;
   resource: string;
   action: "create" | "read" | "update" | "delete";
   systemRoles?: SystemRole[];
}

export const ALL_NAVIGATION_ITEMS: NavItem[] = [
   // --- Organization & Admin Level ---
   {
      to: "/organizations/$id/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      resource: "dashboard",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
   {
      to: "/organizations/$id/units",
      label: "Unidades",
      icon: Hospital,
      resource: "unit",
      action: "read",
      systemRoles: ["super_admin", "admin"],
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
      resource: "profile",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   {
      to: "/organizations/$id/organizations",
      label: "Organizações",
      icon: Building2,
      resource: "organization",
      action: "read",
      systemRoles: ["super_admin"],
   },
   // --- Unit Level ---
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
      resource: "doctor",
      action: "read",
      systemRoles: ["super_admin", "admin", "user"],
   },
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
   {
      to: "/organizations/$id/units/$unitId/reports",
      label: "Relatórios",
      icon: FileText,
      resource: "report",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
   // --- System Level ---
   {
      to: "/organizations/settings",
      label: "Configurações",
      icon: Settings,
      resource: "settings",
      action: "read",
      systemRoles: ["super_admin", "admin"],
   },
];
