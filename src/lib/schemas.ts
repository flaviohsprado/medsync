import { WeekDays } from "@/types";
import z from "zod";

export const DayOfWeek = z.enum(WeekDays);
const SystemRoles = z.enum(["super_admin", "admin", "user", "doctor"]);

export const WorkScheduleSchema = z.object({
   dayOfWeek: DayOfWeek,
   startTime: z.string().min(1, "Hora de início é obrigatória"),
   endTime: z.string().min(1, "Hora de término é obrigatória"),
   isActive: z.boolean(),
});
export type WorkScheduleFormData = z.infer<typeof WorkScheduleSchema>;

export const SignInFormSchema = z.object({
   email: z.string().email("Please enter a valid email address"),
   password: z.string().min(1, "Password is required"),
});
export type SignInFormData = z.infer<typeof SignInFormSchema>;

export const AddressFormSchema = z.object({
   street: z.string().min(1, "Rua é obrigatória"),
   number: z.string().min(1, "Número é obrigatório"),
   complement: z.string().optional(),
   neighborhood: z.string().min(1, "Bairro é obrigatório"),
   city: z.string().min(1, "Cidade é obrigatória"),
   state: z.string().min(1, "Estado é obrigatório"),
   zipCode: z.string().min(1, "CEP é obrigatório"),
});
export type AddressFormData = z.infer<typeof AddressFormSchema>;

export const OrganizationFormSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório"),
   email: z.string().email("Email inválido"),
   slug: z.string().min(1, "Slug é obrigatório").optional(),
   phone: z.string().min(1, "Telefone é obrigatório"),
   address: AddressFormSchema,
   cnpj: z.string().min(1, "CNPJ é obrigatório"),
   parentId: z.string().optional(),
});
export type OrganizationFormData = z.infer<typeof OrganizationFormSchema>;

export const UnitFormSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório"),
   phone: z.string().min(1, "Telefone é obrigatório"),
   manager: z.string().min(1, "Responsável é obrigatório").optional().or(z.literal("")),
   specialties: z.string().min(1, "Especialidades são obrigatórias").optional().or(z.literal("")),
   address: AddressFormSchema,
   organizationId: z.string(),
});
export type UnitFormData = z.infer<typeof UnitFormSchema>;

export const UserFormSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório"),
   email: z.string().email("Email inválido"),
   password: z.string().min(1, "Senha é obrigatória").optional(),
   organizationId: z.string().min(1, "Organização é obrigatória"),
   unitId: z.string().optional(),
   systemRole: SystemRoles,
   profileId: z.string().optional(),
});
export type UserFormData = z.infer<typeof UserFormSchema>;

export const DoctorFormSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório"),
   email: z.string().email("Email inválido"),
   password: z.string().min(1, "Senha é obrigatória").optional(),
   organizationId: z.string().min(1, "Organização é obrigatória"),
   unitId: z.string().optional(),
   systemRole: SystemRoles,
   profileId: z.string().optional(),
   crm: z.string().min(1, "CRM é obrigatório"),
   specialties: z
      .array(z.string().min(1, "Especialidade é obrigatória"))
      .min(1, "Pelo menos uma especialidade é obrigatória"),
   phone: z.string().min(1, "Telefone é obrigatório"),
   workSchedule: z.array(WorkScheduleSchema).min(1, "Pelo menos um horário de trabalho é obrigatório"),
});
export type DoctorFormData = z.infer<typeof DoctorFormSchema>;

export const ProfileFormSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório"),
   description: z.string().min(1, "Descrição é obrigatória"),
   systemRole: z.enum(["super_admin", "admin", "user"]),
   permissions: z
      .array(
         z.object({
            resource: z.string().min(1, "Recurso é obrigatório"),
            actions: z
               .array(z.enum(["create", "read", "update", "delete", "impersonate"]))
               .min(1, "Ações são obrigatórias"),
            scope: z.enum(["organization", "unit", "self"]).optional(),
         }),
      )
      .optional(),
   organizationId: z.string().min(1, "Organização é obrigatória"),
   unitId: z.string().optional(),
});
export type ProfileFormData = z.infer<typeof ProfileFormSchema>;

export const AppointmentFormSchema = z.object({
   unitId: z.string(),
   doctorId: z.string(),
   date: z.string(),
   time: z.string(),
   duration: z.number(),
   patientName: z.string(),
   patientPhone: z.string(),
   patientSUSCard: z.string(),
   notes: z.string().optional(),
});
export type AppointmentFormData = z.infer<typeof AppointmentFormSchema>;
