import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PERMISSIONS } from "@/constants";
import { ProfileFormSchema, type ProfileFormData } from "@/lib/schemas";
import { useTRPC } from "@/server/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

   const { mutate: createProfile, isPending } = useMutation(
      trpc.profile.create.mutationOptions({
         onSuccess: () => {
            queryClient.invalidateQueries({
               queryKey: trpc.profile.getAll.queryOptions().queryKey,
            });
            toast.success("Perfil criado com sucesso");
            onOpenChange?.(false);
         },
         onError: (error) => {
            toast.error(`Erro ao criar perfil: ${error.message}`);
         },
      }),
   );

   const [profileType, setProfileType] = useState<"user" | "admin" | "super_admin">("user");
   const form = useForm<ProfileFormData, any, ProfileFormData>({
      resolver: zodResolver(ProfileFormSchema),
      defaultValues: {
         name: "",
         description: "",
         organizationId,
         permissions: [],
         systemRole: profileType,
      },
   });

   const toggleAction = (resource: string, action: "create" | "read" | "update" | "delete", enabled: boolean) => {
      const currentPermissions = form.getValues().permissions || [];
      const newPermissions = [...currentPermissions];
      const permissionIndex = newPermissions.findIndex((p) => p.resource === resource);

      if (enabled) {
         // If a permission object for this resource already exists, add the action
         if (permissionIndex > -1) {
            const permission = newPermissions[permissionIndex];
            if (permission && !permission.actions.includes(action)) {
               permission.actions.push(action);
            }
         } else {
            // Otherwise, create a new permission object for this resource
            newPermissions.push({
               resource,
               actions: [action],
               scope: "organization", // Default scope
            });
         }
      } else {
         // If the action is being disabled
         if (permissionIndex > -1) {
            const permission = newPermissions[permissionIndex];
            if (permission) {
               // Remove the action from the array
               permission.actions = permission.actions.filter((a) => a !== action);
               // If no actions are left, remove the entire permission object
               if (permission.actions.length === 0) {
                  newPermissions.splice(permissionIndex, 1);
               }
            }
         }
      }

      form.setValue("permissions", newPermissions, { shouldValidate: true });
   };

   const handleFinish = form.handleSubmit(async (data: ProfileFormData) => {
      const finalData: ProfileFormData = {
         ...data,
         systemRole: profileType as "super_admin" | "admin" | "user",
         organizationId,
      };

      // If the profile type is admin or super_admin, override permissions with all available permissions.
      if (profileType === "admin" || profileType === "super_admin") {
         finalData.permissions = PERMISSIONS.map((p) => ({ ...p, scope: "organization" }));
      }

      // Ensure user profiles have at least one permission.
      if (profileType === "user" && (!finalData.permissions || finalData.permissions.length === 0)) {
         toast.error("Perfis do tipo 'Usuário' devem ter pelo menos uma permissão selecionada.");
         return;
      }

      createProfile(finalData);
   });

   return (
      <Stepper.Provider className="space-y-6">
         {({ methods }) => (
            <>
               <Stepper.Navigation>
                  {/* Conditionally render the second step indicator */}
                  <Stepper.Step of={ProfileFormStep.BASIC_INFO} icon={<Shield className="size-4" />} />
                  {profileType === "user" && (
                     <Stepper.Step of={ProfileFormStep.PERMISSIONS} icon={<Settings className="size-4" />} />
                  )}
               </Stepper.Navigation>

               <Form {...form}>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                     <Stepper.Panel>
                        {methods.current.id === ProfileFormStep.BASIC_INFO && (
                           <ProfileInformationForm
                              form={form}
                              profileType={profileType}
                              handleProfileTypeChange={setProfileType}
                           />
                        )}
                        {methods.current.id === ProfileFormStep.PERMISSIONS && profileType === "user" && (
                           <PermissionForm
                              form={form}
                              resources={Object.keys(groupPermissionsByResource(PERMISSIONS)).sort()}
                              groupedPermissions={groupPermissionsByResource(PERMISSIONS)}
                              toggleAction={(resource, action, enabled) => {
                                 toggleAction(resource, action, enabled);
                              }}
                           />
                        )}
                     </Stepper.Panel>

                     <Stepper.Controls>
                        {profileType === "user" && !methods.isFirst && (
                           <Button type="button" variant="secondary" onClick={methods.prev} disabled={isPending}>
                              Anterior
                           </Button>
                        )}

                        {profileType === "user" && !methods.isLast ? (
                           <Button
                              type="button"
                              onClick={async () => {
                                 const isValid = await form.trigger(["name", "description"]);
                                 if (isValid) methods.next();
                              }}
                              disabled={isPending}
                           >
                              Próximo
                           </Button>
                        ) : (
                           <Button type="button" onClick={handleFinish} disabled={isPending}>
                              {isPending ? "Criando..." : "Criar Perfil"}
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

// Helper function to be placed inside the form component or imported
function groupPermissionsByResource(permissions: readonly any[]) {
   const grouped: Record<string, any> = {};
   permissions.forEach((p) => {
      if (!grouped[p.resource]) {
         grouped[p.resource] = { ...p };
      } else {
         grouped[p.resource].actions = [...new Set([...grouped[p.resource].actions, ...p.actions])];
      }
   });
   return grouped;
}
