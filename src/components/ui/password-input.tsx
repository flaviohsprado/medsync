import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

export function PasswordInput({ ...props }: React.ComponentProps<typeof Input>) {
   const [showPassword, setShowPassword] = useState(false);
   return (
      <div className="relative">
         <Input {...props} type={showPassword ? "text" : "password"} />
         <Button
            variant="ghost"
            className="absolute right-0 top-0 h-full p-2"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            type="button"
         >
            {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
         </Button>
      </div>
   );
}
