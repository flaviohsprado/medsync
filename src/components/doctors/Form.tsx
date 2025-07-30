import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DoctorFormSchema, type DoctorFormData } from "@/lib/schemas";
import { useTRPC } from "@/server/react";
import { WeekDays } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { BriefcaseMedical, CalendarClock, Info } from "lucide-react";
import { useEffect } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { defineStepper } from "../ui/stepperize";
import { DoctorInformationForm } from "./InformationForm";
import { DoctorTechnicalInformationForm } from "./TechnicalInformation";
import { DoctorWorkScheduleForm } from "./WorkScheduleForm";

enum DoctorFormStep {
   PERSONAL = "personal",
   TECHNICAL = "technical",
   WORK_SCHEDULE = "work_schedule",
}

const { Stepper } = defineStepper(
   {
      id: DoctorFormStep.PERSONAL,
      icon: <Info className="size-4" />,
   },
   {
      id: DoctorFormStep.TECHNICAL,
      icon: <BriefcaseMedical className="size-4" />,
   },
   {
      id: DoctorFormStep.WORK_SCHEDULE,
      icon: <CalendarClock className="size-4" />,
   },
);

interface DoctorFormProps {
   organizationId: string;
   unitId: string;
   onClose: () => void;
   userId?: string;
}

export function DoctorForm({ userId, onClose, organizationId, unitId }: DoctorFormProps) {
   const trpc = useTRPC();
   const queryClient = useQueryClient();
   const { id: routeOrgId } = useParams({ strict: false });
   const currentOrgId = organizationId || routeOrgId;

   const { data: existingUser } = useQuery({
      ...trpc.user.getById.queryOptions({ id: userId! }),
      enabled: !!userId,
   });
   const { data: profiles = [] } = useQuery(trpc.profile.getAll.queryOptions());

   const { mutate: createUser, isPending: isCreating } = useMutation(
      trpc.user.create.mutationOptions({
         onSuccess: () => {
            toast.success("Médico cadastrado com sucesso");
            queryClient.invalidateQueries({ queryKey: trpc.user.getAll.queryOptions({}).queryKey });
            onClose();
         },
         onError: (error) => {
            toast.error(`Erro ao cadastrar Médico: ${error.message}`);
         },
      }),
   );

   const { mutate: updateUser, isPending: isUpdating } = useMutation(
      trpc.user.update.mutationOptions({
         onSuccess: () => {
            toast.success("Usuário atualizado com sucesso");
            queryClient.invalidateQueries({ queryKey: trpc.user.getAll.queryOptions({}).queryKey });
            if (userId) {
               queryClient.invalidateQueries({
                  queryKey: trpc.user.getById.queryOptions({ id: userId }).queryKey,
               });
            }
            onClose();
         },
         onError: (error) => {
            toast.error(`Erro ao atualizar usuário: ${error.message}`);
         },
      }),
   );

   const form = useForm<DoctorFormData>({
      resolver: zodResolver(DoctorFormSchema),
      defaultValues: {
         name: "",
         email: "",
         password: "",
         organizationId: currentOrgId || "",
         unitId: unitId ?? "",
         systemRole: "doctor",
         profileId: "",
         crm: "",
         phone: "",
         specialties: [],
         workSchedule: [
            {
               dayOfWeek: WeekDays.MONDAY,
               startTime: "",
               endTime: "",
               isActive: true,
            },
         ],
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

   const onSubmit = (data: DoctorFormData) => {
      if (userId) {
         updateUser({
            id: userId,
            data: {
               name: data.name,
               email: data.email,
               organizationId: data.organizationId,
               unitId: data.unitId || undefined,
               systemRole: "doctor",
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
            systemRole: "doctor",
            profileId: data.profileId || undefined,
         });
      }
   };

   const onError = (errors: FieldErrors<DoctorFormData>) => {
      console.log(errors);
   };

   const handleFinish = async () => {
      const isValid = await form.trigger();

      if (isValid) {
         form.handleSubmit(onSubmit, onError)();
      }
   };

   const handleNext = async (methods: any) => {
      if (!methods.isLast) {
         if (methods.current.id === DoctorFormStep.PERSONAL) {
            const fields: Array<keyof DoctorFormData> = [
               "name",
               "email",
               "phone",
               ...(userId ? [] : ["password"]),
            ] as Array<keyof DoctorFormData>;

            const isValid = await form.trigger(fields);

            if (isValid) methods.next();
         } else if (methods.current.id === DoctorFormStep.TECHNICAL) {
            const isValid = await form.trigger(["crm", "specialties"]);
            if (isValid) methods.next();
         }
      } else {
         methods.next();
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
                           [DoctorFormStep.PERSONAL]: () => (
                              <DoctorInformationForm form={form} userId={userId} />
                           ),
                           [DoctorFormStep.TECHNICAL]: () => <DoctorTechnicalInformationForm form={form} />,
                           [DoctorFormStep.WORK_SCHEDULE]: () => <DoctorWorkScheduleForm doctorform={form} />,
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
                                   ? "Atualizar médico"
                                   : "Cadastrar médico"}
                           </Button>
                        )}
                        <Button type="button" variant="outline" onClick={onClose}>
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
