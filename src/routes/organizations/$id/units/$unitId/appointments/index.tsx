import { CalendarViews } from "@/components/appointments/CalendarView";
import { usePermissions } from "@/lib/permissions";
import type { Appointment, AppointmentWithDetails, Doctor, OfficeHours, Patient } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const defaultOfficeHours: OfficeHours[] = [
   { dayOfWeek: 1, startTime: "08:00", endTime: "17:00", isActive: true }, // Monday
   { dayOfWeek: 2, startTime: "08:00", endTime: "17:00", isActive: true }, // Tuesday
   { dayOfWeek: 3, startTime: "08:00", endTime: "17:00", isActive: true }, // Wednesday
   { dayOfWeek: 4, startTime: "08:00", endTime: "17:00", isActive: true }, // Thursday
   { dayOfWeek: 5, startTime: "08:00", endTime: "12:00", isActive: true }, // Friday
   { dayOfWeek: 6, startTime: "00:00", endTime: "00:00", isActive: false }, // Saturday
   { dayOfWeek: 0, startTime: "00:00", endTime: "00:00", isActive: false }, // Sunday
];

const mockAppointments: Appointment[] = [
   {
      id: "1",
      patientId: "1",
      doctorId: "1",
      dateTime: new Date("2024-01-15 10:00"),
      duration: 30,
      status: "scheduled",
      notes: "Consulta de rotina - verificar pressão arterial",
      createdBy: "1",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
   },
   {
      id: "2",
      patientId: "2",
      doctorId: "2",
      dateTime: new Date("2024-01-15 14:30"),
      duration: 30,
      status: "confirmed",
      notes: "Avaliação de lesão na pele",
      createdBy: "1",
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-13"),
   },
   {
      id: "3",
      patientId: "3",
      doctorId: "3",
      dateTime: new Date("2024-01-16 09:00"),
      duration: 45,
      status: "scheduled",
      notes: "Dor no joelho após exercício",
      createdBy: "1",
      createdAt: new Date("2024-01-11"),
      updatedAt: new Date("2024-01-11"),
   },
];

const mockPatients: Patient[] = [
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

const mockDoctors: Doctor[] = [
   {
      id: "1",
      name: "Dr. Carlos Santos",
      email: "carlos.santos@clinic.com",
      phone: "(11) 99999-2001",
      specialty: "Cardiologia",
      crm: "CRM/SP 123456",
      officeHours: defaultOfficeHours,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "2",
      name: "Dra. Patricia Rocha",
      email: "patricia.rocha@clinic.com",
      phone: "(11) 99999-2002",
      specialty: "Dermatologia",
      crm: "CRM/SP 234567",
      officeHours: defaultOfficeHours,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
   {
      id: "3",
      name: "Dr. Roberto Silva",
      email: "roberto.silva@clinic.com",
      phone: "(11) 99999-2003",
      specialty: "Ortopedia",
      crm: "CRM/SP 345678",
      officeHours: defaultOfficeHours,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
   },
];

export const Route = createFileRoute("/organizations/$id/units/$unitId/appointments/")({
   component: AppointmentsPage,
});

function AppointmentsPage() {
   const { user } = usePermissions();
   const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
   const [doctorData, setDoctorData] = useState<any>(null);

   useEffect(() => {
      if (user) {
         // Find doctor data
         const doctor = mockDoctors.find((d) => d.email === user.email);
         setDoctorData(doctor);

         if (doctor) {
            const doctorAppointments = mockAppointments
               .filter((apt) => apt.doctorId === doctor.id)
               .map((apt) => {
                  const patient = mockPatients.find((p) => p.id === apt.patientId);
                  return {
                     ...apt,
                     patientName: patient?.name || "Paciente não encontrado",
                     doctorName: doctor.name,
                     doctorSpecialty: doctor.specialty,
                  };
               })
               .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

            setAppointments(doctorAppointments);
         }
      }
   }, [user]);

   const today = new Date();
   const todayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.dateTime);
      return aptDate.toDateString() === today.toDateString();
   });

   return (
      <div className="space-y-6">
         <CalendarViews appointments={appointments} doctorData={doctorData} />
      </div>
   );
}
