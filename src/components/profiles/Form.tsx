import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ProfileFormSchema, type ProfileFormData } from "@/lib/form-schemas";
import { PERMISSIONS } from "@/lib/permissions";
import { groupPermissionsByResource } from "@/lib/utils";
import { useTRPC } from "@/server/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Settings, Shield } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { defineStepper } from "../ui/stepperize";
import { ProfileInformationForm } from "./InformationForm";
import { PermissionForm } from "./PermissionForm";

enum ProfileFormStep {
   BASIC_INFO = "basic_info",
   PERMISSIONS = "permissions",
}

const { Stepper } = defineStepper(
   {
      id: ProfileFormStep.BASIC_INFO,
      icon: <Shield className="size-4" />,
   },
   {
      id: ProfileFormStep.PERMISSIONS,
      icon: <Settings className="size-4" />,
   },
);

interface ProfileFormProps {
   onOpenChange?: (open: boolean) => void;
}

export function ProfileForm({ onOpenChange }: ProfileFormProps) {
   const trpc = useTRPC();
   const queryClient = useQueryClient();
   const { id: organizationId } = useParams({ from: "/organizations/$id/profiles/" });
   const { data: organization } = useQuery(trpc.organization.getActiveOrganization.queryOptions());

   const isRootOrganization = !organization?.metadata?.parentId;

   // State for the selected scope that will be applied to all permissions
   const [selectedScope, setSelectedScope] = useState<"organization" | "unit" | "self">("unit");

   const { mutate: createProfile } = useMutation(
      trpc.profile.create.mutationOptions({
         onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: trpc.profile.getAll.queryOptions().queryKey,
            });
            toast.success("Perfil criado com sucesso");
            onOpenChange?.(false);
         },
         onError: () => {
            toast.error("Erro ao criar perfil");
         },
      }),
   );

   const groupedPermissions = groupPermissionsByResource(PERMISSIONS);
   const resources = Object.keys(groupedPermissions).sort();

   const form = useForm<ProfileFormData>({
      resolver: zodResolver(ProfileFormSchema),
      defaultValues: {
         name: "",
         description: "",
         organizationId,
         permissions: [],
      },
   });

   // Toggle a specific action for a resource
   const toggleAction = (resource: string, action: "create" | "read" | "update" | "delete", enabled: boolean) => {
      const currentPermissions = form.getValues().permissions || [];
      const existingPermissionIndex = currentPermissions.findIndex((p) => p.resource === resource);

      const newPermissions = [...currentPermissions];

      if (existingPermissionIndex >= 0) {
         // Permission exists, update it
         const existingPermission = newPermissions[existingPermissionIndex];
         let newActions = [...existingPermission.actions];

         if (enabled) {
            // Add action if not present
            if (!newActions.includes(action)) {
               newActions.push(action);
            }
         } else {
            // Remove action
            newActions = newActions.filter((a) => a !== action);
         }

         if (newActions.length > 0) {
            // Update permission with new actions and current scope
            newPermissions[existingPermissionIndex] = {
               ...existingPermission,
               actions: newActions,
               scope: selectedScope,
            };
         } else {
            // Remove permission if no actions left
            newPermissions.splice(existingPermissionIndex, 1);
         }
      } else if (enabled) {
         // Create new permission with current scope
         newPermissions.push({
            resource,
            actions: [action],
            scope: selectedScope,
         });
      }

      form.setValue("permissions", newPermissions, { shouldValidate: true });
   };

   // Update all existing permissions when scope changes
   const handleScopeChange = (newScope: "organization" | "unit" | "self") => {
      setSelectedScope(newScope);

      // Update all existing permissions with the new scope
      const currentPermissions = form.getValues().permissions || [];
      const updatedPermissions = currentPermissions.map((permission) => ({
         ...permission,
         scope: newScope,
      }));

      form.setValue("permissions", updatedPermissions, { shouldValidate: true });
   };

   const handleNext = async (methods: any) => {
      // Since methods.current.id is not available, we'll determine the step based on navigation state
      if (!methods.isLast) {
         // We're on the basic info step if not on last step
         const fieldsToValidate = ["name", "description"] as const;
         const isValid = await form.trigger(fieldsToValidate);
         if (isValid) {
            // Always proceed to permissions step in simplified system
            methods.next();
         }
      } else {
         // We're on the permissions step (last step), so submit
         const formData = form.getValues();
         createProfile(formData);
      }
   };

   return (
      <Stepper.Provider className="space-y-6">
         {({ methods }) => (
            <>
               <Stepper.Navigation>
                  {methods.all.map((step) => (
                     <Stepper.Step key={step.id} of={step.id} icon={step.icon} />
                  ))}
               </Stepper.Navigation>

               <Form {...form}>
                  <form className="space-y-4">
                     <Stepper.Panel>
                        {methods.switch({
                           [ProfileFormStep.BASIC_INFO]: () => (
                              <ProfileInformationForm
                                 form={form}
                                 selectedScope={selectedScope}
                                 handleScopeChange={handleScopeChange}
                                 isRootOrganization={isRootOrganization}
                              />
                           ),
                           [ProfileFormStep.PERMISSIONS]: () => (
                              <PermissionForm
                                 form={form}
                                 resources={resources}
                                 groupedPermissions={groupedPermissions}
                                 toggleAction={toggleAction}
                              />
                           ),
                        })}
                     </Stepper.Panel>

                     <Stepper.Controls>
                        {!methods.isFirst && (
                           <Button type="button" variant="secondary" onClick={methods.prev}>
                              Anterior
                           </Button>
                        )}

                        {!methods.isLast ? (
                           <Button type="button" onClick={() => handleNext(methods)}>
                              Próximo
                           </Button>
                        ) : (
                           <Button type="button" onClick={() => handleNext(methods)}>
                              Criar Perfil
                           </Button>
                        )}
                     </Stepper.Controls>
                  </form>
               </Form>
            </>
         )}
      </Stepper.Provider>
   );
}
