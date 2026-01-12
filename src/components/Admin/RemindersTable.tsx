import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { ChevronRight, Bell, Mail, MoreVertical, X, RefreshCw, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentWithReminders {
  id: string;
  title: string;
  date: string;
  time: string | null;
  customer_name: string | null;
  customer_email: string | null;
  reminders: {
    id: string;
    reminder_date: string;
    status: string;
    sent_at: string | null;
  }[];
}

interface RemindersTableProps {
  onRefresh?: () => void;
}

export const RemindersTable = ({ onRefresh }: RemindersTableProps) => {
  const [appointments, setAppointments] = useState<AppointmentWithReminders[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);

  const fetchAppointmentsWithReminders = async () => {
    setIsLoading(true);
    try {
      // Fetch appointments that have reminders
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          title,
          date,
          time,
          customer_name,
          customer_email,
          appointment_reminders (
            id,
            reminder_date,
            status,
            sent_at
          )
        `)
        .order("date", { ascending: true });

      if (error) throw error;

      // Filter only appointments with reminders and transform data
      const appointmentsWithReminders = (data || [])
        .filter((apt: any) => apt.appointment_reminders && apt.appointment_reminders.length > 0)
        .map((apt: any) => ({
          id: apt.id,
          title: apt.title,
          date: apt.date,
          time: apt.time,
          customer_name: apt.customer_name,
          customer_email: apt.customer_email,
          reminders: apt.appointment_reminders.sort((a: any, b: any) => 
            new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()
          ),
        }));

      setAppointments(appointmentsWithReminders);
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

  useEffect(() => {
    fetchAppointmentsWithReminders();
  }, []);

  const toggleRow = (appointmentId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
  };

  const handleSendNow = async (reminderId: string) => {
    setSendingReminderId(reminderId);
    try {
      const { data, error } = await supabase.functions.invoke("send-appointment-reminder", {
        body: { reminder_id: reminderId },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Herinnering verstuurd",
          description: "De herinnering is succesvol verstuurd",
        });
        await fetchAppointmentsWithReminders();
        onRefresh?.();
      } else {
        throw new Error(data?.error || "Onbekende fout");
      }
    } catch (error: any) {
      console.error("Error sending reminder:", error);
      toast({
        title: "Fout bij versturen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleCancelAllReminders = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from("appointment_reminders")
        .update({ status: "geannuleerd" })
        .eq("appointment_id", appointmentId)
        .eq("status", "gepland");

      if (error) throw error;

      toast({
        title: "Herinneringen geannuleerd",
        description: "Alle geplande herinneringen zijn geannuleerd",
      });

      await fetchAppointmentsWithReminders();
      onRefresh?.();
    } catch (error: any) {
      console.error("Error cancelling reminders:", error);
      toast({
        title: "Fout bij annuleren",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSendAllPlanned = async (appointmentId: string, reminders: { id: string; status: string }[]) => {
    const plannedReminders = reminders.filter((r) => r.status === "gepland");
    if (plannedReminders.length === 0) return;

    setSendingReminderId(appointmentId);
    let successCount = 0;
    let failCount = 0;

    for (const reminder of plannedReminders) {
      try {
        const { data, error } = await supabase.functions.invoke("send-appointment-reminder", {
          body: { reminder_id: reminder.id },
        });

        if (error || !data?.success) {
          failCount++;
        } else {
          successCount++;
        }
      } catch {
        failCount++;
      }
    }

    setSendingReminderId(null);

    if (successCount > 0) {
      toast({
        title: "Herinneringen verstuurd",
        description: `${successCount} herinnering(en) verstuurd${failCount > 0 ? `, ${failCount} mislukt` : ""}`,
      });
      await fetchAppointmentsWithReminders();
      onRefresh?.();
    } else {
      toast({
        title: "Fout bij versturen",
        description: "Kon geen herinneringen versturen",
        variant: "destructive",
      });
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

  const getRemindersSummary = (reminders: AppointmentWithReminders["reminders"]) => {
    const planned = reminders.filter((r) => r.status === "gepland").length;
    const sent = reminders.filter((r) => r.status === "verzonden").length;
    const cancelled = reminders.filter((r) => r.status === "geannuleerd").length;
    
    const parts = [];
    if (planned > 0) parts.push(`${planned} gepland`);
    if (sent > 0) parts.push(`${sent} verzonden`);
    if (cancelled > 0) parts.push(`${cancelled} geannuleerd`);
    
    return parts.join(", ") || "Geen herinneringen";
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Herinneringen laden...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center">
        <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Geen herinneringen gevonden</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Plan herinneringen via de afspraken tab
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/50 border-b border-border">
          <tr>
            <th className="w-10 p-4"></th>
            <th className="text-left p-4 text-sm font-medium text-foreground">Afspraak</th>
            <th className="text-left p-4 text-sm font-medium text-foreground">Afspraak Datum</th>
            <th className="text-left p-4 text-sm font-medium text-foreground">Klant</th>
            <th className="text-left p-4 text-sm font-medium text-foreground">Herinneringen</th>
            <th className="w-10 p-4"></th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const isExpanded = expandedRows.has(appointment.id);
            const plannedCount = appointment.reminders.filter((r) => r.status === "gepland").length;
            const isSending = sendingReminderId === appointment.id;

            return (
              <React.Fragment key={appointment.id}>
                {/* Main row */}
                <motion.tr
                  key={`${appointment.id}-main`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => toggleRow(appointment.id)}
                >
                  <td className="p-4">
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </td>
                  <td className="p-4 font-medium text-foreground">{appointment.title}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {format(new Date(appointment.date), "d MMM yyyy", { locale: nl })}
                    {appointment.time && ` om ${appointment.time.slice(0, 5)}`}
                  </td>
                  <td className="p-4">
                    {appointment.customer_name && (
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {appointment.customer_name}
                        </div>
                        {appointment.customer_email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {appointment.customer_email}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        <Bell className="w-3 h-3" />
                        {appointment.reminders.length}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getRemindersSummary(appointment.reminders)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {plannedCount > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isSending}>
                            {isSending ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleSendAllPlanned(appointment.id, appointment.reminders)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Verstuur alle ({plannedCount})
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleCancelAllReminders(appointment.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Alle herinneringen annuleren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </motion.tr>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.tr
                    key={`${appointment.id}-expanded`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-secondary/20"
                  >
                    <td colSpan={6} className="p-0">
                      <div className="px-8 py-4 border-b border-border">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-muted-foreground">
                              <th className="text-left pb-2 font-medium">Herinneringsdatum</th>
                              <th className="text-left pb-2 font-medium">Verzendtijd</th>
                              <th className="text-left pb-2 font-medium">Status</th>
                              <th className="text-left pb-2 font-medium">Verzonden</th>
                              <th className="text-right pb-2 font-medium">Actie</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointment.reminders.map((reminder) => {
                              const isReminderSending = sendingReminderId === reminder.id;
                              return (
                                <tr key={reminder.id} className="text-sm">
                                  <td className="py-2 text-foreground">
                                    {format(new Date(reminder.reminder_date), "d MMMM yyyy", {
                                      locale: nl,
                                    })}
                                  </td>
                                  <td className="py-2 text-muted-foreground">09:00</td>
                                  <td className="py-2">
                                    <span
                                      className={cn(
                                        "px-2 py-0.5 rounded text-xs font-medium border",
                                        getStatusBadge(reminder.status)
                                      )}
                                    >
                                      {getStatusLabel(reminder.status)}
                                    </span>
                                  </td>
                                  <td className="py-2 text-muted-foreground">
                                    {reminder.sent_at
                                      ? format(new Date(reminder.sent_at), "d MMM yyyy HH:mm", {
                                          locale: nl,
                                        })
                                      : "-"}
                                  </td>
                                  <td className="py-2 text-right">
                                    {reminder.status === "gepland" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSendNow(reminder.id)}
                                        disabled={isReminderSending}
                                        className="h-7 text-xs"
                                      >
                                        {isReminderSending ? (
                                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                        ) : (
                                          <Send className="w-3 h-3 mr-1" />
                                        )}
                                        Verstuur Nu
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
