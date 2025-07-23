import { z } from "zod";

const serverSchema = z.object({
   DATABASE_URL: z.string().url(),
   BETTER_AUTH_SECRET: z.string(),
   BETTER_AUTH_TRUSTED_ORIGINS: z.string(),
});

const clientSchema = z.object({
   // Add any client-side env variables here, prefixed with VITE_
});

const serverEnv = serverSchema.parse(process.env);
const clientEnv = clientSchema.parse(import.meta.env);

export const env = {
   ...serverEnv,
   ...clientEnv,
};
