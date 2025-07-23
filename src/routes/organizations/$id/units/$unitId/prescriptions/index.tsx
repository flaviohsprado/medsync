import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/prescriptions/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
            <p className="text-muted-foreground">Gerencie receitas e prescrições médicas</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Prescrições Médicas</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para criar e gerenciar receitas médicas.
            </p>
         </div>
      </div>
   );
}
