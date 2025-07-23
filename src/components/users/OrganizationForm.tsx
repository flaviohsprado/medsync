import type { UserFormData } from "@/lib/schemas";
import type { Organization, Unit } from "@/types";
import type { UseFormReturn } from "react-hook-form";
import { InputSelectField } from "../shared/InputSelectField";

interface UserOrganizationFormProps {
   form: UseFormReturn<UserFormData>;
   organizations: Array<Organization>;
   units: Array<Unit>;
}

export function UserOrganizationForm({ form, organizations, units }: UserOrganizationFormProps) {
   const organizationOptions = organizations.map((org) => ({
      label: org.name,
      value: org.id,
   }));

   const unitOptions = units.map((org) => ({
      label: org.name,
      value: org.id,
   }));

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold">Organização e Unidade</h3>
         <InputSelectField
            form={form}
            name="organizationId"
            label="Organização"
            placeholder="Selecione uma organização"
            options={organizationOptions}
         />
         <InputSelectField
            form={form}
            name="unitId"
            label="Unidade"
            placeholder="Selecione uma unidade"
            options={unitOptions}
         />
      </div>
   );
}
