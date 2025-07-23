import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import { usePermissions } from "@/lib/route-protection";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Building, LogOut, Menu, Shield, User, Users } from "lucide-react";
import { ThemeToggler } from "../ui/theme-provider";

interface HeaderProps {
   onMenuClick?: () => void;
   showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = true }: HeaderProps) {
   const { data: session } = useSession();
   const { user, isSuperAdmin, isAdmin, isUser } = usePermissions();
   const navigate = useNavigate();

   const handleSignOut = () => {
      signOut();
      navigate({ to: "/auth/sign-in" });
   };

   const getRoleDisplayName = () => {
      if (isSuperAdmin) return "Super Admin";
      if (isAdmin) return "Administrador";
      if (isUser) {
         const profile = user?.profileId;
         // For now, just show the profile name or "Usuário" if no profile
         // In a real implementation, you could fetch the profile name from the database
         if (profile) return `Usuário (${profile})`;
         return "Usuário";
      }
      return "Usuário";
   };

   const getRoleBadgeVariant = () => {
      if (isSuperAdmin) return "destructive"; // Red for super admin
      if (isAdmin) return "default"; // Blue for admin
      return "secondary"; // Gray for regular users
   };

   const getRoleIcon = () => {
      if (isSuperAdmin) return <Shield className="h-3 w-3" />;
      if (isAdmin) return <Building className="h-3 w-3" />;
      return <Users className="h-3 w-3" />;
   };

   return (
      <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-6">
         <div className="flex items-center gap-4">
            {showMenuButton && (
               <Button variant="ghost" size="sm" onClick={onMenuClick} className="md:hidden">
                  <Menu className="h-5 w-5" />
               </Button>
            )}
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">M</span>
               </div>
               <div>
                  <h1 className="font-semibold text-lg">MedSystem</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Sistema de Gestão Médica</p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            {/* Role Indicator for Mobile */}
            <div className="sm:hidden">
               <Badge variant={getRoleBadgeVariant()} className="flex items-center gap-1 text-xs">
                  {getRoleIcon()}
                  {isSuperAdmin ? "SA" : isAdmin ? "ADM" : "USR"}
               </Badge>
            </div>

            <ThemeToggler />
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
               <Bell className="h-5 w-5" />
               <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  3
               </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                     <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                     </div>
                     <div className="text-left hidden sm:block">
                        <p className="text-sm font-medium">{session?.user?.name}</p>
                        <Badge variant={getRoleBadgeVariant()} className="text-xs flex items-center gap-1">
                           {getRoleIcon()}
                           {getRoleDisplayName()}
                        </Badge>
                     </div>
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                     <div className="flex items-center justify-between">
                        <span>Minha Conta</span>
                        <Badge variant={getRoleBadgeVariant()} className="text-xs flex items-center gap-1">
                           {getRoleIcon()}
                        </Badge>
                     </div>
                     <div className="text-xs text-muted-foreground font-normal mt-1">
                        {getRoleDisplayName()}
                        {user?.organizationId && <div className="mt-1">Org: {user.organizationId.slice(0, 8)}...</div>}
                     </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                     <User className="mr-2 h-4 w-4" />
                     Perfil
                  </DropdownMenuItem>

                  {/* Show admin options */}
                  {(isSuperAdmin || isAdmin) && (
                     <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                           <Shield className="mr-2 h-4 w-4" />
                           Configurações
                        </DropdownMenuItem>
                        {isSuperAdmin && (
                           <DropdownMenuItem>
                              <Building className="mr-2 h-4 w-4" />
                              Organizações
                           </DropdownMenuItem>
                        )}
                     </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                     <LogOut className="mr-2 h-4 w-4" />
                     Sair
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </header>
   );
}
