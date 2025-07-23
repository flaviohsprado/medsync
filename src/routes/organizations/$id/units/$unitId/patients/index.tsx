import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/patients/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-muted-foreground">Gerencie os pacientes da unidade de saúde</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Lista de Pacientes</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para mostrar e gerenciar os pacientes da unidade.
            </p>
         </div>
      </div>
   );
}
