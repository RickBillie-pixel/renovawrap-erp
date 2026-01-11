import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { nl } from "date-fns/locale/nl";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentModal, Appointment } from "@/components/Admin/AppointmentModal";

export const AgendaPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments for the visible month range
      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Fout bij ophalen afspraken",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentMonth]);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getStartDayOfWeek = () => {
    const firstDay = startOfMonth(currentMonth);
    // Get day of week (0 = Sunday, 1 = Monday, etc)
    let day = firstDay.getDay();
    // Convert to Monday-based (0 = Monday, 6 = Sunday)
    return day === 0 ? 6 : day - 1;
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.date), date));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(appointment);
    setSelectedDate(null);
    setIsAppointmentModalOpen(true);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const getTypeColor = () => {
    return "bg-primary/80 text-primary-foreground";
  };

  const days = getDaysInMonth();
  const startDay = getStartDayOfWeek();
  const weekDays = ["ma", "di", "wo", "do", "vr", "za", "zo"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground underline decoration-primary/30 underline-offset-4">
            Agenda
          </h2>
          <p className="text-muted-foreground">
            {format(currentMonth, "MMMM yyyy", { locale: nl })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Vandaag
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-muted-foreground bg-secondary/30"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[120px] p-2 border-b border-r border-border bg-secondary/10"
            />
          ))}

          {/* Day cells */}
          {days.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentDay = isToday(day);
            const isSunday = day.getDay() === 0;

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[120px] p-2 border-b border-r border-border cursor-pointer transition-colors",
                  "hover:bg-secondary/30",
                  !isSameMonth(day, currentMonth) && "bg-secondary/10 text-muted-foreground/50",
                  isCurrentDay && "bg-primary/5",
                  isSunday && "bg-green-500/5"
                )}
              >
                {/* Day number */}
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
                      isCurrentDay && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                </div>

                {/* Appointments */}
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={(e) => handleAppointmentClick(apt, e)}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                        getTypeColor()
                      )}
                      title={apt.title}
                    >
                      {apt.time && (
                        <span className="font-medium mr-1">{apt.time.slice(0, 5)}</span>
                      )}
                      {apt.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1.5">
                      +{dayAppointments.length - 2} meer
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Fill remaining cells to complete the grid */}
          {(() => {
            const totalCells = startDay + days.length;
            const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
            return Array.from({ length: remainingCells }).map((_, i) => (
              <div
                key={`empty-end-${i}`}
                className="min-h-[120px] p-2 border-b border-r border-border bg-secondary/10"
              />
            ));
          })()}
        </div>
      </div>


      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedAppointment(null);
          setSelectedDate(null);
        }}
        onSave={fetchAppointments}
        appointment={selectedAppointment}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
};

