import { OrganizationFormSchema, type OrganizationFormData } from "@/lib/schemas";
import { useTRPC } from "@/server/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import { defineStepper } from "../ui/stepperize";
import { AddressForm } from "./AddressForm";
import { InformationForm } from "./InformationForm";

enum OrganizationFormStep {
   INFORMATION = "information",
   ADDRESS = "address",
}

const { Stepper } = defineStepper(
   {
      id: OrganizationFormStep.INFORMATION,
      icon: <Building2 className="size-4" />,
   },
   {
      id: OrganizationFormStep.ADDRESS,
      icon: <MapPin className="size-4" />,
   },
);

interface OrganizationFormProps {
   onOpenChange: (open: boolean) => void;
}

export function OrganizationForm({ onOpenChange }: OrganizationFormProps) {
   const trpc = useTRPC();
   const queryClient = useQueryClient();

   const { mutate: createOrganization, isPending } = useMutation(trpc.organization.create.mutationOptions());

   const form = useForm<OrganizationFormData>({
      resolver: zodResolver(OrganizationFormSchema),
      defaultValues: {
         name: "",
         email: "",
         phone: "",
         cnpj: "",
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

   const onSubmit = async (data: OrganizationFormData) => {
      createOrganization({
         name: data.name,
         slug: data.name.toLowerCase().replace(/ /g, "-"),
         cnpj: data.cnpj,
         email: data.email,
         phone: data.phone,
         address: {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
         },
      });

      queryClient.invalidateQueries({
         queryKey: trpc.organization.getAllOrganizations.queryOptions().queryKey,
      });

      form.reset();
      toast.success("Organização criada");
      onOpenChange(false);
   };

   const handleNext = async (methods: any) => {
      // Since methods.current.id is not available, we'll determine the step based on navigation state
      if (!methods.isLast) {
         // We're on the information step if not on last step
         const fieldsToValidate = ["name", "cnpj", "email", "phone"] as const;
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
         form.handleSubmit(onSubmit)();
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
                           [OrganizationFormStep.INFORMATION]: () => <InformationForm form={form} />,
                           [OrganizationFormStep.ADDRESS]: () => <AddressForm form={form} />,
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
