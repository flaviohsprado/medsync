import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface InputSelectFieldProps {
   form: UseFormReturn<any>;
   name: string;
   options: Array<{ label: string; value: string }>;
   placeholder?: string;
   label?: string;
}

export function InputSelectField({ form, placeholder, name, label, options }: InputSelectFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => (
            <FormItem>
               {label && <FormLabel className="text-sm">{label}</FormLabel>}
               <FormControl>
                  <Popover>
                     <PopoverTrigger asChild>
                        <FormControl>
                           <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                 "w-full justify-between",
                                 !field.value && "text-muted-foreground",
                              )}
                           >
                              {field.value
                                 ? options.find((option) => option.value === field.value)?.label
                                 : "Selecione uma opção"}
                              <ChevronsUpDown className="opacity-50" />
                           </Button>
                        </FormControl>
                     </PopoverTrigger>
                     <PopoverContent className="w-full p-0">
                        <Command>
                           <CommandInput placeholder={placeholder || "Pesquisar..."} className="h-9" />
                           <CommandList>
                              <CommandEmpty>Nenhuma opção encontrada</CommandEmpty>
                              <CommandGroup>
                                 {options.map((option) => (
                                    <CommandItem
                                       value={option.label}
                                       key={option.value}
                                       onSelect={() => {
                                          field.onChange(option.value);
                                       }}
                                    >
                                       {option.label}
                                       <Check
                                          className={cn(
                                             "ml-auto",
                                             option.value === field.value ? "opacity-100" : "opacity-0",
                                          )}
                                       />
                                    </CommandItem>
                                 ))}
                              </CommandGroup>
                           </CommandList>
                        </Command>
                     </PopoverContent>
                  </Popover>
               </FormControl>
               <FormMessage />
            </FormItem>
         )}
      />
   );
}
