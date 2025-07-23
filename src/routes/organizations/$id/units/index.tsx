import { HealthUnitCard } from "@/components/healthunit/Card";
import { HealthUnitForm } from "@/components/healthunit/Form";
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
import { useOrganizationUnit } from "@/hooks/use-organization-unit";
import { withPermission } from "@/lib/route-protection";
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

   const { units, isPending: isFetching } = useOrganizationUnit(id);

   const [searchTerm, setSearchTerm] = useState("");
   const [isCreateOpen, setIsCreateOpen] = useState(false);

   if (isFetching) return <Loader />;

   /*const filteredHealthPosts = healthUnits.filter(
      (post) =>
         post.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         post.metadata?.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         post.metadata?.manager?.toLowerCase().includes(searchTerm.toLowerCase()),
   );*/

   /* const getHealthPostStats = () => {
      const total = healthUnits.length;
      const active = healthUnits.filter((post) => post.metadata?.status === "active").length;
      const totalCapacity = healthUnits.reduce((sum, post) => sum + Number(post.metadata?.capacity), 0);
      return { total, active, totalCapacity };
   };*/

   // const stats = getHealthPostStats();

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center gap-4">
            <div className="flex-1">
               <h1 className="text-2xl font-bold">Postos de Saúde</h1>
               <p className="text-muted-foreground">Gerencie os postos de saúde desta organização</p>
            </div>
         </div>

         {/* Organization Info */}
         {/*<Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Organização
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                  <div className="flex items-center gap-2">
                     <Mail className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm">{organization.metadata?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Phone className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm">{formatPhone(organization.metadata?.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <MapPin className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm">
                        {organization.metadata?.address}, {organization.metadata?.number} -{" "}
                        {organization.metadata?.city} - {organization.metadata?.state}
                     </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Activity className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm">CNPJ: {formatCNPJ(organization.metadata?.cnpj)}</span>
                  </div>
               </div>
               <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="items-center gap-2">
                     <p className="text-sm font-medium">Total de Postos</p>
                     <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="items-center gap-2">
                     <p className="text-sm font-medium">Postos Ativos</p>
                     <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
               </div>
            </CardContent>
         </Card>*/}

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
                  <HealthUnitCard key={post.id} healthunit={post} />
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
