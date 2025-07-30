import { especialties } from "@/constants";
import type { DoctorFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { InputComboBoxField } from "../shared/InputComboBoxField";
import { InputTextField } from "../shared/InputTextField";

interface DoctorTechnicalInformationProps {
   form: UseFormReturn<DoctorFormData>;
}

export function DoctorTechnicalInformationForm({ form }: DoctorTechnicalInformationProps) {
   return (
      <div className="space-y-4">
         <InputTextField
            label="CRM"
            name="crm"
            form={form}
            placeholder="Digite o CRM do médico"
            type="text"
         />
         <InputComboBoxField
            label="Especialidades"
            name="specialties"
            form={form}
            placeholder="Selecione as especialidades"
            options={especialties}
         />
      </div>
   );
}
