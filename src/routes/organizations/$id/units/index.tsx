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
import { UnitCard } from "@/components/units/Card";
import { HealthUnitForm } from "@/components/units/Form";
import { withPermission } from "@/lib/route-protection";
import { useTRPC } from "@/server/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { MapPin, Plus, Search } from "lucide-react";
import { useState } from "react";

const ProtectedUnitsPage = withPermission(UnitsPage, {
   resource: "unit",
   action: "read",
});

export const Route = createFileRoute("/organizations/$id/units/")({
   component: ProtectedUnitsPage,
});

function UnitsPage() {
   const { id } = useParams({ from: "/organizations/$id/units/" });
   const trpc = useTRPC();

   const { data: units, isLoading } = useQuery(trpc.unit.getByOrganization.queryOptions({ organizationId: id! }));

   const [searchTerm, setSearchTerm] = useState("");
   const [isCreateOpen, setIsCreateOpen] = useState(false);

   if (isLoading) return <Loader />;

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center gap-4">
            <div className="flex-1">
               <h1 className="text-2xl font-bold">Postos de Saúde</h1>
               <p className="text-muted-foreground">Gerencie os postos de saúde desta organização</p>
            </div>
         </div>

         {/* Actions */}
         <div className="flex items-center justify-between">
            <div className="relative flex-1 pr-4">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
               <Input
                  placeholder="Pesquisar postos de saúde..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
               />
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
               <DialogTrigger asChild>
                  <Button className="cursor-pointer">
                     <Plus className="h-4 w-4 mr-2" />
                     Novo Posto de Saúde
                  </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                     <DialogTitle>Criar Novo Posto de Saúde</DialogTitle>
                     <DialogDescription>Adicione um novo posto de saúde à organização</DialogDescription>
                  </DialogHeader>
                  <HealthUnitForm organizationId={id!} onOpenChange={setIsCreateOpen} />
               </DialogContent>
            </Dialog>
         </div>

         {/* Health Posts Grid */}
         {units && units.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {units.map((post) => (
                  <UnitCard key={post.id} unit={post} />
               ))}
            </div>
         )}

         {units && units.length === 0 && (
            <div className="text-center py-12">
               <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
               <h3 className="text-lg font-medium mb-2">Nenhum posto de saúde encontrado</h3>
               <p className="text-muted-foreground">
                  {searchTerm ? "Tente ajustar sua busca" : "Comece criando um novo posto de saúde"}
               </p>
            </div>
         )}
      </div>
   );
}
