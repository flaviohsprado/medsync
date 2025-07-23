/// <reference types="vite/client" />

import { ThemeProvider } from "@/components/ui/theme-provider";
import type { TRPCRouter } from "@/server/routers";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

interface RouterAppContext {
   trpc: TRPCOptionsProxy<TRPCRouter>;
   queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
   head: () => ({
      meta: [
         {
            charSet: "utf-8",
         },
         {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
         },
         {
            title: "Medsync",
         },
      ],
      links: [{ rel: "stylesheet", href: appCss }],
   }),
   component: RootComponent,
});

function RootComponent() {
   return (
      <RootDocument>
         <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Outlet />
            <Toaster position="bottom-right" richColors />
         </ThemeProvider>
      </RootDocument>
   );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
   return (
      <html lang="en" suppressHydrationWarning>
         <head>
            <HeadContent />
         </head>
         <body className="antialiased">
            {children}
            <Scripts />
         </body>
      </html>
   );
}
