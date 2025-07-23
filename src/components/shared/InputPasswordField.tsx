import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { PasswordInput } from "../ui/password-input";

interface InputPasswordFieldProps {
   form: UseFormReturn<any>;
   name: string;
   label: string;
}

export function InputPasswordField({ form, name, label }: InputPasswordFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem>
               <FormLabel>{label}</FormLabel>
               <FormControl>
                  <PasswordInput {...field} />
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
