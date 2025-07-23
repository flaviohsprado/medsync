import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import { Loader } from "./components/ui/loader";
import { routeTree } from "./routeTree.gen";
import { trpcClient } from "./server/client";
import { TRPCProvider } from "./server/react";

export function createRouter() {
   const queryClient = new QueryClient({
      defaultOptions: {
         dehydrate: { serializeData: superjson.serialize },
         hydrate: { deserializeData: superjson.deserialize },
      },
   });

   const serverHelpers = createTRPCOptionsProxy({
      client: trpcClient,
      queryClient: queryClient,
   });

   const router = createTanstackRouter({
      routeTree,
      context: {
         queryClient,
         trpc: serverHelpers,
      },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
      defaultPreload: "intent",
      defaultPendingComponent: () => (
         <div className={`p-2 text-2xl`}>
            <Loader />
         </div>
      ),
      Wrap: (props: { children: React.ReactNode }) => {
         return (
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
               {props.children}
            </TRPCProvider>
         );
      },
   });

   return routerWithQueryClient(router, queryClient);
}

// Register the router instance for type safety
declare module "@tanstack/react-router" {
   interface Register {
      router: ReturnType<typeof createRouter>;
   }
}
