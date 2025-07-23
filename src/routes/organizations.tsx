import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/organizations")({
   component: OrganizationLayout,
});

function OrganizationLayout() {
   const [sidebarOpen, setSidebarOpen] = useState(false);

   return (
      <div className="min-h-screen bg-background">
         <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} showMenuButton={true} />

         <div className="flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="flex-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
               <div className="p-4 md:p-6">
                  <Outlet />
               </div>
            </main>
         </div>
      </div>
   );
}
