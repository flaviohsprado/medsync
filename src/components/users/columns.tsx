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
import { useTRPC } from "@/server/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "../ui/dialog";
import { UserForm } from "./Form";

type UserWithRelations = User & {
   organization?: { name: string };
};
export const userColumns: ColumnDef<UserWithRelations>[] = [
   {
      id: "select",
      header: ({ table }) => (
         <Checkbox
            checked={
               table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
            }
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
            </div>
         );
      },
   },
   {
      accessorKey: "organization.name",
      header: "Organização",
      cell: ({ row }) => {
         const orgName = row.original.organization?.name;
         return orgName ? (
            <div className="text-sm text-wrap line-clamp-1">{orgName}</div>
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
         return (
            <Badge variant={verified ? "default" : "secondary"}>{verified ? "Verificado" : "Pendente"}</Badge>
         );
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
         const trpc = useTRPC();
         const queryClient = useQueryClient();

         const { mutate: deleteUser } = useMutation(
            trpc.user.delete.mutationOptions({
               onSuccess: () => {
                  toast.success("Usuário excluído com sucesso");
                  queryClient.invalidateQueries({
                     queryKey: trpc.user.getAll.queryOptions({
                        organizationId: user.organizationId!,
                        // unitId: user.unitId ?? undefined,
                     }).queryKey,
                  });
               },
            }),
         );

         const [isDeleteOpen, setIsDeleteOpen] = useState(false);
         const [isUpdateOpen, setIsUpdateOpen] = useState(false);

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
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                     Copiar ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                     <DialogTrigger asChild>
                        <DropdownMenuItem
                           onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsUpdateOpen(true);
                           }}
                        >
                           <Edit className="mr-2 h-4 w-4" />
                           Editar usuário
                        </DropdownMenuItem>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                           <DialogTitle>Edtar Usuário</DialogTitle>
                           <DialogDescription>
                              Edite as informações do usuário, incluindo nome, email, função e permissões
                           </DialogDescription>
                        </DialogHeader>
                        <UserForm
                           userId={user.id}
                           organizationId={user.organizationId}
                           unitId={user.unitId ?? undefined}
                           onOpenChange={setIsUpdateOpen}
                        />
                     </DialogContent>
                  </Dialog>

                  <DropdownMenuSeparator />
                  <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                     <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                           className="text-destructive"
                           onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDeleteOpen(true);
                           }}
                        >
                           <Trash2 size={8} color="red" />
                           Excluir usuário
                        </DropdownMenuItem>
                     </AlertDialogTrigger>
                     <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                           <AlertDialogTitle>{`Excluir usuário ${user.name}?`}</AlertDialogTitle>
                           <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Tem certeza de que deseja excluir este usuário?
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                              Cancelar
                           </AlertDialogCancel>
                           <AlertDialogAction
                              onClick={(e) => {
                                 e.stopPropagation();
                                 deleteUser({ id: user.id });
                              }}
                              className="bg-red-500 hover:bg-red-600"
                           >
                              Excluir
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               </DropdownMenuContent>
            </DropdownMenu>
         );
      },
   },
];
