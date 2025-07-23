"use client";

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
import type { Organization } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const organizationColumns: ColumnDef<Organization>[] = [
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
         return (
            <div className="flex items-center space-x-3">
               <div className="font-medium">{row.getValue("name")}</div>
            </div>
         );
      },
   },
   {
      accessorKey: "email",
      header: ({ column }) => {
         return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
               Email
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
   },
   {
      accessorKey: "metadata.email",
      header: "Email",
      cell: ({ row }) => {
         const email = row.getValue("metadata.email") as string;
         return <div className="lowercase">{email}</div>;
      },
   },
   {
      accessorKey: "metadata.phone",
      header: "Telefone",
      cell: ({ row }) => {
         const phone = row.getValue("metadata.phone") as string;
         return <div className="lowercase">{phone}</div>;
      },
   },
   {
      accessorKey: "metadata.address",
      header: "Endereço",
      cell: ({ row }) => {
         const address = row.getValue("metadata.address") as string;
         return <div className="lowercase">{address}</div>;
      },
   },
   {
      accessorKey: "metadata.cnpj",
      header: "CNPJ",
      cell: ({ row }) => {
         const cnpj = row.getValue("metadata.cnpj") as string;
         return <div className="lowercase">{cnpj}</div>;
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
         return <div>{date.toLocaleDateString("pt-BR")}</div>;
      },
   },
   {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
         const organization = row.original;

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
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(organization.id)}>
                     Copiar ID da organização
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                  <DropdownMenuItem>Editar organização</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Excluir organização</DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         );
      },
   },
];
