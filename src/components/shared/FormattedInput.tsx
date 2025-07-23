import { formatCEP, formatCNPJ, formatCPF, formatPhone, removeMask } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

interface FormattedInputProps {
   form: UseFormReturn<any>;
   name: string;
   label: string;
   placeholder: string;
   type?: "cep" | "cnpj" | "cpf" | "phone" | "text" | "email" | "tel" | "number";
   onValueChange?: (value: string, formattedValue: string) => void;
   disabled?: boolean;
}

export function FormattedInput({
   form,
   name,
   label,
   placeholder,
   type = "text",
   onValueChange,
   disabled = false,
}: FormattedInputProps) {
   const getFormatter = (type: string) => {
      switch (type) {
         case "cep":
            return formatCEP;
         case "cnpj":
            return formatCNPJ;
         case "cpf":
            return formatCPF;
         case "phone":
            return formatPhone;
         default:
            return (value: string) => value;
      }
   };

   const formatter = getFormatter(type);

   const handleChange = (value: string) => {
      const formattedValue = formatter(value);
      const rawValue = removeMask(value);

      // Update form with raw value for validation
      form.setValue(name, rawValue);

      // Call callback with both values if provided
      if (onValueChange) {
         onValueChange(rawValue, formattedValue);
      }

      return formattedValue;
   };

   const getInputType = (type: string) => {
      switch (type) {
         case "email":
            return "email";
         case "tel":
         case "phone":
            return "tel";
         case "number":
            return "number";
         default:
            return "text";
      }
   };

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
                     value={formatter(field.value || "")}
                     onChange={(e) => {
                        const formattedValue = handleChange(e.target.value);
                        // Update the displayed value
                        e.target.value = formattedValue;
                     }}
                     onBlur={field.onBlur}
                     disabled={disabled}
                     type={getInputType(type)}
                  />
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
