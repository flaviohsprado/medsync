import { AdminDashboard } from "@/components/layout/AdminDashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/")({
   component: RouteComponent,
});

function RouteComponent() {
   return <AdminDashboard />;
}
