import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface InputTextFieldProps {
   form: UseFormReturn<any>;
   name: string;
   label: string;
   placeholder: string;
   type?: string;
}

export function InputTextField({ form, name, label, placeholder, type }: InputTextFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem>
               <FormLabel>{label}</FormLabel>
               <FormControl>
                  <Input
                     placeholder={placeholder}
                     {...field}
                     value={field.value}
                     onChange={(e) => field.onChange(e.target.value)}
                     type={type}
                  />
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
