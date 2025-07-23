import type { ProfileFormData } from "@/lib/form-schemas";
import { getResourceDisplayInfo } from "@/lib/utils";
import type { Permission } from "@/types";
import type { UseFormReturn } from "react-hook-form";
import { InputSwitchField } from "../shared/InputSwitchField";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface PermissionFormProps {
   form: UseFormReturn<ProfileFormData>;
   resources: string[];
   groupedPermissions: Record<string, Permission>;
   toggleAction: (resource: string, action: "create" | "read" | "update" | "delete", enabled: boolean) => void;
}

export function PermissionForm({ form, resources, groupedPermissions, toggleAction }: PermissionFormProps) {
   return (
      <div className="space-y-4 max-h-[40dvh] overflow-y-auto">
         <h3 className="text-lg font-medium">Permissões por Recurso</h3>
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead>Recurso</TableHead>
                  <TableHead className="text-center">Ler</TableHead>
                  <TableHead className="text-center">Criar</TableHead>
                  <TableHead className="text-center">Editar</TableHead>
                  <TableHead className="text-center">Excluir</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {resources.map((resource) => {
                  const displayInfo = getResourceDisplayInfo(resource);
                  const availableActions = groupedPermissions[resource].actions;

                  return (
                     <TableRow key={resource}>
                        <TableCell>
                           <div>
                              <div className="font-medium">{displayInfo.title}</div>
                              <div className="text-sm text-muted-foreground">{displayInfo.description}</div>
                           </div>
                        </TableCell>
                        <TableCell className="text-center">
                           {availableActions.includes("read") ? (
                              <InputSwitchField
                                 form={form}
                                 name={`permissions.${resource}.actions.read`}
                                 onChange={(value) => toggleAction(resource, "read", value)}
                              />
                           ) : (
                              <span className="text-muted-foreground">N/A</span>
                           )}
                        </TableCell>
                        <TableCell className="text-center">
                           {availableActions.includes("create") ? (
                              <InputSwitchField
                                 form={form}
                                 name={`permissions.${resource}.actions.create`}
                                 onChange={(value) => toggleAction(resource, "create", value)}
                              />
                           ) : (
                              <span className="text-muted-foreground">N/A</span>
                           )}
                        </TableCell>
                        <TableCell className="text-center">
                           {availableActions.includes("update") ? (
                              <InputSwitchField
                                 form={form}
                                 name={`permissions.${resource}.actions.update`}
                                 onChange={(value) => toggleAction(resource, "update", value)}
                              />
                           ) : (
                              <span className="text-muted-foreground">N/A</span>
                           )}
                        </TableCell>
                        <TableCell className="text-center">
                           {availableActions.includes("delete") ? (
                              <InputSwitchField
                                 form={form}
                                 name={`permissions.${resource}.actions.delete`}
                                 onChange={(value) => toggleAction(resource, "delete", value)}
                              />
                           ) : (
                              <span className="text-muted-foreground">N/A</span>
                           )}
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
         </Table>
      </div>
   );
}
