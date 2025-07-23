import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, Heart, Shield, UserCheck, Users } from "lucide-react";

export const Route = createFileRoute("/")({
   component: Landing,
});

function Landing() {
   const features = [
      {
         icon: Calendar,
         title: "Smart Scheduling",
         description: "Effortless appointment booking and management for patients and healthcare providers.",
      },
      {
         icon: Users,
         title: "Multi-Role Access",
         description: "Tailored dashboards for admins, doctors, receptionists, and patients.",
      },
      {
         icon: UserCheck,
         title: "Patient Management",
         description: "Comprehensive patient records and health post organization.",
      },
      {
         icon: Shield,
         title: "Secure & Compliant",
         description: "Role-based permissions ensuring data security and privacy.",
      },
      {
         icon: Clock,
         title: "Real-time Updates",
         description: "Instant notifications and schedule synchronization across all users.",
      },
      {
         icon: Heart,
         title: "Healthcare Focused",
         description: "Purpose-built for medical facilities with healthcare-specific workflows.",
      },
   ];

   return (
      <div className="min-h-screen bg-background">
         {/* Header */}
         <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
               <div className="flex items-center space-x-2">
                  <Heart className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold text-foreground">Medsync</span>
               </div>
               <Link to="/auth/sign-in">
                  <Button variant="outline">Sign In</Button>
               </Link>
            </div>
         </header>

         {/* Hero Section */}
         <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/10">
            <div className="container mx-auto px-4 text-center">
               <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  Modern Healthcare
                  <span className="text-primary block">Management Platform</span>
               </h1>
               <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Streamline your clinic operations with our comprehensive management system. Perfect for healthcare
                  facilities of all sizes.
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/auth/sign-in">
                     <Button size="lg" className="w-full sm:w-auto">
                        Get Started
                     </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                     Learn More
                  </Button>
               </div>
            </div>
         </section>

         {/* Features Section */}
         <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                     Everything You Need to Manage Your Clinic
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                     Our platform provides comprehensive tools for efficient healthcare management
                  </p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                     <Card key={`${feature.title}-${index}`} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                           <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                 <feature.icon className="h-6 w-6 text-primary" />
                              </div>
                              <CardTitle className="text-xl">{feature.title}</CardTitle>
                           </div>
                        </CardHeader>
                        <CardContent>
                           <CardDescription className="text-base">{feature.description}</CardDescription>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         </section>

         {/* Roles Section */}
         <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                     Built for Every Healthcare Role
                  </h2>
                  <p className="text-lg text-muted-foreground">Customized experiences for different user types</p>
               </div>

               <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="text-center">
                     <CardHeader>
                        <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle>Administrators</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <CardDescription>Manage organizations, users, and system-wide configurations</CardDescription>
                     </CardContent>
                  </Card>

                  <Card className="text-center">
                     <CardHeader>
                        <Heart className="h-12 w-12 text-doctor mx-auto mb-4" />
                        <CardTitle>Doctors</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <CardDescription>Access schedules, patient records, and appointment management</CardDescription>
                     </CardContent>
                  </Card>

                  <Card className="text-center">
                     <CardHeader>
                        <UserCheck className="h-12 w-12 text-receptionist mx-auto mb-4" />
                        <CardTitle>Receptionists</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <CardDescription>
                           Handle patient registration, appointments, and front desk operations
                        </CardDescription>
                     </CardContent>
                  </Card>

                  <Card className="text-center">
                     <CardHeader>
                        <Users className="h-12 w-12 text-patient mx-auto mb-4" />
                        <CardTitle>Patients</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <CardDescription>
                           Book appointments, view schedules, and manage personal health records
                        </CardDescription>
                     </CardContent>
                  </Card>
               </div>
            </div>
         </section>

         {/* CTA Section */}
         <section className="py-20 bg-primary">
            <div className="container mx-auto px-4 text-center">
               <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
                  Ready to Transform Your Healthcare Practice?
               </h2>
               <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of healthcare providers who trust Medsync for their daily operations.
               </p>
               <Link to="/auth/sign-in">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                     Start Your Journey
                  </Button>
               </Link>
            </div>
         </section>

         {/* Footer */}
         <footer className="py-12 bg-card border-t">
            <div className="container mx-auto px-4 text-center">
               <div className="flex items-center justify-center space-x-2 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold text-foreground">Medsync</span>
               </div>
               <p className="text-muted-foreground">© 2025 Medsync. Built for healthcare excellence.</p>
            </div>
         </footer>
      </div>
   );
}
