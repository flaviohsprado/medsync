import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/schedule/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Minha Agenda</h1>
            <p className="text-muted-foreground">Visualize e gerencie seus horários de consulta</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Agenda Médica</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para mostrar a agenda pessoal do médico.
            </p>
         </div>
      </div>
   );
}
