import type { CustomOptions } from "@/types";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface InputSelectFieldProps {
   form: UseFormReturn<any>;
   name: string;
   label: string;
   placeholder: string;
   options: CustomOptions;
}

export function InputSelectField({ form, name, label, options, placeholder }: InputSelectFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem>
               <FormLabel>{label}</FormLabel>
               <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                     <FormControl>
                        <SelectTrigger>
                           <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                        {options.map((option) => (
                           <SelectItem key={`${option.value}`} value={option.value}>
                              {option.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
