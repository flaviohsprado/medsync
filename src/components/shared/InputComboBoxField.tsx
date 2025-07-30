import { cn } from "@/lib/utils";
import type { CustomOptions } from "@/types";
import { Check, ChevronsUpDown, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface InputComboBoxFieldProps {
   form: UseFormReturn<any>;
   name: string;
   options: CustomOptions;
   placeholder?: string;
   label?: string;
}

export function InputComboBoxField({ form, placeholder, name, label, options }: InputComboBoxFieldProps) {
   return (
      <FormField
         control={form.control}
         name={name}
         render={({ field }) => {
            const selectedValues = Array.isArray(field.value) ? field.value : [];

            const handleSelect = (currentValue: string) => {
               const newSelectedValues = selectedValues.includes(currentValue)
                  ? selectedValues.filter((value) => value !== currentValue)
                  : [...selectedValues, currentValue];
               field.onChange(newSelectedValues);
            };

            const handleRemove = (valueToRemove: string) => {
               const newSelectedValues = selectedValues.filter((value) => value !== valueToRemove);
               field.onChange(newSelectedValues);
            };

            const selectedItems = options.filter((option) => selectedValues.includes(option.value));

            return (
               <FormItem>
                  {label && <FormLabel className="text-sm">{label}</FormLabel>}

                  <Popover>
                     <PopoverTrigger asChild>
                        <FormControl>
                           <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                 "w-full justify-between",
                                 !selectedValues.length && "text-muted-foreground",
                              )}
                           >
                              {selectedValues.length > 0
                                 ? `${selectedValues.length} opção(s) selecionada(s)`
                                 : "Selecione uma opção"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                           </Button>
                        </FormControl>
                     </PopoverTrigger>
                     <PopoverContent className="w-full p-0" align="start">
                        <Command>
                           <CommandInput placeholder={placeholder || "Pesquisar..."} />
                           <CommandList>
                              <CommandEmpty>Nenhuma opção encontrada</CommandEmpty>
                              <CommandGroup>
                                 {options.map((option) => (
                                    <CommandItem
                                       value={option.label}
                                       key={option.value}
                                       onSelect={() => handleSelect(option.value)}
                                    >
                                       <Check
                                          className={cn(
                                             "mr-2 h-4 w-4",
                                             selectedValues.includes(option.value)
                                                ? "opacity-100"
                                                : "opacity-0",
                                          )}
                                       />
                                       {option.label}
                                    </CommandItem>
                                 ))}
                              </CommandGroup>
                           </CommandList>
                        </Command>
                     </PopoverContent>
                  </Popover>

                  {selectedItems.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-2">
                        {selectedItems.map((item) => (
                           <Badge key={item.value} className="px-2 py-1 text-sm">
                              {item.label}
                              <button
                                 className="ml-2 rounded-full p-0.5 outline-none ring-offset-background transition-colors hover:bg-background/80 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                 onClick={() => handleRemove(item.value)}
                                 type="button"
                              >
                                 <X className="h-3 w-3" />
                                 <span className="sr-only">Remove {item.label}</span>
                              </button>
                           </Badge>
                        ))}
                     </div>
                  )}

                  <FormMessage />
               </FormItem>
            );
         }}
      />
   );
}
