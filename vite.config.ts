import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
   plugins: [
      tsconfigPaths({
         projects: ["./tsconfig.json"],
      }),
      tailwindcss(),
      tanstackStart({
         target: "vercel",
         prerender: {
            crawlLinks: true,
            filter: (url) => {
               return ["/", "/rss/xml"].includes(url.path);
            },
         },
      }),
      // react(),
   ],
   server: {
      headers: {
         "Cross-Origin-Opener-Policy": "same-origin",
         "Cross-Origin-Embedder-Policy": "require-corp",
      },
   },
});
