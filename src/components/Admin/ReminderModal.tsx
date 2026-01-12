import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { ChevronLeft, ChevronRight, Bell, Calendar, Mail, MapPin, X, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Appointment } from "./AppointmentModal";

interface AppointmentReminder {
  id: string;
  appointment_id: string;
  reminder_date: string;
  status: string;
  sent_at: string | null;
  created_at: string;
}

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  appointment: Appointment | null;
}

export const ReminderModal = ({ isOpen, onClose, onSave, appointment }: ReminderModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingReminders, setExistingReminders] = useState<AppointmentReminder[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing reminders when modal opens
  useEffect(() => {
    if (isOpen && appointment?.id) {
      fetchExistingReminders();
      setSelectedDates([]);
      setCurrentMonth(new Date());
    }
  }, [isOpen, appointment?.id]);

  const fetchExistingReminders = async () => {
    if (!appointment?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointment_reminders")
        .select("*")
        .eq("appointment_id", appointment.id)
        .order("reminder_date", { ascending: true });

      if (error) throw error;
      setExistingReminders(data || []);
    } catch (error: any) {
      console.error("Error fetching reminders:", error);
      toast({
        title: "Fout bij ophalen herinneringen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const isDateSelected = (date: Date) => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  const isDateExistingReminder = (date: Date) => {
    return existingReminders.some(
      (r) => r.status !== "geannuleerd" && isSameDay(new Date(r.reminder_date), date)
    );
  };

  const isDateCancelledReminder = (date: Date) => {
    return existingReminders.some(
      (r) => r.status === "geannuleerd" && isSameDay(new Date(r.reminder_date), date)
    );
  };

  const handleDateClick = (date: Date) => {
    // Don't allow past dates
    if (isBefore(date, startOfDay(new Date()))) return;

    // Don't allow selecting dates that already have a reminder
    if (isDateExistingReminder(date)) return;

    // Toggle selection
    if (isDateSelected(date)) {
      setSelectedDates((prev) => prev.filter((d) => !isSameDay(d, date)));
    } else {
      setSelectedDates((prev) => [...prev, date]);
    }
  };

  const handleCancelReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from("appointment_reminders")
        .update({ status: "geannuleerd" })
        .eq("id", reminderId);

      if (error) throw error;

      toast({
        title: "Herinnering geannuleerd",
        description: "De herinnering is geannuleerd",
      });

      await fetchExistingReminders();
    } catch (error: any) {
      console.error("Error cancelling reminder:", error);
      toast({
        title: "Fout bij annuleren",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from("appointment_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;

      toast({
        title: "Herinnering verwijderd",
        description: "De herinnering is permanent verwijderd",
      });

      await fetchExistingReminders();
    } catch (error: any) {
      console.error("Error deleting reminder:", error);
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (selectedDates.length === 0) {
      onClose();
      return;
    }

    if (!appointment?.id) return;

    setIsSaving(true);
    try {
      const reminders = selectedDates.map((date) => ({
        appointment_id: appointment.id,
        reminder_date: format(date, "yyyy-MM-dd"),
        status: "gepland",
      }));

      const { error } = await supabase.from("appointment_reminders").insert(reminders);

      if (error) throw error;

      toast({
        title: "Herinneringen opgeslagen",
        description: `${selectedDates.length} herinnering(en) gepland`,
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving reminders:", error);
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "gepland":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "verzonden":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "geannuleerd":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "gepland":
        return "Gepland";
      case "verzonden":
        return "Verzonden";
      case "geannuleerd":
        return "Geannuleerd";
      default:
        return status;
    }
  };

  if (!appointment) return null;

  const days = getDaysInMonth();
  const startDay = getStartDayOfWeek();
  const weekDays = ["ma", "di", "wo", "do", "vr", "za", "zo"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Herinneringen instellen
          </DialogTitle>
          <DialogDescription>
            Klik op datums in de kalender om herinneringen in te plannen. Deze worden automatisch om 9:00 verstuurd.
          </DialogDescription>
        </DialogHeader>

        {/* Appointment Info */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-foreground">{appointment.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {format(new Date(appointment.date), "d MMMM yyyy", { locale: nl })}
            {appointment.time && ` om ${appointment.time.slice(0, 5)}`}
          </div>
          {appointment.customer_name && (
            <div className="text-sm text-muted-foreground">
              Klant: {appointment.customer_name}
            </div>
          )}
          {appointment.customer_email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {appointment.customer_email}
            </div>
          )}
          {appointment.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {appointment.address}
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className="text-sm text-muted-foreground">
          Klik op datums om herinneringen in te plannen (worden om 9:00 verstuurd):
        </p>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium">
            {format(currentMonth, "MMMM yyyy", { locale: nl })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="border border-border rounded-lg p-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const isPast = isBefore(day, startOfDay(new Date()));
              const isSelected = isDateSelected(day);
              const hasReminder = isDateExistingReminder(day);
              const isCancelled = isDateCancelledReminder(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={isPast || hasReminder}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-colors relative",
                    "flex items-center justify-center",
                    !isSameMonth(day, currentMonth) && "text-muted-foreground/50",
                    isPast && "text-muted-foreground/30 cursor-not-allowed",
                    isToday(day) && "bg-primary text-primary-foreground",
                    !isPast && !isToday(day) && !isSelected && !hasReminder && "hover:bg-secondary",
                    isSelected && "bg-primary/80 text-primary-foreground",
                    hasReminder && "bg-primary/20 text-primary cursor-not-allowed",
                    isCancelled && "line-through text-muted-foreground/50"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected dates */}
        {selectedDates.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Nieuw te plannen ({selectedDates.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((date) => (
                  <span
                    key={date.toISOString()}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                  >
                    {format(date, "d MMM yyyy", { locale: nl })}
                    <button
                      type="button"
                      onClick={() => setSelectedDates((prev) => prev.filter((d) => !isSameDay(d, date)))}
                      className="hover:text-primary/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Existing Reminders */}
        {existingReminders.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Bestaande herinneringen:</p>
            <div className="space-y-2">
              {existingReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">
                        {format(new Date(reminder.reminder_date), "d MMMM yyyy", { locale: nl })}
                      </div>
                      <div className="text-xs text-muted-foreground">om 9:00</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium border",
                        getStatusBadge(reminder.status)
                      )}
                    >
                      {getStatusLabel(reminder.status)}
                    </span>
                    {reminder.status === "gepland" ? (
                      <button
                        type="button"
                        onClick={() => handleCancelReminder(reminder.id)}
                        className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="Annuleren"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : reminder.status === "geannuleerd" ? (
                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive transition-colors"
                        title="Verwijderen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Opslaan...
              </>
            ) : (
              "Opslaan"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

