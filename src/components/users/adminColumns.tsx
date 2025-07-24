import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { usePermissions } from "@/lib/permissions";
import { getRoleBadgeVariant, getRoleDisplayName } from "@/lib/utils";
import type { User } from "@/server/auth";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

export const userAdminColumns: ColumnDef<User>[] = [
   {
      accessorKey: "name",
      header: ({ column }) => {
         return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
               Nome
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         );
      },
      cell: ({ row }) => {
         const user = row.original;
         return (
            <div className="flex flex-col">
               <div className="font-medium">{user.name}</div>
               <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
         );
      },
   },
   {
      accessorKey: "systemRole",
      header: "Função",
      cell: ({ row }) => {
         const user = row.original;
         const systemRole = user.systemRole || "user";
         return (
            <div className="flex flex-col gap-1">
               <Badge variant={getRoleBadgeVariant(systemRole)}>{getRoleDisplayName(systemRole)}</Badge>
            </div>
         );
      },
   },
   {
      accessorKey: "organizationId",
      header: "Organização",
      cell: ({ row }) => {
         const orgId = row.getValue("organizationId") as string;
         return orgId ? (
            <div className="text-sm">{orgId}</div>
         ) : (
            <div className="text-sm text-muted-foreground">Todas</div>
         );
      },
   },
   {
      accessorKey: "emailVerified",
      header: "Email Verificado",
      cell: ({ row }) => {
         const verified = row.getValue("emailVerified") as boolean;
         return <Badge variant={verified ? "default" : "secondary"}>{verified ? "Verificado" : "Pendente"}</Badge>;
      },
   },
   {
      accessorKey: "banned",
      header: "Status",
      cell: ({ row }) => {
         const banned = row.original.banned;
         return <Badge variant={banned ? "destructive" : "default"}>{banned ? "Banido" : "Ativo"}</Badge>;
      },
   },
   {
      accessorKey: "createdAt",
      header: ({ column }) => {
         return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
               Criado em
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         );
      },
      cell: ({ row }) => {
         const date = new Date(row.getValue("createdAt"));
         return <div className="text-sm text-muted-foreground">{date.toLocaleDateString("pt-BR")}</div>;
      },
   },
   {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
         const { isAdmin, isSuperAdmin } = usePermissions();
         const user = row.original;
         const navigate = useNavigate();

         const handleImpersonateUser = async () => {
            const { data, error } = await authClient.admin.impersonateUser({
               userId: user.id,
            });

            if (error) {
               throw new Error(error.message);
            }

            await authClient.multiSession.setActive({
               sessionToken: data.session.token,
            });

            navigate({ to: "/dashboard" });
         };

         return (
            (isAdmin || isSuperAdmin) && (
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={async (e) => {
                     e.stopPropagation();
                     try {
                        await handleImpersonateUser();
                        toast.success(`Impersonating user ${user.name}`);
                     } catch (error) {
                        console.error("Error impersonating user:", error);
                        toast.error("Failed to impersonate user");
                     }
                  }}
               >
                  <ArrowRight className="h-4 w-4" />
               </Button>
            )
         );
      },
   },
];
