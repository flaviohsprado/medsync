import type { Permission, RoutePermission } from "./types";

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
   },
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
   "/organizations/$id/units/$unitId/schedule": { resource: "schedule", action: "read" },
   "/organizations/$id/units/$unitId/medical-records": { resource: "medical_record", action: "read" },
   "/organizations/$id/units/$unitId/prescriptions": { resource: "prescription", action: "read" },
   "/organizations/$id/units/$unitId/reports": { resource: "report", action: "read", requiredRole: "admin" },
   // Keep dashboard route for backward compatibility but redirect to organization
   "/dashboard": { resource: "dashboard", action: "read" },
} as const;
