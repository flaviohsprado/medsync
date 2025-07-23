"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleBadgeVariant, getRoleDisplayName } from "@/lib/utils";
import type { User } from "@/server/auth";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2, UserCheck } from "lucide-react";

export const columns: ColumnDef<User>[] = [
   {
      id: "select",
      header: ({ table }) => (
         <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
         />
      ),
      cell: ({ row }) => (
         <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
            aria-label="Select row"
         />
      ),
      enableSorting: false,
      enableHiding: false,
   },
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
               {user.systemRole === "user" && user.profileId && (
                  <div className="text-xs text-muted-foreground">Perfil: {user.profileId}</div>
               )}
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
         const user = row.original;

         return (
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                     <span className="sr-only">Abrir menu</span>
                     <MoreHorizontal className="h-4 w-4" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>Copiar ID</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                     <Edit className="mr-2 h-4 w-4" />
                     Editar usuário
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                     <UserCheck className="mr-2 h-4 w-4" />
                     Alterar função
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                     <Trash2 className="mr-2 h-4 w-4" />
                     {user.banned ? "Reativar usuário" : "Banir usuário"}
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         );
      },
   },
];
