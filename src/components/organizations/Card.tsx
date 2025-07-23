import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCNPJ } from "@/lib/utils";
import type { Organization } from "@/types";
import { Link } from "@tanstack/react-router";
import { Building, Edit, Users } from "lucide-react";
import { Button } from "../ui/button";

interface OrganizationCardProps {
   organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
   return (
      <Link to="/organizations/$id" params={{ id: organization.id }}>
         <Card key={organization.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
               <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                        <CardTitle className="text-lg">{organization.name}</CardTitle>
                        <CardDescription className="text-sm">
                           {organization.cnpj ? formatCNPJ(organization.cnpj) : ""}
                        </CardDescription>
                     </div>
                  </div>
                  <div className="flex gap-1">
                     <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                     </Button>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email: {organization.email || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">Telefone: {organization.phone || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">
                     Endereço: {organization.address.street || "N/A"}, {organization.address.number || "N/A"} -{" "}
                     {organization.address.neighborhood || "N/A"} - {organization.address.city || "N/A"} -{" "}
                     {organization.address.state || "N/A"}
                  </p>
               </div>

               <div className="flex items-center gap-2 pt-2 border-t">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">0 usuários</span>
               </div>

               <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                     {0} médicos
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                     {0} recepcionistas
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                     {0} pacientes
                  </Badge>
               </div>
            </CardContent>
         </Card>
      </Link>
   );
}
