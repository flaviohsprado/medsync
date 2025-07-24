import { profileColumns } from "@/components/profiles/columns";
import { ProfileForm } from "@/components/profiles/Form";
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
import { Plus, Shield } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/organizations/$id/units/$unitId/profiles/")({
   component: ProfilesPage,
});

function ProfilesPage() {
   const trpc = useTRPC();
   const { id, unitId } = useParams({ from: "/organizations/$id/units/$unitId/profiles/" });

   const { data: profiles = [] } = useQuery(trpc.profile.getAll.queryOptions());

   const [dialogOpen, setDialogOpen] = useState(false);

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold">Perfis</h1>
               <p className="text-muted-foreground">Gerencie todos os perfis do sistema</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
               <DialogTrigger asChild>
                  <Button>
                     <Plus className="h-4 w-4 mr-2" />
                     Novo Perfil
                  </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                     <DialogTitle>Criar Novo Perfil</DialogTitle>
                     <DialogDescription>Adicione um novo perfil ao sistema</DialogDescription>
                  </DialogHeader>
                  <ProfileForm organizationId={id} unitId={unitId} onOpenChange={setDialogOpen} />
               </DialogContent>
            </Dialog>
         </div>

         <DataTable
            columns={profileColumns}
            data={profiles}
            searchPlaceholder="Pesquisar perfis..."
            searchColumn="name"
         />

         {profiles?.length === 0 && (
            <div className="text-center py-12">
               <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="text-lg font-medium mb-2">Nenhuma organização encontrada</h3>
               <p className="text-muted-foreground">
                  {profiles?.length === 0 ? "Tente ajustar sua busca" : "Comece criando uma nova organização"}
               </p>
            </div>
         )}
      </div>
   );
}
