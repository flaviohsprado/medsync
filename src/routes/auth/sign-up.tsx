import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SignInWithGoogleButton } from "@/components/ui/signin-with-google-button";
import { StepContent, Stepper, StepperControls, type StepperStep } from "@/components/ui/stepper";
import { getPostAuthRedirectPath, signIn, signUp } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth/sign-up")({
   component: RouteComponent,
});

// Step schemas for validation
const personalInfoSchema = z.object({
   name: z.string().min(2, "Name must be at least 2 characters"),
   email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z
   .object({
      password: z
         .string()
         .min(8, "Password must be at least 8 characters")
         .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number",
         ),
      confirmPassword: z.string().min(8, "Please confirm your password"),
   })
   .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
   });

const completeSignUpSchema = personalInfoSchema.merge(passwordSchema);

type PersonalInfoData = z.infer<typeof personalInfoSchema>;
type PasswordData = z.infer<typeof passwordSchema>;
type CompleteSignUpData = z.infer<typeof completeSignUpSchema>;

const SIGNUP_STEPS: StepperStep[] = [
   {
      id: "personal-info",
      title: "Personal Info",
      description: "Basic details",
      icon: User,
   },
   {
      id: "security",
      title: "Security",
      description: "Password setup",
      icon: Lock,
   },
];

enum SignUpStep {
   PersonalInfo = 0,
   Security = 1,
}

function RouteComponent() {
   const [currentStep, setCurrentStep] = useState(SignUpStep.PersonalInfo);
   const [isLoading, setIsLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [formData, setFormData] = useState<Partial<CompleteSignUpData>>({});
   const router = useRouter();

   const personalInfoForm = useForm<PersonalInfoData>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: {
         name: formData.name || "",
         email: formData.email || "",
      },
   });

   const passwordForm = useForm<PasswordData>({
      resolver: zodResolver(passwordSchema),
      defaultValues: {
         password: formData.password || "",
         confirmPassword: formData.confirmPassword || "",
      },
   });

   const handleNext = async () => {
      if (currentStep === SignUpStep.PersonalInfo) {
         const isValid = await personalInfoForm.trigger();
         if (isValid) {
            const values = personalInfoForm.getValues();
            setFormData((prev) => ({ ...prev, ...values }));
            setCurrentStep(SignUpStep.Security);
         }
      } else if (currentStep === SignUpStep.Security) {
         const isValid = await passwordForm.trigger();
         if (isValid) {
            const values = passwordForm.getValues();
            setFormData((prev) => ({ ...prev, ...values }));
            await handleSignUp();
         } else {
            toast.error("Please fill in all fields");
         }
      }
   };

   const handlePrevious = () => {
      if (currentStep === SignUpStep.Security) {
         setCurrentStep(SignUpStep.PersonalInfo);
      }
   };

   const onErrorSignUp = (errors: FieldErrors<PersonalInfoData>) => {
      console.log("errors", errors);
   };

   const handleSignUp = async () => {
      setIsLoading(true);
      try {
         const personalValues = personalInfoForm.getValues();
         const passwordValues = passwordForm.getValues();
         const completeData = { ...personalValues, ...passwordValues };

         const result = await signUp.email({
            name: completeData.name,
            email: completeData.email,
            password: completeData.password,
         });

         if (result.error) {
            toast.error(result.error.message || "Failed to create account. Please try again.");
         } else {
            toast.success(`Welcome to Medsync! Your account has been created successfully.`);
            const redirectPath = await getPostAuthRedirectPath();
            router.navigate({ to: redirectPath });
         }
      } catch (error) {
         toast.error("An unexpected error occurred. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   const handleGoogleSignUp = async () => {
      setIsLoading(true);
      try {
         await signIn.social({ provider: "google" });
      } catch (error) {
         toast.error("Failed to sign up with Google. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   const handleStepClick = (stepIndex: number) => {
      if (stepIndex < currentStep) {
         setCurrentStep(stepIndex);
      }
   };

   return (
      <div className="flex flex-col items-center justify-center h-screen min-w-xl p-4">
         <Card className="border shadow-xl transition-all duration-300 border-muted/50 bg-card backdrop-blur-xl animate-in fade-in-50 slide-in-from-bottom-6 w-full max-w-lg">
            <CardHeader>
               <CardTitle className="text-3xl font-bold tracking-tight text-center">Sign Up</CardTitle>
               <CardDescription className="text-base text-center text-muted-foreground/60">
                  Create your account to get started.
               </CardDescription>

               {/* Stepper */}
               <div className="pt-4">
                  <Stepper
                     steps={SIGNUP_STEPS}
                     currentStep={currentStep}
                     onStepClick={handleStepClick}
                     orientation="horizontal"
                     showProgress={true}
                  />
               </div>
            </CardHeader>

            <CardContent>
               <StepContent isActive={currentStep === SignUpStep.PersonalInfo}>
                  <div className="space-y-4">
                     <SignInWithGoogleButton handleGoogleSignIn={handleGoogleSignUp} />

                     <Separator className="my-4" />

                     <Form {...personalInfoForm}>
                        <div className="space-y-4">
                           <FormField
                              control={personalInfoForm.control}
                              name="name"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                       <Input placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={personalInfoForm.control}
                              name="email"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                       <Input placeholder="Enter your email address" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </div>
                     </Form>
                  </div>
               </StepContent>

               {/* Step 2: Password Setup */}
               <StepContent isActive={currentStep === SignUpStep.Security}>
                  <div className="space-y-4">
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handleNext, onErrorSignUp)} className="space-y-4">
                           <FormField
                              control={passwordForm.control}
                              name="password"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                          <Input
                                             placeholder="Create a strong password"
                                             type={showPassword ? "text" : "password"}
                                             className="pr-10"
                                             {...field}
                                          />
                                          <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             className="absolute right-1 top-1 h-8 w-8 hover:bg-gray-100"
                                             onClick={() => setShowPassword(!showPassword)}
                                          >
                                             {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                             ) : (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                             )}
                                          </Button>
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground">
                                       Must contain 8+ characters with uppercase, lowercase, and number
                                    </p>
                                 </FormItem>
                              )}
                           />

                           <FormField
                              control={passwordForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                 <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                       <div className="relative">
                                          <Input
                                             placeholder="Confirm your password"
                                             type={showConfirmPassword ? "text" : "password"}
                                             className="pr-10"
                                             {...field}
                                          />
                                          <Button
                                             type="button"
                                             variant="ghost"
                                             size="sm"
                                             className="absolute right-1 top-1 h-8 w-8 hover:bg-gray-100"
                                             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                          >
                                             {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-500" />
                                             ) : (
                                                <Eye className="h-4 w-4 text-gray-500" />
                                             )}
                                          </Button>
                                       </div>
                                    </FormControl>
                                    <FormMessage />
                                 </FormItem>
                              )}
                           />
                        </form>
                     </Form>
                  </div>
               </StepContent>

               <div className="pt-4">
                  <StepperControls
                     currentStep={currentStep}
                     totalSteps={2}
                     onNext={handleNext}
                     onPrevious={handlePrevious}
                     onFinish={handleSignUp}
                     isNextDisabled={isLoading}
                     isLoading={isLoading}
                     nextLabel={currentStep === SignUpStep.Security ? "Create Account" : "Continue"}
                  />
               </div>
            </CardContent>

            <CardFooter className="space-y-4 flex flex-col justify-center items-center">
               <p className="text-sm text-center">
                  Already have an account?
                  <Link className="ml-1 underline text-muted-foreground" to="/auth/sign-in">
                     Sign in
                  </Link>
               </p>
            </CardFooter>
         </Card>
      </div>
   );
}
