import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatTime } from "@/lib/utils";
import type { AppointmentWithDetails } from "@/types";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppointmentForm } from "./Form";

interface CalendarViewsProps {
   appointments: AppointmentWithDetails[];
   doctorData: any;
}

export function CalendarViews({ appointments, doctorData }: CalendarViewsProps) {
   const [currentDate, setCurrentDate] = useState(new Date());
   const [view, setView] = useState<"day" | "week" | "month">("week");
   const [isFormOpen, setIsFormOpen] = useState(false);
   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
   const [selectedTime, setSelectedTime] = useState<string>("");
   const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | undefined>();

   const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
   ];

   const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
   const weekDaysFull = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

   const navigateDate = (direction: "prev" | "next") => {
      const newDate = new Date(currentDate);
      if (view === "day") {
         newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
      } else if (view === "week") {
         newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      } else {
         newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      }
      setCurrentDate(newDate);
   };

   const getFormattedDateTitle = () => {
      if (view === "day") {
         return `${currentDate.getDate()} de ${months[currentDate.getMonth()].toLowerCase()} de ${currentDate.getFullYear()}`;
      } else if (view === "week") {
         return `${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
      } else {
         return `${months[currentDate.getMonth()]}, ${currentDate.getFullYear()}`;
      }
   };

   const getAppointmentsForDate = (date: Date) => {
      return appointments.filter((apt) => {
         const aptDate = new Date(apt.dateTime);
         return aptDate.toDateString() === date.toDateString();
      });
   };

   const getWeekDates = () => {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
         const date = new Date(startOfWeek);
         date.setDate(date.getDate() + i);
         weekDates.push(date);
      }
      return weekDates;
   };

   const getMonthCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const calendar = [];
      const current = new Date(startDate);

      for (let week = 0; week < 6; week++) {
         const weekDates = [];
         for (let day = 0; day < 7; day++) {
            weekDates.push(new Date(current));
            current.setDate(current.getDate() + 1);
         }
         calendar.push(weekDates);
      }
      return calendar;
   };

   const timeSlots = Array.from({ length: 12 }, (_, i) => 11 + i); // 11:00 to 22:00

   const handleTimeSlotClick = (date: Date, hour: number) => {
      setSelectedDate(date);
      setSelectedTime(`${hour.toString().padStart(2, "0")}:00`);
      setSelectedAppointment(undefined);
      setIsFormOpen(true);
   };

   const handleDayClick = (date: Date) => {
      setSelectedDate(date);
      setSelectedTime("09:00");
      setSelectedAppointment(undefined);
      setIsFormOpen(true);
   };

   const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
      setSelectedDate(new Date(appointment.dateTime));
      setSelectedTime(formatTime(new Date(appointment.dateTime)));
      setSelectedAppointment(appointment);
      setIsFormOpen(true);
   };

   const handleSaveAppointment = (appointmentData: any) => {
      if (selectedAppointment) {
         toast.info("Agendamento atualizado com sucesso.");
      } else {
         toast.success("Novo agendamento criado com sucesso.");
      }
   };

   const handleNewAppointment = () => {
      setSelectedDate(new Date());
      setSelectedTime("09:00");
      setSelectedAppointment(undefined);
      setIsFormOpen(true);
   };

   return (
      <div className="space-y-6">
         {/* Header with Navigation */}
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateDate("prev")}>
                     <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-2xl font-semibold min-w-[200px] text-center">
                     {getFormattedDateTitle()}
                  </h1>
                  <Button variant="outline" size="sm" onClick={() => navigateDate("next")}>
                     <ChevronRight className="h-4 w-4" />
                  </Button>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <Select value="all">
                  <SelectTrigger className="w-[180px]">
                     <Filter className="h-4 w-4 mr-2" />
                     <SelectValue placeholder="Filtrar por médico" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="all">Todos os médicos</SelectItem>
                     {doctorData && <SelectItem value={doctorData.id}>{doctorData.name}</SelectItem>}
                  </SelectContent>
               </Select>

               <div className="flex items-center border rounded-lg">
                  <Button
                     variant={view === "day" ? "default" : "ghost"}
                     size="sm"
                     onClick={() => setView("day")}
                     className="rounded-r-none"
                  >
                     Dia
                  </Button>
                  <Button
                     variant={view === "week" ? "default" : "ghost"}
                     size="sm"
                     onClick={() => setView("week")}
                     className="rounded-none"
                  >
                     Semana
                  </Button>
                  <Button
                     variant={view === "month" ? "default" : "ghost"}
                     size="sm"
                     onClick={() => setView("month")}
                     className="rounded-l-none"
                  >
                     Mês
                  </Button>
               </div>

               <Button onClick={handleNewAppointment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo agendamento
               </Button>
            </div>
         </div>

         {/* Calendar Content */}
         <Card>
            <CardContent className="p-6">
               <div className="flex items-center gap-2 mb-6">
                  <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                     <span className="text-xs text-primary-foreground">📅</span>
                  </div>
                  <h2 className="text-xl font-semibold">Calendário de apontamentos</h2>
                  <span className="text-muted-foreground">
                     - Visualizando apontamentos{" "}
                     {view === "day" ? "do dia" : view === "week" ? "da semana" : "do mês"} de{" "}
                     {getFormattedDateTitle()}
                  </span>
               </div>

               {/* Day View */}
               {view === "day" && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-4">
                        {getAppointmentsForDate(currentDate).map((appointment) => (
                           <Card key={appointment.id} className="bg-primary/10 border-primary/20">
                              <CardContent className="p-4">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <h3 className="font-semibold">{appointment.patientName}</h3>
                                       <p className="text-sm text-muted-foreground">Consulta</p>
                                       <p className="text-sm">
                                          {formatTime(new Date(appointment.dateTime))} -
                                          {formatTime(
                                             new Date(
                                                new Date(appointment.dateTime).getTime() +
                                                   appointment.duration * 60000,
                                             ),
                                          )}
                                       </p>
                                    </div>
                                    <Badge variant="default">Confirmado</Badge>
                                 </div>
                              </CardContent>
                           </Card>
                        ))}
                        {getAppointmentsForDate(currentDate).length === 0 && (
                           <div className="text-center py-8 text-muted-foreground">
                              Nenhum agendamento para hoje
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Week View */}
               {view === "week" && (
                  <div className="overflow-x-auto">
                     <div className="min-w-[800px]">
                        <div className="grid grid-cols-8 gap-px bg-border">
                           <div className="bg-background p-2 text-sm font-medium">Horário</div>
                           {getWeekDates().map((date, index) => (
                              <div key={`${date}-${Date.now()}`} className="bg-background p-2 text-center">
                                 <div className="text-sm font-medium">{weekDays[index]}</div>
                                 <div className="text-lg font-bold">{date.getDate()}</div>
                              </div>
                           ))}
                        </div>

                        {timeSlots.map((hour) => (
                           <div key={hour} className="grid grid-cols-8 gap-px bg-border min-h-[60px]">
                              <div className="bg-background p-2 text-sm text-muted-foreground">{hour}:00</div>
                              {getWeekDates().map((date, dayIndex) => {
                                 const dayAppointments = getAppointmentsForDate(date).filter((apt) => {
                                    const aptHour = new Date(apt.dateTime).getHours();
                                    return aptHour === hour;
                                 });

                                 return (
                                    <div
                                       key={`${date}-${dayIndex}-${hour}`}
                                       className="bg-background p-1 cursor-pointer hover:bg-accent/50 transition-colors"
                                       // onClick={() => handleTimeSlotClick(date, hour)}
                                    >
                                       {dayAppointments.map((appointment) => (
                                          <div
                                             key={appointment.id}
                                             className="bg-primary text-primary-foreground p-2 rounded text-xs mb-1 cursor-pointer hover:bg-primary/80"
                                             /*onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentClick(appointment);
                              }}*/
                                          >
                                             <div className="font-medium">
                                                {formatTime(new Date(appointment.dateTime))} -{" "}
                                                {appointment.patientName}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 );
                              })}
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {/* Month View */}
               {view === "month" && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-7 gap-px bg-border">
                        {weekDays.map((day) => (
                           <div key={day} className="bg-muted p-3 text-center text-sm font-medium">
                              {day}
                           </div>
                        ))}
                     </div>

                     {getMonthCalendar().map((week, weekIndex) => (
                        <div key={`${week}-${Date.now()}`} className="grid grid-cols-7 gap-px bg-border">
                           {week.map((date, dayIndex) => {
                              const dayAppointments = getAppointmentsForDate(date);
                              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                              const isToday = date.toDateString() === new Date().toDateString();

                              return (
                                 <div
                                    key={`${date}-${Date.now()}`}
                                    className={`bg-background p-2 min-h-[120px] cursor-pointer hover:bg-accent/50 transition-colors ${
                                       !isCurrentMonth ? "text-muted-foreground bg-muted/30" : ""
                                    } ${isToday ? "bg-primary/5 border-primary" : ""}`}
                                    // onClick={() => handleDayClick(date)}
                                 >
                                    <div
                                       className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}
                                    >
                                       {date.getDate()}
                                    </div>
                                    <div className="space-y-1">
                                       {dayAppointments.slice(0, 2).map((appointment) => (
                                          <div
                                             key={appointment.id}
                                             className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs truncate cursor-pointer hover:bg-primary/80"
                                             /*onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentClick(appointment);
                              }}*/
                                          >
                                             {appointment.patientName}
                                          </div>
                                       ))}
                                       {dayAppointments.length > 2 && (
                                          <div className="text-xs text-muted-foreground">
                                             +{dayAppointments.length - 2} mais
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     ))}
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Appointment Form Dialog */}
         <AppointmentForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            appointment={selectedAppointment}
            onSave={handleSaveAppointment}
         />
      </div>
   );
}
