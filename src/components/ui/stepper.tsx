import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

export interface StepperStep {
   id: string;
   title: string;
   description?: string;
   icon?: React.ComponentType<{ className?: string }>;
   isComplete?: boolean;
   isActive?: boolean;
   isDisabled?: boolean;
}

export interface StepperProps {
   steps: StepperStep[];
   currentStep: number;
   onStepClick?: (stepIndex: number) => void;
   className?: string;
   orientation?: "horizontal" | "vertical";
   showProgress?: boolean;
}

export function Stepper({
   steps,
   currentStep,
   onStepClick,
   className,
   orientation = "horizontal",
   showProgress = true,
}: StepperProps) {
   const progressPercentage = ((currentStep + 1) / steps.length) * 100;

   if (orientation === "vertical") {
      return (
         <div className={cn("space-y-4", className)}>
            {showProgress && (
               <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                     <span>Progress</span>
                     <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                     />
                  </div>
               </div>
            )}
            {steps.map((step, index) => {
               const isActive = index === currentStep;
               const isComplete = index < currentStep;
               const isClickable = onStepClick && !step.isDisabled;

               return (
                  <button
                     type="button"
                     key={step.id}
                     className={cn(
                        "flex items-start space-x-4 p-4 rounded-lg transition-all duration-200 w-full text-left",
                        isActive && "bg-blue-50 border border-blue-200",
                        isClickable && "cursor-pointer hover:bg-gray-50",
                        step.isDisabled && "opacity-50 cursor-not-allowed",
                        !isClickable && "cursor-default",
                     )}
                     onClick={() => isClickable && onStepClick(index)}
                     disabled={!isClickable}
                  >
                     <div
                        className={cn(
                           "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200",
                           isComplete && "bg-blue-600 border-blue-600 text-white",
                           isActive && "border-blue-600 text-blue-600 bg-white",
                           !isActive && !isComplete && "border-gray-300 text-gray-400",
                        )}
                     >
                        {isComplete ? (
                           <Check className="w-4 h-4" />
                        ) : step.icon ? (
                           <step.icon className="w-4 h-4" />
                        ) : (
                           <span className="text-sm font-medium">{index + 1}</span>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3
                           className={cn(
                              "font-medium",
                              isActive && "text-blue-900",
                              isComplete && "text-gray-900",
                              !isActive && !isComplete && "text-gray-500",
                           )}
                        >
                           {step.title}
                        </h3>
                        {step.description && <p className="text-sm text-gray-500 mt-1">{step.description}</p>}
                     </div>
                  </button>
               );
            })}
         </div>
      );
   }

   return (
      <div className={cn("w-full", className)}>
         {showProgress && (
            <div className="mb-8">
               <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>
                     Step {currentStep + 1} of {steps.length}
                  </span>
                  <span>{Math.round(progressPercentage)}% Complete</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                     className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500 ease-out"
                     style={{ width: `${progressPercentage}%` }}
                  />
               </div>
            </div>
         )}
      </div>
   );
}

export interface StepContentProps {
   children: ReactNode;
   isActive: boolean;
   className?: string;
}

export function StepContent({ children, isActive, className }: StepContentProps) {
   if (!isActive) return null;

   return <div className={cn("animate-in fade-in-50 slide-in-from-right-4 duration-300", className)}>{children}</div>;
}

// Navigation Controls
export interface StepperControlsProps {
   currentStep: number;
   totalSteps: number;
   onNext?: () => void;
   onPrevious?: () => void;
   onFinish?: () => void;
   isNextDisabled?: boolean;
   isPreviousDisabled?: boolean;
   isLoading?: boolean;
   nextLabel?: string;
   previousLabel?: string;
   finishLabel?: string;
   className?: string;
}

export function StepperControls({
   currentStep,
   totalSteps,
   onNext,
   onPrevious,
   onFinish,
   isNextDisabled = false,
   isPreviousDisabled = false,
   isLoading = false,
   nextLabel = "Next",
   previousLabel = "Previous",
   finishLabel = "Finish",
   className,
}: StepperControlsProps) {
   const isLastStep = currentStep === totalSteps - 1;
   const isFirstStep = currentStep === 0;

   return (
      <div className={cn("flex items-center justify-between pt-6", className)}>
         <Button
            variant="ghost"
            type="button"
            onClick={onPrevious}
            disabled={isFirstStep || isPreviousDisabled || isLoading}
            className={cn(
               "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg",
               "hover:bg-gray-50 hover:border-gray-400 transition-all duration-200",
               "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300",
               isFirstStep && "invisible",
            )}
         >
            {previousLabel}
         </Button>

         <div className="flex space-x-3">
            {isLastStep ? (
               <Button
                  variant="default"
                  type="submit"
                  onClick={onFinish}
                  disabled={isLoading}
                  className="w-full shadow-lg transition-all duration-300 group bg-primary shadow-primary/20 hover:bg-primary/90 flex gap-2 items-center justify-center text-white cursor-pointer"
               >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : finishLabel}
               </Button>
            ) : (
               <Button
                  type="button"
                  onClick={onNext}
                  disabled={isNextDisabled || isLoading}
                  className="w-full shadow-lg transition-all duration-300 group bg-primary shadow-primary/20 hover:bg-primary/90 flex gap-2 items-center justify-center text-white cursor-pointer"
               >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : nextLabel}
               </Button>
            )}
         </div>
      </div>
   );
}
