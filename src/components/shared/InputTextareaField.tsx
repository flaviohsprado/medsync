import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";

interface InputTextareaFieldProps {
   form: UseFormReturn<any>;
   name: string;
   label: string;
   placeholder: string;
}

export function InputTextareaField({ form, name, label, placeholder }: InputTextareaFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem>
               <FormLabel>{label}</FormLabel>
               <FormControl>
                  <Textarea
                     placeholder={placeholder}
                     {...field}
                     value={field.value}
                     onChange={(e) => field.onChange(e.target.value)}
                  />
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
