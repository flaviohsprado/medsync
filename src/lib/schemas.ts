import z from "zod";

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
   email: z.string().email("Email inválido").optional().or(z.literal("")),
   manager: z.string().min(1, "Responsável é obrigatório").optional().or(z.literal("")),
   specialties: z.string().min(1, "Especialidades são obrigatórias"),
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
   systemRole: z.enum(["super_admin", "admin", "user"]),
   profile: z.string().optional(),
});
export type UserFormData = z.infer<typeof UserFormSchema>;

export const updateUserSchema = z.object({
   id: z.string().min(1, "User ID is required"),
   name: z.string().optional(),
   organizationId: z.string().optional(),
   unitId: z.string().optional(),
   systemRole: z.enum(["super_admin", "admin", "user"]).optional(),
   profile: z.string().optional(),
});
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export const assignRoleSchema = z.object({
   userId: z.string().min(1, "User ID is required"),
   systemRole: z.enum(["super_admin", "admin", "user"]),
   organizationId: z.string().optional(),
   unitId: z.string().optional(),
   profile: z.string().optional(),
});
export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;

export const ProfileFormSchema = z.object({
   name: z.string().min(1, "Nome é obrigatório"),
   description: z.string().min(1, "Descrição é obrigatória"),
   organizationId: z.string().min(1, "Organização é obrigatória"),
   permissions: z
      .array(
         z.object({
            resource: z.string().min(1, "Recurso é obrigatório"),
            actions: z.array(z.enum(["create", "read", "update", "delete"])).min(1, "Ações são obrigatórias"),
            scope: z.enum(["organization", "unit", "self"]).optional(),
         }),
      )
      .optional(),
});
export type ProfileFormData = z.infer<typeof ProfileFormSchema>;
