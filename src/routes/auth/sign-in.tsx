import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { SignInWithGoogleButton } from "@/components/ui/signin-with-google-button";
import { getPostAuthRedirectPath, signIn } from "@/lib/auth-client";
import { SignInFormSchema, type SignInFormData } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/sign-in")({
   component: RouteComponent,
});

function RouteComponent() {
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter();

   const form = useForm<SignInFormData>({
      resolver: zodResolver(SignInFormSchema),
      defaultValues: {
         email: "",
         password: "",
      },
   });

   const onSubmit = async (data: SignInFormData) => {
      setIsLoading(true);
      try {
         const result = await signIn.email({
            email: data.email,
            password: data.password,
         });

         if (result.error) {
            toast.error(result.error.message || "Invalid email or password. Please try again.");
         } else {
            toast.success(`Welcome back to Medsync!`);
            const redirectPath = await getPostAuthRedirectPath();
            router.navigate({ to: redirectPath });
         }
      } catch (error) {
         toast.error("An unexpected error occurred. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   const handleGoogleSignIn = async () => {
      setIsLoading(true);
      try {
         await signIn.social({ provider: "google" });
      } catch (error) {
         toast.error("Failed to sign in with Google. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="flex flex-col items-center justify-center h-screen min-w-xl">
         <Card className="border shadow-xl transition-all duration-300 border-muted/50 bg-card backdrop-blur-xl animate-in fade-in-50 slide-in-from-bottom-6 w-full max-w-lg">
            <CardHeader>
               <CardTitle className="text-3xl font-bold tracking-tight text-center ">Sign In</CardTitle>
               <CardDescription className="text-base text-center text-muted-foreground/60">
                  Enter your details to access your account.
               </CardDescription>
            </CardHeader>
            <CardContent>
               <SignInWithGoogleButton handleGoogleSignIn={handleGoogleSignIn} />
               <Separator className="my-4" />
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                     <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                 <Input {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                 <PasswordInput {...field} />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                     <Button
                        className="w-full shadow-lg transition-all duration-300 group bg-primary shadow-primary/20 hover:bg-primary/90 flex gap-2 items-center justify-center text-white"
                        disabled={!form.formState.isValid || isLoading}
                        type="submit"
                        variant="default"
                     >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                     </Button>
                  </form>
               </Form>
            </CardContent>
            <CardFooter className="space-y-4 flex flex-col justify-center items-center">
               <Link className="text-sm block underline text-muted-foreground text-center" to="/auth/forgot-password">
                  Forgot your password
               </Link>
               <p className="text-sm text-center">
                  Don't have an account?
                  <Link className="ml-1 underline text-muted-foreground" to="/auth/sign-up">
                     Create account
                  </Link>
               </p>
            </CardFooter>
         </Card>
      </div>
   );
}
