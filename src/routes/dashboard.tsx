import { getPostAuthRedirectPath } from "@/lib/auth-client";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
   component: DashboardRedirect,
});

function DashboardRedirect() {
   const router = useRouter();

   useEffect(() => {
      const redirectToOrganization = async () => {
         try {
            const redirectPath = await getPostAuthRedirectPath();
            // If the redirect path is not the dashboard itself, navigate there
            if (redirectPath !== "/dashboard") {
               router.navigate({ to: redirectPath });
            } else {
               // Fallback: redirect to settings if no organization context
               router.navigate({ to: "/settings" });
            }
         } catch (error) {
            console.error("Error redirecting from dashboard:", error);
            // Fallback to settings on error
            router.navigate({ to: "/settings" });
         }
      };

      redirectToOrganization();
   }, [router]);

   // Show loading while redirecting
   return (
      <div className="min-h-screen bg-background flex items-center justify-center">
         <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to your dashboard...</p>
         </div>
      </div>
   );
}
