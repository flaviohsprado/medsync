import type { ProfileFormData } from "@/lib/schemas";
import type { UseFormReturn } from "react-hook-form";
import { InputTextField } from "../shared/InputTextField";
import { InputTextareaField } from "../shared/InputTextareaField";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface InformationFormProps {
   form: UseFormReturn<ProfileFormData>;
   profileType: "user" | "admin" | "super_admin";
   handleProfileTypeChange: (value: "user" | "admin" | "super_admin") => void;
}

export function ProfileInformationForm({ form, profileType, handleProfileTypeChange }: InformationFormProps) {
   return (
      <div className="space-y-6">
         <InputTextField form={form} name="name" label="Nome do Perfil" placeholder="Ex: Gerente de Unidade" />
         <InputTextareaField
            form={form}
            name="description"
            label="Descrição"
            placeholder="Descreva as responsabilidades deste perfil"
         />

         {/* Profile Type Selection */}
         <div className="space-y-2">
            <Label htmlFor="profile-type-select" className="text-sm font-medium">
               Tipo de Perfil
            </Label>
            <Select value={profileType} onValueChange={handleProfileTypeChange} defaultValue="user">
               <SelectTrigger id="profile-type-select">
                  <SelectValue placeholder="Selecione o tipo de perfil" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="user">Usuário (Permissões Customizadas)</SelectItem>
                  <SelectItem value="admin">Administrador (Todas as Permissões)</SelectItem>
                  <SelectItem value="super_admin">Super Admin (Todas as Permissões)</SelectItem>
               </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
               {profileType === "user" && "Você definirá as permissões específicas na próxima etapa."}
               {profileType !== "user" && "Este perfil terá acesso total a todos os recursos."}
            </p>
         </div>
      </div>
   );
}
