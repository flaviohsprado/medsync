import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/doctors/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Médicos</h1>
            <p className="text-muted-foreground">Visualize os médicos da unidade de saúde</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Lista de Médicos</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para mostrar os médicos disponíveis na unidade.
            </p>
         </div>
      </div>
   );
}
