import { env } from "@/lib/env";
import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, multiSession } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { t } from "./trpc";

export const auth = betterAuth({
   trpc: t,
   database: drizzleAdapter(db, {
      provider: "pg",
   }),
   emailAndPassword: {
      enabled: true,
   },
   trustedOrigins: [env.BETTER_AUTH_TRUSTED_ORIGINS],
   jwt: {
      enabled: true,
      secret: env.BETTER_AUTH_SECRET,
   },
   user: {
      additionalFields: {
         phone: {
            type: "string",
            required: false,
         },
         organizationId: {
            type: "string",
            required: true,
         },
         unitId: {
            type: "string",
            required: false,
         },
         systemRole: {
            type: "string",
            required: true,
            defaultValue: "user",
         },
         profileId: {
            type: "string",
            required: false,
         },
         crm: {
            type: "string",
            required: false,
         },
         specialties: {
            type: "string[]",
            required: false,
         },
         workSchedule: {
            type: "string",
            required: false,
         },
      },
   },
   plugins: [
      admin({
         adminRoles: ["admin", "super_admin"],
         rolePath: "systemRole",
      }),
      reactStartCookies(),
      multiSession(),
   ],
});

export type AuthAPI = typeof auth.api;
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
