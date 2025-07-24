import type { UnitFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { FormattedInput } from "../shared/FormattedInput";
import { InputTextField } from "../shared/InputTextField";

interface InformationFormProps {
   form: UseFormReturn<UnitFormData>;
}

export function InformationForm({ form }: InformationFormProps) {
   return (
      <div className="space-y-4">
         <InputTextField
            form={form}
            name="name"
            label="Nome da Organização"
            placeholder="Ex: Clínica Médica Central"
         />

         <FormattedInput
            form={form}
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
            type="phone"
         />

         <InputTextField form={form} name="manager" label="Responsável" placeholder="Dr. João Silva" />

         <InputTextField
            form={form}
            name="specialties"
            label="Especialidades"
            placeholder="Clínica Geral, Pediatria, Cardiologia"
         />
      </div>
   );
}
