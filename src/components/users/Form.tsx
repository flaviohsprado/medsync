import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UserFormSchema, type UserFormData } from "@/lib/schemas";
import { useTRPC } from "@/server/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Building2, Info, Shield, UserCog } from "lucide-react";
import { useEffect } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { defineStepper } from "../ui/stepperize";
import { UserInformationForm } from "./InformationForm";
import { UserOrganizationForm } from "./OrganizationForm";
import { UserProfileForm } from "./ProfileForm";

enum UserFormStep {
   BASIC = "basic",
   ORG_UNIT = "org_unit",
   PROFILE = "profile",
}

const { Stepper } = defineStepper(
   {
      id: UserFormStep.BASIC,
      icon: <Info className="size-4" />,
   },
   {
      id: UserFormStep.ORG_UNIT,
      icon: <Building2 className="size-4" />,
   },
   {
      id: UserFormStep.PROFILE,
      icon: <Shield className="size-4" />,
   },
);

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

   const { data: units = [] } = useQuery({
      ...trpc.unit.getByOrganization.queryOptions({ organizationId: currentOrgId! }),
      enabled: !!currentOrgId,
   });
   const { data: organizations = [] } = useQuery(
      trpc.organization.getOrganizations.queryOptions({ id: currentOrgId! }),
   );
   const { data: profiles = [] } = useQuery(trpc.profile.getAll.queryOptions());

   // Mutations
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
         profileId: "",
      },
   });

   useEffect(() => {
      if (existingUser) {
         form.reset({
            name: existingUser.name,
            email: existingUser.email,
            organizationId: existingUser.organizationId ?? currentOrgId ?? "",
            unitId: existingUser.unitId ?? "",
            systemRole: existingUser.systemRole ?? "user",
            profileId: existingUser.profileId ?? "",
         });
      }
   }, [existingUser, form, currentOrgId]);

   const onSubmit = (data: UserFormData) => {
      if (userId) {
         updateUser({
            id: userId,
            data: {
               name: data.name,
               email: data.email,
               organizationId: data.organizationId,
               unitId: data.unitId || undefined,
               systemRole: data.systemRole,
               profileId: data.profileId || undefined,
            },
         });
      } else {
         createUser({
            name: data.name,
            email: data.email,
            password: data.password!,
            organizationId: data.organizationId,
            unitId: data.unitId!,
            systemRole: data.systemRole,
            profileId: data.profileId || undefined,
         });
      }
   };

   const onError = (errors: FieldErrors<UserFormData>) => {
      // Optionally show errors
      console.log(errors);
   };

   const handleNext = async (methods: any) => {
      if (!methods.isLast) {
         // Validate only fields for current step
         if (methods.current.id === UserFormStep.BASIC) {
            const fields: Array<keyof UserFormData> = ["name", "email", ...(userId ? [] : ["password"])] as Array<
               keyof UserFormData
            >;
            const isValid = await form.trigger(fields);
            if (isValid) methods.next();
         } else if (methods.current.id === UserFormStep.ORG_UNIT) {
            const isValid = await form.trigger(["organizationId", "unitId"]);
            if (isValid) methods.next();
         }
      } else {
         methods.next();
      }
   };

   const handleFinish = async () => {
      const isValid = await form.trigger();
      if (isValid) {
         form.handleSubmit(onSubmit, onError)();
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
                           [UserFormStep.BASIC]: () => <UserInformationForm form={form} userId={userId} />,
                           [UserFormStep.ORG_UNIT]: () => (
                              <UserOrganizationForm form={form} organizations={organizations} units={units} />
                           ),
                           [UserFormStep.PROFILE]: () => <UserProfileForm profiles={profiles} form={form} />,
                        })}
                     </Stepper.Panel>

                     <Stepper.Controls>
                        {!methods.isFirst && (
                           <Button
                              type="button"
                              variant="secondary"
                              onClick={methods.prev}
                              disabled={isCreating || isUpdating}
                           >
                              Anterior
                           </Button>
                        )}
                        {!methods.isLast ? (
                           <Button
                              type="button"
                              onClick={() => handleNext(methods)}
                              disabled={isCreating || isUpdating}
                           >
                              Próximo
                           </Button>
                        ) : (
                           <Button type="button" onClick={handleFinish} disabled={isCreating || isUpdating}>
                              {isCreating || isUpdating
                                 ? "Salvando..."
                                 : userId
                                   ? "Atualizar Usuário"
                                   : "Criar Usuário"}
                           </Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                           Cancelar
                        </Button>
                     </Stepper.Controls>
                  </form>
               </Form>
            </>
         )}
      </Stepper.Provider>
   );
}
