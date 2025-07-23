import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
   size?: number;
   className?: string;
   variant?: "default" | "secondary";
   text?: string;
}

const LoaderComponent = ({ size = 24, className, variant = "default", text, ...props }: LoaderProps) => {
   return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
         <Card className={cn("w-fit", className)} {...props}>
            <CardContent className="flex flex-col items-center gap-4 p-6">
               <div className="animate-in fade-in-50">
                  <svg
                     className={cn("animate-spin", variant === "default" ? "text-primary" : "text-muted-foreground")}
                     width={size}
                     height={size}
                     viewBox="0 0 24 24"
                     xmlns="http://www.w3.org/2000/svg"
                     aria-label="Loading"
                     role="img"
                  >
                     <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                     />
                     <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                     ></path>
                  </svg>
               </div>
               {text && (
                  <p
                     className={cn(
                        "text-sm text-center",
                        variant === "default" ? "text-primary" : "text-muted-foreground",
                     )}
                  >
                     {text}
                  </p>
               )}
            </CardContent>
         </Card>
      </div>
   );
};

export { LoaderComponent as Loader };
