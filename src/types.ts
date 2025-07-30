import type { LinkOptions } from "@tanstack/react-router";
import type { Auth, Session, User } from "./server/auth";
import type { Db } from "./server/db";
import type { appointment, organization, profile, unit, user } from "./server/db/schema";

type CustomOption = {
   label: string;
   value: string;
};
export type CustomOptions = Array<CustomOption>;

export type UserDB = typeof user.$inferSelect;
export type Organization = typeof organization.$inferSelect;
export type Unit = typeof unit.$inferSelect;
export type Profile = typeof profile.$inferSelect;
export type Appointment = typeof appointment.$inferSelect;

export type Context = {
   headers: Headers;
   db: Db;
   auth: Auth;
   organization: Organization | null;
   session: Session | null;
   user: User;
   hasPermission: (
      resource: string,
      action: "create" | "read" | "update" | "delete",
      targetOrgId?: string,
      targetUnitId?: string,
   ) => PermissionCheckResult;
   canAccessRoute: (route: string) => boolean;
};

export interface Permission {
   resource: string;
   actions: ("create" | "read" | "update" | "delete")[];
   scope?: "organization" | "unit" | "self";
}

// Simplified permission system with only 3 roles
export type SystemRole = "super_admin" | "admin" | "user";

// Permission checking result
export interface PermissionCheckResult {
   allowed: boolean;
   reason?: string;
}

// Route permission configuration
export interface RoutePermission {
   resource: string;
   action: "create" | "read" | "update" | "delete";
   requiredRole?: SystemRole;
}

// Error types for permission-related errors
export const PermissionErrors = {
   INSUFFICIENT_PERMISSIONS: "Insufficient permissions for this action",
   INVALID_ORGANIZATION: "Invalid organization access",
   INVALID_UNIT: "Invalid unit access",
   ROLE_ASSIGNMENT_ERROR: "Cannot assign this role",
   UNAUTHORIZED_ROUTE: "Unauthorized access to this route",
} as const;

export type PermissionError = (typeof PermissionErrors)[keyof typeof PermissionErrors];

export interface NavItem {
   to: LinkOptions["to"];
   label: string;
   icon: React.ComponentType<{ className?: string }>;
   resource: string;
   action: "create" | "read" | "update" | "delete";
   systemRoles?: SystemRole[];
}

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";
export enum AppointmentStatusEnum {
   SCHEDULED = "scheduled",
   CONFIRMED = "confirmed",
   COMPLETED = "completed",
   CANCELLED = "cancelled",
}

export interface AppointmentWithDetails extends Appointment {
   patientName: string;
   doctorName: string;
   doctorSpecialty: string;
}

export interface Patient {
   id: string;
   name: string;
   email: string;
   phone: string;
   dateOfBirth: Date;
   gender: "male" | "female" | "other" | "prefer-not-to-say";
   cpf: string; // Brazilian ID format: XXX.XXX.XXX-XX
   address?: string;
   emergencyContact?: string;
   createdAt: Date;
   updatedAt: Date;
}

export enum WeekDays {
   SUNDAY = "sunday",
   MONDAY = "monday",
   TUESDAY = "tuesday",
   WEDNESDAY = "wednesday",
   THURSDAY = "thursday",
   FRIDAY = "friday",
   SATURDAY = "saturday",
}

export interface OfficeHours {
   dayOfWeek: WeekDays; // "monday", "tuesday", etc.
   startTime: string; // "09:00"
   endTime: string; // "17:00"
   isActive: boolean;
}

export interface Doctor {
   id: string;
   name: string;
   email: string;
   phone: string;
   specialty: string;
   crm: string; // Medical license
   officeHours: OfficeHours[];
   createdAt: Date;
   updatedAt: Date;
}
