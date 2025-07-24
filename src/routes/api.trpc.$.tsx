import { createTRPCContext } from "@/server/api";
import { trpcRouter } from "@/server/routers";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

function handler({ request }: { request: Request }) {
   return fetchRequestHandler({
      req: request,
      router: trpcRouter,
      endpoint: "/api/trpc",
      createContext: createTRPCContext,
   });
}

export const ServerRoute = createServerFileRoute("/api/trpc/$").methods({
   GET: handler,
   POST: handler,
});
