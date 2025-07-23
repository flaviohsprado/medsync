import type { OrganizationFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { CEPInput } from "../shared/CEPInput";
import { InputTextField } from "../shared/InputTextField";

interface AddressFormProps {
   form: UseFormReturn<OrganizationFormData>;
}

export function AddressForm({ form }: AddressFormProps) {
   return (
      <div className="space-y-4">
         <CEPInput form={form} name="address.zipCode" label="CEP" placeholder="00000-000" />

         <InputTextField form={form} name="address.street" label="Rua" placeholder="Ex: Av. Paulista" />

         <div className="grid grid-cols-2 gap-4">
            <InputTextField form={form} name="address.number" label="Número" placeholder="1000" />

            <InputTextField
               form={form}
               name="address.complement"
               label="Complemento"
               placeholder="Sala 101 (opcional)"
            />
         </div>

         <InputTextField form={form} name="address.neighborhood" label="Bairro" placeholder="Bela Vista" />

         <div className="grid grid-cols-2 gap-4">
            <InputTextField form={form} name="address.city" label="Cidade" placeholder="São Paulo" />

            <InputTextField form={form} name="address.state" label="Estado" placeholder="SP" />
         </div>
      </div>
   );
}
