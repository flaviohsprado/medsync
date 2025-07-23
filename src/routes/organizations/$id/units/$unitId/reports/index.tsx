import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/organizations/$id/units/$unitId/reports/")({
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">Visualize relatórios e estatísticas da unidade</p>
         </div>

         <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Relatórios Disponíveis</h2>
            <p className="text-muted-foreground">
               Esta página será implementada para mostrar relatórios gerenciais da unidade.
            </p>
         </div>
      </div>
   );
}
