import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Switch } from "../ui/switch";

interface InputSwitchFieldProps {
   form: UseFormReturn<any>;
   name: string;
   label?: string;
   onChange?: (value: boolean) => void;
}

export function InputSwitchField({ form, name, label, onChange }: InputSwitchFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem>
               {label && <FormLabel className="text-sm">{label}</FormLabel>}
               <FormControl>
                  <Switch
                     className="data-[state=checked]:bg-primary"
                     checked={field.value}
                     onCheckedChange={(checked) => {
                        field.onChange(checked);
                        onChange?.(checked);
                     }}
                  />
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
