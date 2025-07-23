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
import type { Profile } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<Profile>[] = [
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
         const profile = row.original;
         return <div className="font-medium">{profile.name}</div>;
      },
   },
   {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => {
         const description = row.getValue("description") as string;
         return <div className="text-sm text-muted-foreground">{description}</div>;
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
         return (
            <div className="text-sm text-muted-foreground flex items-center w-fit">
               {date.toLocaleDateString("pt-BR")}
            </div>
         );
      },
   },
   {
      id: "actions",
      enableHiding: false,
      cell: () => {
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Editar perfil</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Excluir perfil</DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         );
      },
   },
];
