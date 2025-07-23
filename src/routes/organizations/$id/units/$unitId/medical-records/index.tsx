import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/medical-records/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Prontuários</h1>
            <p className="text-muted-foreground">Acesse e gerencie prontuários médicos</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Prontuários Médicos</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para gerenciar prontuários médicos dos pacientes.
            </p>
         </div>
      </div>
   );
}
