import { doctorColumns } from "@/components/doctors/columns";
import { DoctorForm } from "@/components/doctors/Form";
import { DataTable } from "@/components/shared/Datatable";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { useTRPC } from "@/server/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/organizations/$id/units/$unitId/doctors/")({
   component: RouteComponent,
});

function RouteComponent() {
   const trpc = useTRPC();
   const { id: organizationId = "", unitId = "" } = useParams({ strict: false });
   const [isOpen, setIsOpen] = useState(false);

   const {
      data: doctors = [],
      isLoading,
      error,
   } = useQuery(trpc.doctor.getAll.queryOptions({ organizationId, unitId }));

   if (error) {
      return (
         <div className="space-y-6">
            <div className="flex items-center justify-center min-h-[400px]">
               <div className="text-center">
                  <h2 className="text-lg font-semibold text-red-600">Erro ao carregar usuários</h2>
                  <p className="text-muted-foreground">{error.message}</p>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold">Médicos</h1>
               <p className="text-muted-foreground">Gerencie todos os médicos do sistema</p>
            </div>
            <div className="flex gap-2">
               <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                     <Button variant={"default"} size="sm" className="cursor-pointer">
                        <Plus className="h-4 w-4 mr-1" />
                        Novo Médico
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                     <DialogHeader>
                        <DialogTitle>Criar Novo Médico</DialogTitle>
                        <DialogDescription>
                           Adicione um novo médico ao sistema preenchendo os detalhes abaixo.
                        </DialogDescription>
                     </DialogHeader>
                     <DoctorForm
                        organizationId={organizationId}
                        unitId={unitId}
                        onClose={() => setIsOpen(false)}
                     />
                  </DialogContent>
               </Dialog>
            </div>
         </div>

         {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Carregando usuários...</p>
               </div>
            </div>
         ) : (
            <DataTable
               columns={doctorColumns}
               data={doctors as any}
               searchPlaceholder="Buscar usuários..."
               searchColumn="name"
            />
         )}
      </div>
   );
}
