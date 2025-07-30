import { WorkScheduleSchema, type DoctorFormData, type WorkScheduleFormData } from "@/lib/schemas";
import type { OfficeHours } from "@/types";
import { WeekDays } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { InputSelectField } from "../shared/InputSelectField";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";

const dayNames = [
   { value: "sunday", label: "Domingo" },
   { value: "monday", label: "Segunda-feira" },
   { value: "tuesday", label: "Terça-feira" },
   { value: "wednesday", label: "Quarta-feira" },
   { value: "thursday", label: "Quinta-feira" },
   { value: "friday", label: "Sexta-feira" },
   { value: "saturday", label: "Sábado" },
];

interface DoctorWorkScheduleProps {
   doctorform: UseFormReturn<DoctorFormData>;
}

export function DoctorWorkScheduleForm({ doctorform }: DoctorWorkScheduleProps) {
   const [schedules, setSchedules] = useState<OfficeHours[]>([]);

   const form = useForm<WorkScheduleFormData>({
      resolver: zodResolver(WorkScheduleSchema),
      defaultValues: {
         dayOfWeek: WeekDays.MONDAY,
         startTime: "09:00",
         endTime: "17:00",
         isActive: true,
      },
   });

   const handleAddSchedule = (data: WorkScheduleFormData) => {
      const { dayOfWeek } = data;

      // Check if schedule for this day already exists
      const existingSchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
      if (existingSchedule) {
         toast.error("Já existe um horário cadastrado para este dia da semana");
         return;
      }

      // Validate time range
      if (data.startTime >= data.endTime) {
         toast.error("Hora de início deve ser anterior à hora de término");
         return;
      }

      const newSchedule: OfficeHours = {
         dayOfWeek: dayOfWeek,
         startTime: data.startTime,
         endTime: data.endTime,
         isActive: data.isActive,
      };

      const updatedSchedules = [...schedules, newSchedule].sort((a, b) =>
         a.dayOfWeek.localeCompare(b.dayOfWeek),
      );
      setSchedules(updatedSchedules);
      doctorform.setValue("workSchedule", updatedSchedules);
      form.reset();
      toast.success("Horário adicionado com sucesso");
   };

   const handleRemoveSchedule = (dayOfWeek: string) => {
      const updatedSchedules = schedules.filter((s) => s.dayOfWeek !== dayOfWeek);
      setSchedules(updatedSchedules);
      toast.success("Horário removido com sucesso");
   };

   const handleToggleActive = (dayOfWeek: string) => {
      const updatedSchedules = schedules.map((s) =>
         s.dayOfWeek === dayOfWeek ? { ...s, isActive: !s.isActive } : s,
      );
      setSchedules(updatedSchedules);
   };

   return (
      <div className="space-y-6">
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Gerenciar Horários de Trabalho
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex justify-between gap-4 pb-4">
                  <InputSelectField
                     form={form}
                     name="dayOfWeek"
                     label="Dia da Semana"
                     placeholder="Selecione um dia"
                     options={dayNames}
                  />

                  <FormField
                     control={form.control}
                     name="startTime"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Hora Início</FormLabel>
                           <FormControl>
                              <Input type="time" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <FormField
                     control={form.control}
                     name="endTime"
                     render={({ field }) => (
                        <FormItem>
                           <FormLabel>Hora Término</FormLabel>
                           <FormControl>
                              <Input type="time" {...field} />
                           </FormControl>
                           <FormMessage />
                        </FormItem>
                     )}
                  />

                  <div className="flex items-end">
                     <Button
                        type="button"
                        size={"icon"}
                        className="cursor-pointer"
                        onClick={() => handleAddSchedule(form.getValues())}
                     >
                        <Plus className="h-4 w-4" />
                     </Button>
                  </div>
               </div>

               <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                           <FormLabel>Ativo</FormLabel>
                           <p className="text-sm text-muted-foreground">
                              Este horário estará disponível para agendamentos
                           </p>
                        </div>
                        <FormControl>
                           <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                     </FormItem>
                  )}
               />
            </CardContent>
         </Card>

         {schedules.length > 0 && (
            <Card>
               <CardHeader>
                  <CardTitle>Horários Cadastrados</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     {schedules.map((schedule) => {
                        const dayName = dayNames.find((d) => d.value === schedule.dayOfWeek) ?? {
                           value: "",
                           label: "",
                        };

                        return (
                           <div
                              key={schedule.dayOfWeek}
                              className="flex items-center justify-between p-3 border rounded-lg"
                           >
                              <div className="flex items-center space-x-4">
                                 <div className="font-medium min-w-[120px]">{dayName?.label}</div>
                                 <div className="text-sm text-muted-foreground">
                                    {schedule.startTime} - {schedule.endTime}
                                 </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Switch
                                    checked={schedule.isActive}
                                    onCheckedChange={() => handleToggleActive(schedule.dayOfWeek)}
                                 />
                                 <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveSchedule(schedule.dayOfWeek)}
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   );
}
