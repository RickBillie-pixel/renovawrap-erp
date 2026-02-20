import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";
import {
  Calendar,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit,
  Bell,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppointmentModal, Appointment } from "@/components/Admin/AppointmentModal";
import { ReminderModal } from "@/components/Admin/ReminderModal";
import { RemindersTable } from "@/components/Admin/RemindersTable";

type TabType = "alle" | "herinneringen";

export const AfsprakenPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("alle");
  
  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
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
  }, []);

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleOpenReminders = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsReminderModalOpen(true);
  };

  const handleUpdateStatus = async (appointment: Appointment, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointment.id);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: `Afspraak is nu ${newStatus === "voltooid" ? "voltooid" : "geannuleerd"}`,
      });

      await fetchAppointments();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentToDelete.id);

      if (error) throw error;

      toast({
        title: "Afspraak verwijderd",
        description: "De afspraak is succesvol verwijderd",
      });

      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
      await fetchAppointments();
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "gepland":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "voltooid":
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
      case "voltooid":
        return "Voltooid";
      case "geannuleerd":
        return "Geannuleerd";
      default:
        return status;
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "alle", label: "Afspraken" },
    { id: "herinneringen", label: "Herinneringen" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Afspraken</h2>
          <p className="text-muted-foreground">Beheer afspraken en herinneringen</p>
        </div>
        <Button onClick={handleNewAppointment} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe Afspraak
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-secondary/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {activeTab === "herinneringen" ? (
          <RemindersTable onRefresh={fetchAppointments} />
        ) : isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Afspraken laden...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Geen afspraken gevonden</p>
            <Button variant="outline" className="mt-4" onClick={handleNewAppointment}>
              <Plus className="w-4 h-4 mr-2" />
              Eerste afspraak maken
            </Button>
          </div>
        ) : (
          <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Datum</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Titel</th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">
                    Klant
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                  <th className="w-10 p-4"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {appointments.map((appointment) => (
                    <motion.tr
                      key={appointment.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      <td className="p-4 text-sm text-muted-foreground">
                        <div>
                          {format(new Date(appointment.date), "d MMM. yyyy", { locale: nl })}
                        </div>
                        {appointment.time && (
                          <div className="text-xs">
                            {appointment.time.slice(0, 5)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-medium text-foreground">{appointment.title}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {appointment.customer_name || "-"}
                      </td>
                      <td className="p-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                            getStatusBadge(appointment.status)
                          )}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditAppointment(appointment); }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Bewerken
                            </DropdownMenuItem>
                            {appointment.customer_email && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenReminders(appointment); }}>
                                <Bell className="w-4 h-4 mr-2" />
                                Afspraakherinnering
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {appointment.status !== "voltooid" && (
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appointment, "voltooid"); }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Voltooien
                              </DropdownMenuItem>
                            )}
                            {appointment.status !== "geannuleerd" && (
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appointment, "geannuleerd"); }}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Annuleren
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); handleDeleteClick(appointment); }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4 p-4">
            <AnimatePresence mode="popLayout">
              {appointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-secondary/20 border border-border rounded-xl p-4 shadow-sm"
                  onClick={() => handleEditAppointment(appointment)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{appointment.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(appointment.date), "d MMM. yyyy", { locale: nl })}
                        {appointment.time && ` om ${appointment.time.slice(0, 5)}`}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border",
                        getStatusBadge(appointment.status)
                      )}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>

                  {appointment.customer_name && (
                    <p className="text-sm text-muted-foreground mb-3">Klant: {appointment.customer_name}</p>
                  )}

                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4 mr-2" />
                          Acties
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditAppointment(appointment); }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Bewerken
                        </DropdownMenuItem>
                        {appointment.customer_email && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenReminders(appointment); }}>
                            <Bell className="w-4 h-4 mr-2" />
                            Herinnering
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {appointment.status !== "voltooid" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appointment, "voltooid"); }}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Voltooien
                          </DropdownMenuItem>
                        )}
                        {appointment.status !== "geannuleerd" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdateStatus(appointment, "geannuleerd"); }}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Annuleren
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(appointment); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          </>
        )}
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSave={fetchAppointments}
        appointment={selectedAppointment}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSave={fetchAppointments}
        appointment={selectedAppointment}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Afspraak Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze afspraak wilt verwijderen? Dit verwijdert ook alle
              bijbehorende herinneringen.
              {appointmentToDelete && (
                <div className="mt-2 p-2 bg-secondary/50 rounded text-sm text-foreground">
                  <div className="mb-1">
                    <strong>Titel:</strong> {appointmentToDelete.title}
                  </div>
                  <div className="mb-1">
                    <strong>Datum:</strong>{" "}
                    {format(new Date(appointmentToDelete.date), "d MMMM yyyy", { locale: nl })}
                  </div>
                  {appointmentToDelete.customer_name && (
                    <div>
                      <strong>Klant:</strong> {appointmentToDelete.customer_name}
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Verwijderen..." : "Verwijderen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
