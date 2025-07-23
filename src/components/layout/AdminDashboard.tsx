import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Building, TrendingUp, UserCheck, Users } from "lucide-react";

const getStats = (
   totalOrganizations: number,
   totalUsers: number,
   totalDoctors: number,
   totalReceptionists: number,
   totalPatients: number,
) => [
   {
      title: "Total de Organizações",
      value: totalOrganizations,
      description: "Organizações ativas",
      icon: Building,
      trend: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
   },
   {
      title: "Total de Usuários",
      value: totalUsers,
      description: "Usuários no sistema",
      icon: Users,
      trend: "+8%",
      color: "text-green-600",
      bgColor: "bg-green-50",
   },
   {
      title: "Médicos",
      value: totalDoctors,
      description: "Médicos ativos",
      icon: UserCheck,
      trend: "+5%",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
   },
   {
      title: "Taxa de Crescimento",
      value: "15%",
      description: "Crescimento mensal",
      icon: TrendingUp,
      trend: "+3%",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
   },
];

const getRoleLabel = (role: string) => {
   switch (role) {
      case "doctor":
         return "Médico";
      case "receptionist":
         return "Recepcionista";
      case "patient":
         return "Paciente";
      default:
         return role;
   }
};

const getRoleBadgeVariant = (role: string) => {
   switch (role) {
      case "doctor":
         return "default";
      case "receptionist":
         return "secondary";
      case "patient":
         return "outline";
      default:
         return "outline";
   }
};

export const mockOrganizations = [
   {
      id: "1",
      name: "Clínica Médica Central",
      email: "contato@clinicacentral.com.br",
      phone: "(11) 3333-4444",
      address: "Av. Paulista, 1000 - São Paulo, SP",
      cnpj: "12.345.678/0001-90",
      adminId: "1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "2",
      name: "Hospital São Lucas",
      email: "admin@hospitalsaolucas.com.br",
      phone: "(11) 2222-3333",
      address: "Rua da Saúde, 500 - São Paulo, SP",
      cnpj: "98.765.432/0001-10",
      adminId: "1",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
   },
   {
      id: "3",
      name: "Centro Médico da Família",
      email: "contato@centromedfamilia.com.br",
      phone: "(11) 4444-5555",
      address: "Rua das Palmeiras, 300 - São Paulo, SP",
      cnpj: "45.678.901/0001-23",
      adminId: "1",
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
   },
];

export const mockUsers = [
   {
      id: "2",
      name: "Ana Silva",
      email: "receptionist@clinic.com",
      role: "receptionist",
      phone: "(11) 99999-0001",
      organizationId: "1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "3",
      name: "Dr. Carlos Santos",
      email: "doctor@clinic.com",
      role: "doctor",
      phone: "(11) 99999-0002",
      organizationId: "1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "4",
      name: "Maria Oliveira",
      email: "patient@email.com",
      role: "patient",
      phone: "(11) 99999-0003",
      organizationId: "1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "5",
      name: "João Fernandes",
      email: "joao.recep@hospitalsaolucas.com",
      role: "receptionist",
      phone: "(11) 99999-0005",
      organizationId: "2",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
   },
   {
      id: "6",
      name: "Dra. Paula Costa",
      email: "paula.costa@hospitalsaolucas.com",
      role: "doctor",
      phone: "(11) 99999-0006",
      organizationId: "2",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
   },
];

export function AdminDashboard() {
   const totalOrganizations = mockOrganizations.length;
   const totalUsers = mockUsers.length;
   const totalDoctors = mockUsers.filter((user) => user.role === "doctor").length;
   const totalReceptionists = mockUsers.filter((user) => user.role === "receptionist").length;
   const totalPatients = mockUsers.filter((user) => user.role === "patient").length;

   const recentOrganizations = mockOrganizations.slice(0, 3);
   const recentUsers = mockUsers.slice(0, 5);

   const stats = getStats(totalOrganizations, totalUsers, totalDoctors, totalReceptionists, totalPatients);

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="space-y-2">
            <h1 className="text-2xl font-bold">Dashboard do Administrador</h1>
            <p className="text-muted-foreground">Visão geral do sistema de gestão médica</p>
         </div>

         {/* Stats Grid */}
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
               <Card key={`${stat.title}-${index}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                     <div className={`h-8 w-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                     </div>
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{stat.value}</div>
                     <p className="text-xs text-muted-foreground">{stat.description}</p>
                     <div className="flex items-center pt-1">
                        <span className="text-xs text-green-600">{stat.trend}</span>
                        <span className="text-xs text-muted-foreground ml-1">vs. mês anterior</span>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Organizations */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Building className="h-5 w-5" />
                     Organizações Recentes
                  </CardTitle>
                  <CardDescription>Últimas organizações criadas</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  {recentOrganizations.map((org) => (
                     <div key={org.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                              <p className="font-medium">{org.name}</p>
                              <p className="text-sm text-muted-foreground">{org.email}</p>
                           </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                           {mockUsers.filter((u) => u.organizationId === org.id).length} usuários
                        </Badge>
                     </div>
                  ))}
                  <Button variant="outline" className="w-full">
                     Ver Todas as Organizações
                  </Button>
               </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Users className="h-5 w-5" />
                     Usuários Recentes
                  </CardTitle>
                  <CardDescription>Últimos usuários criados no sistema</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  {recentUsers.map((user) => (
                     <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                           </div>
                           <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                           </div>
                        </div>
                        <Badge variant={getRoleBadgeVariant(user.role) as any} className="text-xs">
                           {getRoleLabel(user.role)}
                        </Badge>
                     </div>
                  ))}
                  <Button variant="outline" className="w-full">
                     Ver Todos os Usuários
                  </Button>
               </CardContent>
            </Card>
         </div>

         {/* User Distribution */}
         <Card>
            <CardHeader>
               <CardTitle>Distribuição de Usuários</CardTitle>
               <CardDescription>Breakdown por tipo de usuário no sistema</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                     <div className="flex items-center gap-3">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                        <div>
                           <p className="font-medium">Médicos</p>
                           <p className="text-sm text-muted-foreground">Profissionais médicos</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-bold">{totalDoctors}</p>
                        <p className="text-xs text-muted-foreground">
                           {((totalDoctors / totalUsers) * 100).toFixed(1)}%
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                     <div className="flex items-center gap-3">
                        <Users className="h-8 w-8 text-green-600" />
                        <div>
                           <p className="font-medium">Recepcionistas</p>
                           <p className="text-sm text-muted-foreground">Equipe de recepção</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-bold">{totalReceptionists}</p>
                        <p className="text-xs text-muted-foreground">
                           {((totalReceptionists / totalUsers) * 100).toFixed(1)}%
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                     <div className="flex items-center gap-3">
                        <Activity className="h-8 w-8 text-purple-600" />
                        <div>
                           <p className="font-medium">Pacientes</p>
                           <p className="text-sm text-muted-foreground">Pacientes cadastrados</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-2xl font-bold">{totalPatients}</p>
                        <p className="text-xs text-muted-foreground">
                           {((totalPatients / totalUsers) * 100).toFixed(1)}%
                        </p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
