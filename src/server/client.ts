import { createIsomorphicFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { TRPCRouter } from "./routers";

const getIncomingHeaders = createIsomorphicFn()
   .client(() => ({}))
   .server(() => {
      try {
         return getHeaders();
      } catch {
         return {};
      }
   });

function getUrl() {
   const base = (() => {
      if (typeof window !== "undefined") return "";
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return `http://localhost:${process.env.PORT ?? 3000}`;
   })();
   return `${base}/api/trpc`;
}

export const trpcClient = createTRPCClient<TRPCRouter>({
   links: [
      httpBatchLink({
         headers: getIncomingHeaders(),
         transformer: superjson,
         url: getUrl(),
      }),
   ],
});
