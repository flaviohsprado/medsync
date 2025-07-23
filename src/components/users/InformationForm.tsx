import type { UserFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { InputPasswordField } from "../shared/InputPasswordField";
import { InputTextField } from "../shared/InputTextField";
import { FormDescription } from "../ui/form";

interface UserInformationProps {
   form: UseFormReturn<UserFormData>;
   userId?: string;
}

export function UserInformationForm({ form, userId }: UserInformationProps) {
   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold">Informações Básicas</h3>
         <InputTextField label="Nome Completo" name="name" form={form} placeholder="Digite o nome completo" />
         <div className="flex flex-col gap-2">
            <InputTextField label="Email" name="email" form={form} placeholder="Digite o email" type="email" />
            {userId && <FormDescription>O email não pode ser alterado após a criação do usuário</FormDescription>}
         </div>
         {!userId && <InputPasswordField label="Senha" name="password" form={form} />}
      </div>
   );
}
