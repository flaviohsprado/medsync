import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/settings/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Configurações do Sistema</h2>
            <p className="text-muted-foreground">Esta página será implementada para configurações gerais do sistema.</p>
         </div>
      </div>
   );
}
