import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomOrganization } from "@/types";
import { Edit, Mail, MapPin, Phone, Trash2, Users } from "lucide-react";
import { Button } from "../ui/button";

interface HealthUnitCardProps {
   healthunit: CustomOrganization;
}

export function HealthUnitCard({ healthunit }: HealthUnitCardProps) {
   const handleDelete = (postId: string) => {
      console.log(postId);
   };

   return (
      <Card key={healthunit.id} className="hover:shadow-md transition-shadow">
         <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-medical/10 rounded-lg flex items-center justify-center">
                     <MapPin className="h-5 w-5 text-medical" />
                  </div>
                  <div>
                     <CardTitle className="text-lg">{healthunit.name}</CardTitle>
                     <CardDescription className="text-sm">Responsável: {healthunit.metadata.manager}</CardDescription>
                  </div>
               </div>
               <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                     <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(healthunit.id)}>
                     <Trash2 className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                     Endereço: {healthunit.metadata.address.street || "N/A"},{" "}
                     {healthunit.metadata.address.number || "N/A"} - {healthunit.metadata.address.neighborhood || "N/A"}{" "}
                     - {healthunit.metadata.address.city || "N/A"} - {healthunit.metadata.address.state || "N/A"}
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{healthunit.metadata.phone}</span>
               </div>
               {healthunit.metadata.email && (
                  <div className="flex items-center gap-2">
                     <Mail className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm">{healthunit.metadata.email}</span>
                  </div>
               )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
               <Users className="h-4 w-4 text-muted-foreground" />
               {/*<span className="text-sm font-medium">Capacidade: {healthunit.metadata.capacity}</span>
                <Badge variant={healthunit.metadata.isActive ? "default" : "secondary"} className="ml-auto">
                  {healthunit.metadata.isActive ? "Ativo" : "Inativo"}
               </Badge> */}
            </div>

            {/*<div className="flex gap-1 flex-wrap">
            {post.specialties.map((specialty, index) => (
               <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
               </Badge>
            ))}
         </div>*/}
         </CardContent>
      </Card>
   );
}
