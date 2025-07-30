import type { DoctorFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { FormattedInput } from "../shared/FormattedInput";
import { InputPasswordField } from "../shared/InputPasswordField";
import { InputTextField } from "../shared/InputTextField";
import { FormDescription } from "../ui/form";

interface DoctorInformationProps {
   form: UseFormReturn<DoctorFormData>;
   userId?: string;
}

export function DoctorInformationForm({ form, userId }: DoctorInformationProps) {
   return (
      <div className="space-y-4">
         <InputTextField label="Nome Completo" name="name" form={form} placeholder="Digite o nome completo" />
         <div className="flex flex-col gap-2">
            <InputTextField
               label="Email"
               name="email"
               form={form}
               placeholder="Digite o email"
               type="email"
            />
            {userId && (
               <FormDescription>O email não pode ser alterado após a criação do usuário</FormDescription>
            )}
         </div>

         {!userId && <InputPasswordField label="Senha" name="password" form={form} />}

         <FormattedInput
            label="Telefone"
            name="phone"
            form={form}
            placeholder="Digite o telefone do médico"
            type="phone"
         />
      </div>
   );
}
