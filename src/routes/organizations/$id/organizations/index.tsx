import { OrganizationCard } from "@/components/organizations/Card";
import { OrganizationForm } from "@/components/organizations/Form";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { useTRPC } from "@/server/react";
import type { Organization } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Building, Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/organizations/$id/organizations/")({
   component: RouteComponent,
});

function RouteComponent() {
   const trpc = useTRPC();
   const { id } = useParams({ from: "/organizations/$id/organizations/" });
   const { data: organizations, isLoading } = useQuery(trpc.organization.getChildrenOrganizations.queryOptions({ id }));

   const [searchTerm, setSearchTerm] = useState("");
   const [isCreateOpen, setIsCreateOpen] = useState(false);

   if (isLoading) return <Loader />;

   const filteredOrganizations = organizations?.filter((org: Organization) => {
      return (
         org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         org.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         org.cnpj?.includes(searchTerm)
      );
   });

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold">Organizações</h1>
               <p className="text-muted-foreground">Gerencie todas as organizações do sistema</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
               <DialogTrigger asChild>
                  <Button>
                     <Plus className="h-4 w-4 mr-2" />
                     Nova Organização
                  </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                     <DialogTitle>Criar Nova Organização</DialogTitle>
                     <DialogDescription>Adicione uma nova organização ao sistema</DialogDescription>
                  </DialogHeader>
                  <OrganizationForm id={id} onOpenChange={setIsCreateOpen} />
               </DialogContent>
            </Dialog>
         </div>

         <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
               placeholder="Pesquisar organizações..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
            />
         </div>

         {/* Organizations Grid */}
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrganizations?.map((org) => (
               <OrganizationCard key={org.id} organization={org} />
            ))}
         </div>

         {filteredOrganizations?.length === 0 && (
            <div className="text-center py-12">
               <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="text-lg font-medium mb-2">Nenhuma organização encontrada</h3>
               <p className="text-muted-foreground">
                  {searchTerm ? "Tente ajustar sua busca" : "Comece criando uma nova organização"}
               </p>
            </div>
         )}
      </div>
   );
}
