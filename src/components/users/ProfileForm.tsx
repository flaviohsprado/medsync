import type { UserFormData } from "@/lib/schemas";
import type { Profile } from "@/types";
import type { UseFormReturn } from "react-hook-form";
import { InputSelectField } from "../shared/InputSelectField";

interface UserProfileFormProps {
   form: UseFormReturn<UserFormData>;
   profiles: Array<Profile>;
}

export function UserProfileForm({ profiles, form }: UserProfileFormProps) {
   const profileOptions = profiles.map((profile) => ({
      label: profile.name,
      value: profile.id,
   }));
   const watchedSystemRole = form.watch("systemRole");

   return (
      <div className="space-y-4">
         <h3 className="text-lg font-semibold">Perfil de permissão</h3>
         <InputSelectField
            form={form}
            name="profileId"
            label="Perfil de permissão"
            placeholder="Selecione um perfil"
            options={profileOptions}
         />

         <div className="space-y-2">
            <h4 className="text-sm font-medium">Resumo das Permissões</h4>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
               {(() => {
                  const selectedProfile = profiles.find((p) => p.id === form.watch("profileId"));
                  if (selectedProfile) {
                     return (
                        <div className="text-sm text-blue-800">
                           <p className="font-medium">{selectedProfile.name}</p>
                           <p>{selectedProfile.description}</p>
                           <p className="mt-2 text-xs">
                              Permissões: {selectedProfile.permissions?.length || 0} recursos configurados
                           </p>
                        </div>
                     );
                  }
                  return (
                     <p className="text-sm text-blue-800">Este usuário terá acesso baseado no perfil selecionado.</p>
                  );
               })()}
            </div>
         </div>
      </div>
   );
}
