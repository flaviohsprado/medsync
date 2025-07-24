import type { AddressFormData } from "@/lib/schemas";
import type { Permission } from "@/types";
import { relations } from "drizzle-orm";
import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
export * from "./auth-schema";

const timestamps = {
   createdAt: timestamp("created_at").defaultNow(),
   updatedAt: timestamp("updated_at").defaultNow(),
};

export const profile = pgTable(
   "profile",
   {
      id: text("id")
         .primaryKey()
         .$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull(),
      description: text("description").notNull(),
      systemRole: text("system_role").notNull(),
      organizationId: text("organization_id")
         .notNull()
         .references(() => organization.id, { onDelete: "cascade" }),
      permissions: jsonb("permissions").$type<Array<Permission>>().notNull().default([]),
      ...timestamps,
   },
   (table) => [index("profile_organization_id_idx").on(table.organizationId)],
);

export const organization = pgTable(
   "organization",
   {
      id: text("id")
         .primaryKey()
         .$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull(),
      phone: text("phone"),
      cnpj: text("cnpj"),
      email: text("email"),
      slug: text("slug").unique(),
      logo: text("logo"),
      address: jsonb("address").$type<AddressFormData>().notNull(),
      parentId: text("parent_id").references((): any => organization.id, {
         onDelete: "set null",
      }),
      ...timestamps,
   },
   (table) => [index("organization_parent_id_idx").on(table.parentId)],
);

export const unit = pgTable(
   "unit",
   {
      id: text("id")
         .primaryKey()
         .$defaultFn(() => crypto.randomUUID()),
      name: text("name").notNull(),
      phone: text("phone"),
      email: text("email"),
      manager: text("manager"),
      specialties: text("specialties"),
      address: jsonb("address").$type<AddressFormData>().notNull(),
      organizationId: text("organization_id")
         .notNull()
         .references(() => organization.id, { onDelete: "cascade" }),
      ...timestamps,
   },
   (table) => [index("unit_organization_id_idx").on(table.organizationId)],
);

export const appointment = pgTable(
   "appointment",
   {
      id: text("id")
         .primaryKey()
         .$defaultFn(() => crypto.randomUUID()),
      unitId: text("unit_id")
         .notNull()
         .references(() => unit.id, { onDelete: "cascade" }),
      ...timestamps,
   },
   (table) => [index("appointment_unit_id_idx").on(table.unitId)],
);

// ------------------------- RELATIONS -----------------------------//
export const usersRelations = relations(user, ({ one }) => ({
   profile: one(profile, {
      fields: [user.profileId],
      references: [profile.id],
   }),
}));

export const profilesRelations = relations(profile, ({ one }) => ({
   user: one(user, {
      fields: [profile.id],
      references: [user.profileId],
   }),
   organization: one(organization, {
      fields: [profile.organizationId],
      references: [organization.id],
   }),
}));

// Organization <-> Unit (One-to-Many)
export const organizationsRelations = relations(organization, ({ many, one }) => ({
   units: many(unit),
   profiles: many(profile),
   // Self-referencing for parent/child organizations
   parent: one(organization, {
      fields: [organization.parentId],
      references: [organization.id],
      relationName: "parent_organization",
   }),
   children: many(organization, {
      relationName: "parent_organization",
   }),
}));

export const unitsRelations = relations(unit, ({ one, many }) => ({
   organization: one(organization, {
      fields: [unit.organizationId],
      references: [organization.id],
   }),
   appointments: many(appointment),
}));

// Unit <-> Appointment (One-to-Many)
export const appointmentsRelations = relations(appointment, ({ one }) => ({
   unit: one(unit, {
      fields: [appointment.unitId],
      references: [unit.id],
   }),
}));
