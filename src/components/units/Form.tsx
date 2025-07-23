import { UnitFormSchema, type UnitFormData } from "@/lib/schemas";
import { useTRPC } from "@/server/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { defineStepper } from "../ui/stepperize";
import { AddressForm } from "./AddressForm";
import { InformationForm } from "./InformationForm";

enum HealthUnitFormStep {
   INFORMATION = "information",
   ADDRESS = "address",
}

const { Stepper } = defineStepper(
   {
      id: HealthUnitFormStep.INFORMATION,
      icon: <Building2 className="size-4" />,
   },
   {
      id: HealthUnitFormStep.ADDRESS,
      icon: <MapPin className="size-4" />,
   },
);

interface HealthUnitFormProps {
   organizationId: string;
   onOpenChange: (open: boolean) => void;
}

export function HealthUnitForm({ organizationId, onOpenChange }: HealthUnitFormProps) {
   const trpc = useTRPC();
   const queryClient = useQueryClient();

   const { mutate: createUnit, isPending } = useMutation(trpc.unit.create.mutationOptions());

   const form = useForm<UnitFormData>({
      resolver: zodResolver(UnitFormSchema),
      defaultValues: {
         name: "",
         email: "",
         phone: "",
         manager: "",
         specialties: "",
         address: {
            street: "",
            number: "",
            complement: "",
            neighborhood: "",
            city: "",
            state: "",
            zipCode: "",
         },
      },
   });

   const onSubmit = async (data: UnitFormData) => {
      createUnit({
         name: data.name,
         email: data.email ?? "",
         phone: data.phone,
         manager: data.manager ?? "",
         specialties: data.specialties ?? "",
         address: {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
         },
         organizationId,
      });

      queryClient.invalidateQueries({
         queryKey: ["health-units", organizationId],
      });

      form.reset();
      toast.success("Organização criada");
      onOpenChange(false);
   };

   const onError = (errors: FieldErrors<UnitFormData>) => {
      console.log(errors);
   };

   const handleNext = async (methods: any) => {
      // Since methods.current.id is not available, we'll determine the step based on navigation state
      if (!methods.isLast) {
         // We're on the information step if not on last step
         const fieldsToValidate = ["name", "email", "phone", "manager", "specialties"] as const;
         const isValid = await form.trigger(fieldsToValidate);
         if (isValid) {
            methods.next();
         }
      } else {
         // We're on the address step (last step)
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
                           [HealthUnitFormStep.INFORMATION]: () => <InformationForm form={form} />,
                           [HealthUnitFormStep.ADDRESS]: () => <AddressForm form={form} />,
                        })}
                     </Stepper.Panel>

                     <Stepper.Controls>
                        {!methods.isFirst && (
                           <Button type="button" variant="secondary" onClick={methods.prev} disabled={isPending}>
                              Anterior
                           </Button>
                        )}

                        {!methods.isLast ? (
                           <Button type="button" onClick={() => handleNext(methods)} disabled={isPending}>
                              Próximo
                           </Button>
                        ) : (
                           <Button type="button" onClick={handleFinish} disabled={isPending}>
                              {isPending ? "Criando..." : "Criar Organização"}
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
