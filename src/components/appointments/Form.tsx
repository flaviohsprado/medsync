import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatTime } from "@/lib/utils";
import type { AppointmentWithDetails, Patient } from "@/types";
import { useState } from "react";

interface AppointmentFormProps {
   isOpen: boolean;
   onClose: () => void;
   selectedDate: Date | null;
   selectedTime?: string;
   appointment?: AppointmentWithDetails;
   onSave: (appointmentData: any) => void;
}

export const mockPatients: Patient[] = [
   {
      id: "1",
      name: "Maria Oliveira",
      email: "maria.oliveira@email.com",
      phone: "(11) 99999-1001",
      dateOfBirth: new Date("1975-06-15"),
      gender: "female",
      cpf: "123.456.789-01",
      address: "Rua das Flores, 123 - São Paulo, SP",
      emergencyContact: "João Oliveira - (11) 99999-1002",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "2",
      name: "José Santos",
      email: "jose.santos@email.com",
      phone: "(11) 99999-1003",
      dateOfBirth: new Date("1960-12-22"),
      gender: "male",
      cpf: "987.654.321-09",
      address: "Av. Paulista, 456 - São Paulo, SP",
      emergencyContact: "Ana Santos - (11) 99999-1004",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
   },
   {
      id: "3",
      name: "Fernanda Lima",
      email: "fernanda.lima@email.com",
      phone: "(11) 99999-1005",
      dateOfBirth: new Date("1988-03-10"),
      gender: "female",
      cpf: "456.789.123-45",
      address: "Rua Augusta, 789 - São Paulo, SP",
      emergencyContact: "Carlos Lima - (11) 99999-1006",
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-03"),
   },
];

export function AppointmentForm({
   isOpen,
   onClose,
   selectedDate,
   selectedTime,
   appointment,
   onSave,
}: AppointmentFormProps) {
   const [formData, setFormData] = useState({
      patientId: appointment?.patientId || "",
      date: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
      time: selectedTime || (appointment ? formatTime(new Date(appointment.dateTime)) : ""),
      duration: appointment?.duration || 30,
      notes: appointment?.notes || "",
      status: appointment?.status || "scheduled",
   });

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const appointmentData = {
         id: appointment?.id || `apt-${Date.now()}`,
         patientId: formData.patientId,
         doctorId: "doc-1", // Mock doctor ID
         dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
         duration: formData.duration,
         notes: formData.notes,
         status: formData.status,
         type: "consultation",
      };

      onSave(appointmentData);
      onClose();
   };

   const handleChange = (field: string, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
   };

   const getFormTitle = () => {
      if (appointment) return "Editar Agendamento";
      return "Novo Agendamento";
   };

   const getFormDescription = () => {
      if (selectedDate) {
         return `${selectedDate.toLocaleDateString("pt-BR")} ${selectedTime ? `às ${selectedTime}` : ""}`;
      }
      return "Preencha os dados do agendamento";
   };

   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>{getFormTitle()}</DialogTitle>
               <DialogDescription>{getFormDescription()}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Select
                     value={formData.patientId}
                     onValueChange={(value) => handleChange("patientId", value)}
                  >
                     <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente" />
                     </SelectTrigger>
                     <SelectContent>
                        {mockPatients.map((patient) => (
                           <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="date">Data</Label>
                     <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="time">Horário</Label>
                     <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                        required
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="duration">Duração (min)</Label>
                     <Select
                        value={formData.duration.toString()}
                        onValueChange={(value) => handleChange("duration", parseInt(value))}
                     >
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="15">15 minutos</SelectItem>
                           <SelectItem value="30">30 minutos</SelectItem>
                           <SelectItem value="45">45 minutos</SelectItem>
                           <SelectItem value="60">60 minutos</SelectItem>
                           <SelectItem value="90">90 minutos</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="status">Status</Label>
                     <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                        <SelectTrigger>
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="scheduled">Agendado</SelectItem>
                           <SelectItem value="confirmed">Confirmado</SelectItem>
                           <SelectItem value="completed">Concluído</SelectItem>
                           <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                     id="notes"
                     placeholder="Observações sobre a consulta..."
                     value={formData.notes}
                     onChange={(e) => handleChange("notes", e.target.value)}
                     rows={3}
                  />
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                     Cancelar
                  </Button>
                  <Button type="submit">{appointment ? "Atualizar" : "Criar"} Agendamento</Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
