import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Unit } from "@/types";
import { Edit, Hospital, Mail, MapPin, Phone, Trash2, Users } from "lucide-react";
import { Button } from "../ui/button";

interface UnitCardProps {
   unit: Unit;
}

export function UnitCard({ unit }: UnitCardProps) {
   const handleDelete = (postId: string) => {
      console.log(postId);
   };

   return (
      <Card key={unit.id} className="hover:shadow-md transition-shadow">
         <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                     <Hospital className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                     <CardTitle className="text-lg">{unit.name}</CardTitle>
                     <CardDescription className="text-sm">Responsável: {unit.manager}</CardDescription>
                  </div>
               </div>
               <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                     <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(unit.id)}>
                     <Trash2 className="h-4 w-4" />
                  </Button>
               </div>
            </div>
         </CardHeader>
         <CardContent className="space-y-4">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-wrap line-clamp-1">
                     {unit.address.street || "N/A"}, {unit.address.number || "N/A"} -{" "}
                     {unit.address.neighborhood || "N/A"} - {unit.address.city || "N/A"} - {unit.address.state || "N/A"}
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{unit.phone}</span>
               </div>
               {unit.email && (
                  <div className="flex items-center gap-2">
                     <Mail className="h-4 w-4 text-muted-foreground" />
                     <span className="text-sm">{unit.email}</span>
                  </div>
               )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
               <Users className="h-4 w-4 text-muted-foreground" />
               {/*<span className="text-sm font-medium">Capacidade: {unit.capacity}</span>
                <Badge variant={unit.metadata.isActive ? "default" : "secondary"} className="ml-auto">
                  {unit.metadata.isActive ? "Ativo" : "Inativo"}
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
