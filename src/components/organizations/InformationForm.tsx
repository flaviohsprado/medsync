import type { OrganizationFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { FormattedInput } from "../shared/FormattedInput";
import { InputTextField } from "../shared/InputTextField";

interface InformationFormProps {
   form: UseFormReturn<OrganizationFormData>;
}

export function InformationForm({ form }: InformationFormProps) {
   return (
      <div className="space-y-4">
         <InputTextField form={form} name="name" label="Nome da Organização" placeholder="Ex: Clínica Médica Central" />

         <FormattedInput form={form} name="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" type="cnpj" />

         <InputTextField form={form} name="email" label="Email" placeholder="contato@clinica.com.br" type="email" />

         <FormattedInput form={form} name="phone" label="Telefone" placeholder="(11) 99999-9999" type="phone" />
      </div>
   );
}
