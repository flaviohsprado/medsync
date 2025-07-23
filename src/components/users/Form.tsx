import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormSchema, type UserFormData } from "@/lib/schemas";
import { useTRPC } from "@/server/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { User, UserCheck, UserCog } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { InputPasswordField } from "../shared/InputPasswordField";
import { InputTextField } from "../shared/InputTextField";

interface UserFormProps {
   userId?: string;
   onOpenChange?: (open: boolean) => void;
   onSuccess?: () => void;
   organizationId?: string;
}

interface RoleOption {
   value: "super_admin" | "admin" | "user";
   label: string;
   icon: typeof UserCog;
}

export function UserForm({ userId, onOpenChange, onSuccess, organizationId }: UserFormProps) {
   const trpc = useTRPC();
   const queryClient = useQueryClient();
   const { id: routeOrgId } = useParams({ strict: false });

   const currentOrgId = organizationId || routeOrgId;

   // Fetch current user to check permissions
   const { data: currentUser } = useQuery({
      ...trpc.user.getCurrentUser.queryOptions(),
      enabled: true,
   });

   // Fetch existing user data if editing
   const { data: existingUser } = useQuery({
      ...trpc.user.getById.queryOptions({ id: userId! }),
      enabled: !!userId,
   });

   // Fetch available units
   const { data: units = [] } = useQuery({
      ...trpc.unit.getByOrganization.queryOptions({ organizationId: currentOrgId! }),
      enabled: !!currentOrgId,
   });

   // Fetch available profiles
   const { data: profiles = [] } = useQuery(trpc.profile.getAll.queryOptions());

   // Mutations - Using Better Auth for user creation
   const { mutate: createUser, isPending: isCreating } = useMutation(
      trpc.user.create.mutationOptions({
         onSuccess: () => {
            toast.success("Usuário criado com sucesso");
            queryClient.invalidateQueries({ queryKey: trpc.user.getAll.queryOptions({}).queryKey });
            onSuccess?.();
            onOpenChange?.(false);
         },
         onError: (error) => {
            toast.error(`Erro ao criar usuário: ${error.message}`);
         },
      }),
   );

   const { mutate: updateUser, isPending: isUpdating } = useMutation(
      trpc.user.update.mutationOptions({
         onSuccess: () => {
            toast.success("Usuário atualizado com sucesso");
            queryClient.invalidateQueries({ queryKey: trpc.user.getAll.queryOptions({}).queryKey });
            if (userId) {
               queryClient.invalidateQueries({ queryKey: trpc.user.getById.queryOptions({ id: userId }).queryKey });
            }
            onSuccess?.();
            onOpenChange?.(false);
         },
         onError: (error) => {
            toast.error(`Erro ao atualizar usuário: ${error.message}`);
         },
      }),
   );

   const form = useForm<UserFormData>({
      resolver: zodResolver(UserFormSchema),
      defaultValues: {
         name: "",
         email: "",
         password: "",
         organizationId: currentOrgId || "",
         unitId: "",
         systemRole: "user",
         profile: "",
      },
   });

   // Update form when existing user data is loaded
   useEffect(() => {
      if (existingUser) {
         form.reset({
            name: existingUser.name,
            email: existingUser.email,
            organizationId: existingUser.organizationId || currentOrgId || "",
            unitId: existingUser.unitId || "",
            systemRole: (existingUser as any).systemRole || "user",
            profile: (existingUser as any).profileId || "",
         });
      }
   }, [existingUser, form, currentOrgId]);

   const watchedSystemRole = form.watch("systemRole");

   // Permission checks
   const canAssignAdminRoles = currentUser?.systemRole === "super_admin";
   const canAssignUserRoles = currentUser?.systemRole === "admin" || currentUser?.systemRole === "super_admin";

   const roleOptions: RoleOption[] = [];
   if (canAssignAdminRoles) {
      roleOptions.push(
         { value: "super_admin", label: "Super Admin", icon: UserCog },
         { value: "admin", label: "Administrador", icon: UserCheck },
      );
   }
   if (canAssignUserRoles) {
      roleOptions.push({ value: "user", label: "Usuário", icon: User });
   }

   const onSubmit = (data: UserFormData) => {
      if (userId) {
         updateUser({
            id: userId,
            name: data.name,
            organizationId: data.organizationId,
            unitId: data.unitId || undefined,
            systemRole: data.systemRole,
            profile: data.profile || undefined,
         });
      } else {
         createUser({
            name: data.name,
            email: data.email,
            password: data.password!,
            organizationId: data.organizationId,
            unitId: data.unitId!,
            systemRole: data.systemRole,
         });
      }
   };

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold">Informações Básicas</h3>

               <InputTextField label="Nome Completo" name="name" form={form} placeholder="Digite o nome completo" />

               <div className="flex flex-col gap-2">
                  <InputTextField label="Email" name="email" form={form} placeholder="Digite o email" type="email" />

                  {userId && <FormDescription>O email não pode ser alterado após a criação do usuário</FormDescription>}
               </div>

               {!userId && <InputPasswordField label="Senha" name="password" form={form} />}
            </div>

            {/* Organization and Unit */}
            <div className="space-y-4">
               <h3 className="text-lg font-semibold">Organização e Unidade</h3>

               <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Organização</FormLabel>
                        <FormControl>
                           <Input value={currentOrgId || ""} disabled placeholder="Organização atual" />
                        </FormControl>
                        <FormDescription>O usuário será criado na organização atual</FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />

               <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                     <FormItem>
                        <FormLabel>Unidade {watchedSystemRole === "admin" ? "(Opcional)" : ""}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                           <FormControl>
                              <SelectTrigger>
                                 <SelectValue
                                    placeholder={
                                       watchedSystemRole === "admin"
                                          ? "Nenhuma unidade específica"
                                          : "Selecione uma unidade"
                                    }
                                 />
                              </SelectTrigger>
                           </FormControl>
                           <SelectContent>
                              {units.map((unit) => (
                                 <SelectItem key={unit.id} value={unit.id}>
                                    {unit.name}
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                        <FormDescription>
                           {watchedSystemRole === "admin"
                              ? "Administradores podem gerenciar todas as unidades da organização"
                              : "Selecione a unidade onde o usuário trabalhará"}
                        </FormDescription>
                        <FormMessage />
                     </FormItem>
                  )}
               />
            </div>

            {/* Role and Permissions */}
            {roleOptions.length > 0 && (
               <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Função e Permissões</h3>

                  <FormField
                     control={form.control}
                     name="systemRole"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Função no Sistema</FormLabel>
                           <Select onValueChange={field.onChange} value={field.value || "user"}>
                              <FormControl>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma função" />
                                 </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                 {roleOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                       <div className="flex items-center gap-2">
                                          <option.icon className="h-4 w-4" />
                                          {option.label}
                                       </div>
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           <FormDescription>
                              {watchedSystemRole === "super_admin" &&
                                 "Acesso total ao sistema, incluindo todas as organizações"}
                              {watchedSystemRole === "admin" && "Acesso administrativo completo à organização"}
                              {watchedSystemRole === "user" && "Acesso baseado no perfil de permissões selecionado"}
                           </FormDescription>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  {watchedSystemRole === "user" && (
                     <FormField
                        control={form.control}
                        name="profile"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Perfil de Permissões</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                 <FormControl>
                                    <SelectTrigger>
                                       <SelectValue placeholder="Sem perfil específico" />
                                    </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                    {profiles.map((profile) => (
                                       <SelectItem key={profile.id} value={profile.id}>
                                          <div>
                                             <div className="font-medium">{profile.name}</div>
                                             <div className="text-sm text-muted-foreground">{profile.description}</div>
                                          </div>
                                       </SelectItem>
                                    ))}
                                 </SelectContent>
                              </Select>
                              <FormDescription>
                                 O perfil define quais permissões específicas o usuário terá no sistema.
                                 {profiles.length === 0 && " Nenhum perfil disponível. Crie perfis na seção de perfis."}
                              </FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  )}
               </div>
            )}

            {/* Permission Summary */}
            {watchedSystemRole === "user" && form.watch("profile") && (
               <div className="space-y-2">
                  <h4 className="text-sm font-medium">Resumo das Permissões</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                     {(() => {
                        const selectedProfile = profiles.find((p) => p.id === form.watch("profile"));
                        if (selectedProfile) {
                           return (
                              <div className="text-sm text-blue-800">
                                 <p className="font-medium">{selectedProfile.name}</p>
                                 <p>{selectedProfile.description}</p>
                                 <p className="mt-2 text-xs">
                                    Permissões: {selectedProfile.permissions?.length || 0} recursos configurados
                                 </p>
                              </div>
                           );
                        }
                        return (
                           <p className="text-sm text-blue-800">
                              Este usuário terá acesso baseado no perfil selecionado.
                           </p>
                        );
                     })()}
                  </div>
               </div>
            )}

            {/* Role Assignment Warning */}
            {!canAssignUserRoles && (
               <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                     <strong>Aviso:</strong> Você não tem permissão para atribuir funções a usuários.
                  </p>
               </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
               <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                  Cancelar
               </Button>
               <Button type="submit" disabled={isCreating || isUpdating || !canAssignUserRoles}>
                  {isCreating || isUpdating ? "Salvando..." : userId ? "Atualizar Usuário" : "Criar Usuário"}
               </Button>
            </div>
         </form>
      </Form>
   );
}
