import { z } from "zod";

const serverEnvSchema = z.object({
   DATABASE_URL: z.string(),
   BETTER_AUTH_SECRET: z.string(),
   BETTER_AUTH_TRUSTED_ORIGINS: z.string(),
   DEV: z.coerce.boolean(),
   PROD: z.coerce.boolean(),
   PORT: z.coerce.number().optional(),
});

const browserEnvSchema = z.object({
   VITE_PUBLIC_DEV: z.coerce.boolean(),
   VITE_PUBLIC_PROD: z.coerce.boolean(),
});

const getServerRuntimeEnv = () => {
   return {
      DATABASE_URL: process.env.DATABASE_URL,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      PORT: import.meta.env.PORT || process.env.PORT,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
   };
};

const getBrowserRuntimeEnv = () => {
   // In Remotion context, import.meta.env might not be available
   // so we fallback to process.env
   const getEnvValue = (key: string) => {
      if (typeof import.meta !== "undefined" && import.meta.env) {
         return import.meta.env[key];
      }
      // Fallback to process.env for Remotion context
      return process.env[key];
   };

   return {
      VITE_PUBLIC_DEV: getEnvValue("DEV") || getEnvValue("NODE_ENV") !== "production",
      VITE_PUBLIC_PROD: getEnvValue("PROD") || getEnvValue("NODE_ENV") === "production",
   };
};

const parseServerEnv = () => {
   if (typeof window !== "undefined") return {} as ServerEnv;

   const isPrerendering = process.env.PRERENDER === "TRUE";

   if (isPrerendering) {
      console.warn("⚠️ Skipping server environment validation during prerendering");
      return {} as ServerEnv;
   }

   const runtimeEnv = getServerRuntimeEnv();

   try {
      return serverEnvSchema.parse(runtimeEnv);
   } catch (error) {
      console.error("❌ Invalid server environment variables:");
      if (error instanceof z.ZodError) {
         console.error(error.message);
      }
      throw new Error("Server environment validation failed");
   }
};

const parseBrowserEnv = () => {
   const runtimeEnv = getBrowserRuntimeEnv();

   // Check if we're in a Remotion context by looking for Remotion-specific globals
   // or when import.meta.env is not available
   const isRemotionContext =
      typeof window === "undefined" &&
      (typeof import.meta === "undefined" ||
         !import.meta.env ||
         // Check for Remotion-specific globals
         (typeof global !== "undefined" && "__REMOTION_BUNDLE__" in global));

   if (isRemotionContext) {
      // In Remotion context, we'll be more lenient with environment variables
      // and provide defaults for missing values
      return {
         VITE_PUBLIC_DEV: runtimeEnv.VITE_PUBLIC_DEV || false,
         VITE_PUBLIC_PROD: runtimeEnv.VITE_PUBLIC_PROD || true,
      };
   }

   try {
      return browserEnvSchema.parse(runtimeEnv);
   } catch (error) {
      // If we're in a server context where some environment variables might be missing,
      // and it's not a critical error, provide defaults
      if (typeof window === "undefined") {
         console.warn("⚠️ Some browser environment variables are missing in server context, using defaults");
         return {
            VITE_PUBLIC_DEV: runtimeEnv.VITE_PUBLIC_DEV || false,
            VITE_PUBLIC_PROD: runtimeEnv.VITE_PUBLIC_PROD || true,
         };
      }

      console.error("❌ Invalid browser environment variables:");
      if (error instanceof z.ZodError) {
         console.error(error.message);
      }
      throw new Error("Browser environment validation failed");
   }
};

export const serverEnv = parseServerEnv();
export const browserEnv = parseBrowserEnv();

export const env = { ...serverEnv, ...browserEnv };

type ServerEnv = z.infer<typeof serverEnvSchema>;
type BrowserEnv = z.infer<typeof browserEnvSchema>;

export type Env = ServerEnv & BrowserEnv;
