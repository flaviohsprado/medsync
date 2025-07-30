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
import type { CustomOptions, NavItem, Permission, RoutePermission } from "./types";

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

export const especialties: CustomOptions = [
   { label: "Alergologia", value: "alergologia" },
   { label: "Anestesiologia", value: "anestesiologia" },
   { label: "Angiologia", value: "angiologia" },
   { label: "Cardiologia", value: "cardiologia" },
   { label: "Cirurgia Cardiovascular", value: "cirurgia_cardiovascular" },
   { label: "Cirurgia da Mão", value: "cirurgia_da_mao" },
   { label: "Cirurgia de Cabeça e Pescoço", value: "cirurgia_cabeca_pescoco" },
   { label: "Cirurgia do Aparelho Digestivo", value: "cirurgia_aparelho_digestivo" },
   { label: "Cirurgia Geral", value: "cirurgia_geral" },
   { label: "Cirurgia Pediátrica", value: "cirurgia_pediatrica" },
   { label: "Cirurgia Plástica", value: "cirurgia_plastica" },
   { label: "Cirurgia Torácica", value: "cirurgia_toracica" },
   { label: "Cirurgia Vascular", value: "cirurgia_vascular" },
   { label: "Clínica Médica", value: "clinica_medica" },
   { label: "Dermatologia", value: "dermatologia" },
   { label: "Endocrinologia e Metabologia", value: "endocrinologia" },
   { label: "Endoscopia", value: "endoscopia" },
   { label: "Gastroenterologia", value: "gastroenterologia" },
   { label: "Genética Médica", value: "genetica_medica" },
   { label: "Geriatria", value: "geriatria" },
   { label: "Geral", value: "geral" },
   { label: "Ginecologia e Obstetrícia", value: "ginecologia_obstetricia" },
   { label: "Hematologia e Hemoterapia", value: "hematologia" },
   { label: "Homeopatia", value: "homeopatia" },
   { label: "Infectologia", value: "infectologia" },
   { label: "Mastologia", value: "mastologia" },
   { label: "Medicina de Emergência", value: "medicina_emergencia" },
   { label: "Medicina de Família e Comunidade", value: "medicina_familia_comunidade" },
   { label: "Medicina do Trabalho", value: "medicina_trabalho" },
   { label: "Medicina Esportiva", value: "medicina_esportiva" },
   { label: "Medicina Física e Reabilitação", value: "medicina_fisica_reabilitacao" },
   { label: "Medicina Intensiva", value: "medicina_intensiva" },
   { label: "Medicina Legal e Perícia Médica", value: "medicina_legal" },
   { label: "Medicina Nuclear", value: "medicina_nuclear" },
   { label: "Medicina Preventiva e Social", value: "medicina_preventiva" },
   { label: "Nefrologia", value: "nefrologia" },
   { label: "Neurocirurgia", value: "neurocirurgia" },
   { label: "Neurologia", value: "neurologia" },
   { label: "Nutrologia", value: "nutrologia" },
   { label: "Oftalmologia", value: "oftalmologia" },
   { label: "Oncologia Clínica", value: "oncologia_clinica" },
   { label: "Ortopedia e Traumatologia", value: "ortopedia_traumatologia" },
   { label: "Otorrinolaringologia", value: "otorrinolaringologia" },
   { label: "Patologia", value: "patologia" },
   { label: "Patologia Clínica / Medicina Laboratorial", value: "patologia_clinica" },
   { label: "Pediatria", value: "pediatria" },
   { label: "Pneumologia", value: "pneumologia" },
   { label: "Psiquiatria", value: "psiquiatria" },
   { label: "Radiologia e Diagnóstico por Imagem", value: "radiologia" },
   { label: "Reumatologia", value: "reumatologia" },
   { label: "Urologia", value: "urologia" },
];
