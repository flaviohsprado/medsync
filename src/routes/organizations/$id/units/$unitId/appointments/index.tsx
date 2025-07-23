import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/appointments/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Consultas</h1>
            <p className="text-muted-foreground">Gerencie as consultas da unidade de saúde</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Agenda de Consultas</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para mostrar e gerenciar as consultas da unidade.
            </p>
         </div>
      </div>
   );
}
