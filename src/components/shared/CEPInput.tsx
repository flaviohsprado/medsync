import { fetchCEPData } from "@/lib/utils";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FormattedInput } from "./FormattedInput";

interface CEPInputProps {
   form: UseFormReturn<any>;
   name: string;
   label: string;
   placeholder: string;
   onAddressFound?: (address: { street: string; neighborhood: string; city: string; state: string }) => void;
}

export function CEPInput({ form, name, label, placeholder, onAddressFound }: CEPInputProps) {
   const [isLoading, setIsLoading] = useState(false);

   const handleCEPChange = async (rawValue: string, formattedValue: string) => {
      // Only fetch if we have a complete CEP (8 digits)
      if (rawValue.length === 8) {
         setIsLoading(true);

         try {
            const cepData = await fetchCEPData(rawValue);

            if (cepData) {
               // Auto-fill address fields if callback provided
               if (onAddressFound) {
                  onAddressFound({
                     street: cepData.street,
                     neighborhood: cepData.neighborhood,
                     city: cepData.city,
                     state: cepData.state,
                  });
               }

               // You can also directly update form fields if needed
               // This assumes the form has nested address fields
               const basePath = name.includes(".") ? name.split(".")[0] : "address";

               if (cepData.street) {
                  form.setValue(`${basePath}.street`, cepData.street);
               }
               if (cepData.neighborhood) {
                  form.setValue(`${basePath}.neighborhood`, cepData.neighborhood);
               }
               if (cepData.city) {
                  form.setValue(`${basePath}.city`, cepData.city);
               }
               if (cepData.state) {
                  form.setValue(`${basePath}.state`, cepData.state);
               }
            }
         } catch (error) {
            console.error("Error fetching CEP:", error);
         } finally {
            setIsLoading(false);
         }
      }
   };

   return (
      <div className="relative">
         <FormattedInput
            form={form}
            name={name}
            label={label}
            placeholder={placeholder}
            type="cep"
            onValueChange={handleCEPChange}
            disabled={isLoading}
         />
         {isLoading && (
            <div className="absolute right-3 top-8">
               <svg
                  className="animate-spin h-4 w-4 text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Buscando CEP"
               >
                  <title>Buscando CEP</title>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                     className="opacity-75"
                     fill="currentColor"
                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
               </svg>
            </div>
         )}
      </div>
   );
}
