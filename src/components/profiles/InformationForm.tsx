import type { ProfileFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { InputTextField } from "../shared/InputTextField";
import { InputTextareaField } from "../shared/InputTextareaField";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface InformationFormProps {
   form: UseFormReturn<ProfileFormData>;
   selectedScope: "organization" | "unit" | "self";
   handleScopeChange: (value: "organization" | "unit" | "self") => void;
   isRootOrganization: boolean;
}

export function ProfileInformationForm({
   form,
   selectedScope,
   handleScopeChange,
   isRootOrganization,
}: InformationFormProps) {
   return (
      <div className="space-y-6">
         <InputTextField form={form} name="name" label="Nome do Perfil" placeholder="Ex: Gerente de Unidade" />
         <InputTextareaField
            form={form}
            name="description"
            label="Descrição"
            placeholder="Descreva as responsabilidades deste perfil"
         />

         {/* Scope Selection */}
         <div className="space-y-2">
            <Label htmlFor="scope-select" className="text-sm font-medium">
               Nível de Acesso
            </Label>
            <Select value={selectedScope} onValueChange={handleScopeChange}>
               <SelectTrigger id="scope-select">
                  <SelectValue placeholder="Selecione o nível de acesso" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="organization">Organização</SelectItem>
                  <SelectItem value="unit">Unidade</SelectItem>
                  <SelectItem value="self">Próprio</SelectItem>
               </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
               {selectedScope === "organization" && "Acesso aos dados da organização inteira"}
               {selectedScope === "unit" && "Acesso limitado à unidade específica"}
               {selectedScope === "self" && "Acesso limitado aos próprios dados"}
            </p>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
               <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> As permissões específicas serão definidas na próxima etapa. O nível de acesso
                  determina o escopo onde essas permissões se aplicam.
               </p>
            </div>
         </div>
      </div>
   );
}
