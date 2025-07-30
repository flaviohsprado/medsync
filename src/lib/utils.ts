import type { Permission, SystemRole } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function getRoleBadgeVariant(role: SystemRole): "destructive" | "default" | "secondary" | "outline" {
   switch (role) {
      case "super_admin":
         return "destructive"; // Red for super admin
      case "admin":
         return "default"; // Blue for admin
      case "user":
         return "secondary"; // Gray for regular users
      case "doctor":
         return "secondary";
      default:
         return "outline";
   }
}

export function getRoleDisplayName(role: SystemRole) {
   switch (role) {
      case "super_admin":
         return "Super Admin";
      case "admin":
         return "Administrador";
      case "user":
         return "Usuário";
      case "doctor":
         return "Médico";
      default:
         return role;
   }
}

export const validateCPF = (cpf: string): boolean => {
   const numbers = cpf.replace(/\D/g, "");

   if (numbers.length !== 11) return false;

   // Check for known invalid CPFs
   if (/^(\d)\1{10}$/.test(numbers)) return false;

   // Validate first check digit
   let sum = 0;
   for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
   }
   let remainder = sum % 11;
   const digit1 = remainder < 2 ? 0 : 11 - remainder;

   if (parseInt(numbers[9]) !== digit1) return false;

   // Validate second check digit
   sum = 0;
   for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
   }
   remainder = sum % 11;
   const digit2 = remainder < 2 ? 0 : 11 - remainder;

   return parseInt(numbers[10]) === digit2;
};

export const formatDate = (date: Date): string => {
   return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
   }).format(date);
};

export const formatDateTime = (date: Date): string => {
   return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   }).format(date);
};

export const formatTime = (date: Date): string => {
   return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
   }).format(date);
};

export const formatCNPJ = (cnpj: string): string => {
   const cleaned = cnpj.replace(/\D/g, "");
   if (cleaned.length <= 14) {
      return cleaned
         .replace(/(\d{2})(\d)/, "$1.$2")
         .replace(/(\d{3})(\d)/, "$1.$2")
         .replace(/(\d{3})(\d)/, "$1/$2")
         .replace(/(\d{4})(\d{1,2})/, "$1-$2")
         .replace(/(-\d{2})\d+?$/, "$1");
   }
   return cnpj;
};

export const formatCEP = (value: string): string => {
   const digitsOnly = value.replace(/\D/g, "");
   if (digitsOnly.length <= 5) {
      return digitsOnly;
   }
   return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 8)}`;
};

export const formatCPF = (value: string): string => {
   const digitsOnly = value.replace(/\D/g, "");
   if (digitsOnly.length <= 3) return digitsOnly;
   if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3)}`;
   if (digitsOnly.length <= 9)
      return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6)}`;
   return `${digitsOnly.slice(0, 3)}.${digitsOnly.slice(3, 6)}.${digitsOnly.slice(6, 9)}-${digitsOnly.slice(9, 11)}`;
};

export const formatPhone = (value: string): string => {
   const digitsOnly = value.replace(/\D/g, "");
   if (digitsOnly.length <= 2) return `(${digitsOnly}`;
   if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`;
   if (digitsOnly.length <= 10)
      return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`;
   return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7, 11)}`;
};

export const removeMask = (value: string): string => {
   return value.replace(/\D/g, "");
};

// CEP API types
export interface CEPResponse {
   cep: string;
   state: string;
   city: string;
   neighborhood: string;
   street: string;
   service: string;
   location: {
      type: string;
      coordinates: {
         longitude: string;
         latitude: string;
      };
   };
}

export const fetchCEPData = async (cep: string): Promise<CEPResponse | null> => {
   try {
      const cleanCEP = removeMask(cep);
      if (cleanCEP.length !== 8) return null;

      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCEP}`);
      if (!response.ok) return null;

      const data = await response.json();
      return data;
   } catch (error) {
      console.error("Error fetching CEP data:", error);
      return null;
   }
};

export function getResourceDisplayInfo(resource: string) {
   const resourceMap: Record<string, { title: string; description: string }> = {
      dashboard: { title: "Dashboard", description: "Acesso ao painel principal" },
      organization: { title: "Organizações", description: "Gerenciar organizações" },
      user: { title: "Usuários", description: "Gerenciar usuários do sistema" },
      unit: { title: "Unidades", description: "Gerenciar unidades de saúde" },
      role: { title: "Perfis", description: "Gerenciar perfis e permissões" },
      patient: { title: "Pacientes", description: "Gerenciar cadastro de pacientes" },
      appointment: { title: "Consultas", description: "Gerenciar agendamentos" },
      schedule: { title: "Agenda", description: "Visualizar e gerenciar agenda" },
      prescription: { title: "Prescrições", description: "Gerenciar prescrições médicas" },
      doctor: { title: "Médicos", description: "Gerenciar cadastro de médicos" },
   };

   return resourceMap[resource] || { title: resource, description: `Gerenciar ${resource}` };
}

export function groupPermissionsByResource(permissions: Permission[]): Record<string, Permission> {
   const grouped: Record<string, Permission> = {};

   permissions.forEach((permission) => {
      const resource = permission.resource;
      if (!grouped[resource]) {
         grouped[resource] = {
            resource,
            actions: [],
            scope: permission.scope,
         };
      }
      // Merge actions from all permissions for this resource
      const existingActions = new Set(grouped[resource].actions);
      permission.actions.forEach((action) => existingActions.add(action));
      grouped[resource].actions = Array.from(existingActions);
   });

   return grouped;
}
