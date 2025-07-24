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
import { userColumns } from "@/components/users/columns";
import { UserForm } from "@/components/users/Form";
import { useTRPC } from "@/server/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/organizations/$id/users/")({
   component: RouteComponent,
});

function RouteComponent() {
   const trpc = useTRPC();
   const queryClient = useQueryClient();
   const { id: organizationId = "" } = useParams({ strict: false });
   const [isOpen, setIsOpen] = useState(false);

   const { data: users = [], isLoading, error } = useQuery(trpc.user.getAll.queryOptions({ organizationId }));

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
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold">Usuários</h1>
               <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
            </div>
            <div className="flex gap-2">
               <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                     <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Usuário
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                     <DialogHeader>
                        <DialogTitle>Criar Novo Usuário</DialogTitle>
                        <DialogDescription>
                           Adicione um novo usuário ao sistema com função e permissões específicas
                        </DialogDescription>
                     </DialogHeader>
                     <UserForm
                        onOpenChange={setIsOpen}
                        organizationId={organizationId}
                        onSuccess={() => {
                           queryClient.invalidateQueries({
                              queryKey: trpc.user.getAll.queryOptions({ organizationId }).queryKey,
                           });
                        }}
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
            <DataTable columns={userColumns} data={users} searchPlaceholder="Buscar usuários..." searchColumn="name" />
         )}
      </div>
   );
}
