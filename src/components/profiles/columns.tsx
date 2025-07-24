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
import { useTRPC } from "@/server/react";
import type { Profile } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react";
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

export const profileColumns: ColumnDef<Profile>[] = [
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
      cell: ({ row }) => {
         const profile = row.original;
         const trpc = useTRPC();
         const queryClient = useQueryClient();

         const { mutate: deleteProfile } = useMutation(
            trpc.profile.delete.mutationOptions({
               onSuccess: () => {
                  toast.success("Perfil excluído com sucesso");
                  queryClient.invalidateQueries({
                     queryKey: trpc.profile.getAll.queryOptions().queryKey,
                  });
               },
            }),
         );

         const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
                           Excluir perfil
                        </DropdownMenuItem>
                     </AlertDialogTrigger>
                     <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                           <AlertDialogTitle>{`Excluir usuário ${profile.name}?`}</AlertDialogTitle>
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
                                 deleteProfile({ id: profile.id });
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
