import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Users, Mail, Phone, MapPin, Calendar, Image as ImageIcon, FileText, RefreshCw, Eye, Trash2, Edit, Plus, X, Upload } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";

interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  lead_source?: string;
  lead_id?: string;
  project_type?: string;
  service_details?: any;
  color_details?: any;
  message?: string;
  photo_urls?: string[];
  image_url?: string;
  status: string;
  admin_notes?: string;
  appointments?: any[];
  additional_info?: any;
}

export const KlantenPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    project_type: "",
    admin_notes: "",
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [newAppointment, setNewAppointment] = useState({ date: "", time: "", notes: "" });
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
      setFilteredCustomers(data || []);
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      toast({
        title: "Fout bij ophalen klanten",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let filtered = customers;

    if (statusFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [statusFilter, customers]);

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      project_type: customer.project_type || "",
      admin_notes: customer.admin_notes || "",
    });
    setAppointments(customer.appointments || []);
    setPhotoUrls(customer.photo_urls || []);
    setIsDetailOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!selectedCustomer) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          project_type: formData.project_type,
          admin_notes: formData.admin_notes,
          appointments: appointments,
          photo_urls: photoUrls,
        })
        .eq("id", selectedCustomer.id);

      if (error) throw error;

      toast({
        title: "Klant bijgewerkt",
        description: "De klantgegevens zijn succesvol opgeslagen.",
      });

      await fetchCustomers();
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const deleteCustomer = async () => {
    if (!customerToDelete) return;

    const customerId = customerToDelete.id;
    setIsDeleting(true);
    setDeletingCustomerId(customerId);

    const previousCustomers = [...customers];
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setFilteredCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setDeleteDialogOpen(false);
    if (selectedCustomer?.id === customerId) {
      setIsDetailOpen(false);
      setSelectedCustomer(null);
    }
    const customerToDeleteBackup = customerToDelete;
    setCustomerToDelete(null);

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) throw error;

      toast({
        title: "Klant verwijderd",
        description: "De klant is succesvol verwijderd.",
      });
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      setCustomers(previousCustomers);
      setFilteredCustomers(previousCustomers);
      toast({
        title: "Fout bij verwijderen",
        description: error.message || "De klant kon niet worden verwijderd. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingCustomerId(null);
    }
  };

  const addAppointment = () => {
    if (!newAppointment.date || !newAppointment.time) {
      toast({
        title: "Incompleet",
        description: "Vul datum en tijd in",
        variant: "destructive",
      });
      return;
    }

    const appointment = {
      id: Date.now().toString(),
      date: newAppointment.date,
      time: newAppointment.time,
      notes: newAppointment.notes,
      created_at: new Date().toISOString(),
    };

    setAppointments([...appointments, appointment]);
    setNewAppointment({ date: "", time: "", notes: "" });
  };

  const removeAppointment = (id: string) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "Upload een afbeelding kleiner dan 10MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `customer-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `customers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contact-uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('contact-uploads')
        .getPublicUrl(filePath);

      setPhotoUrls([...photoUrls, data.publicUrl]);
      toast({
        title: "Foto geüpload",
        description: "De foto is succesvol geüpload.",
      });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Fout bij uploaden",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removePhoto = (url: string) => {
    setPhotoUrls(photoUrls.filter((u) => u !== url));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "archived":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actief";
      case "completed":
        return "Afgerond";
      case "archived":
        return "Gearchiveerd";
      default:
        return status;
    }
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    completed: customers.filter((c) => c.status === "completed").length,
    archived: customers.filter((c) => c.status === "archived").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Totaal Klanten</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-muted-foreground">Actief</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
          <div className="text-sm text-muted-foreground">Afgerond</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
          <div className="text-sm text-muted-foreground">Gearchiveerd</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Statussen</SelectItem>
              <SelectItem value="active">Actief</SelectItem>
              <SelectItem value="completed">Afgerond</SelectItem>
              <SelectItem value="archived">Gearchiveerd</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={isLoading} className="w-full md:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Klanten laden...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Geen klanten gevonden</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Datum</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Naam</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Telefoon</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Adres</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Actie</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredCustomers.map((customer) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                          opacity: deletingCustomerId === customer.id ? 0 : 1,
                          x: deletingCustomerId === customer.id ? -20 : 0,
                          scale: deletingCustomerId === customer.id ? 0.98 : 1,
                        }}
                        exit={{
                          opacity: 0,
                          x: -100,
                          scale: 0.95,
                          transition: { duration: 0.25, ease: "easeInOut" }
                        }}
                        transition={{
                          duration: 0.25,
                          ease: "easeInOut"
                        }}
                        className={`border-b border-border hover:bg-secondary/30 transition-colors ${
                          deletingCustomerId === customer.id ? "pointer-events-none" : ""
                        }`}
                      >
                        <td className="p-4 text-sm text-muted-foreground">
                          {format(new Date(customer.created_at), "dd MMM yyyy", { locale: nl })}
                        </td>
                        <td className="p-4 text-sm font-medium text-foreground">{customer.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{customer.email}</td>
                        <td className="p-4 text-sm text-muted-foreground">{customer.phone || "-"}</td>
                        <td className="p-4 text-sm text-muted-foreground">{customer.address || "-"}</td>
                        <td className="p-4">
                          <Select
                            value={customer.status}
                            onValueChange={async (value) => {
                              try {
                                await supabase
                                  .from("customers")
                                  .update({ status: value })
                                  .eq("id", customer.id);
                                await fetchCustomers();
                                toast({
                                  title: "Status bijgewerkt",
                                  description: "De status is succesvol bijgewerkt",
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Fout",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={deletingCustomerId === customer.id || isDeleting}
                          >
                            <SelectTrigger className={`w-[140px] h-8 text-xs ${getStatusColor(customer.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Actief</SelectItem>
                              <SelectItem value="completed">Afgerond</SelectItem>
                              <SelectItem value="archived">Gearchiveerd</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openCustomerDetail(customer)}
                              disabled={deletingCustomerId === customer.id || isDeleting}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(customer)}
                              disabled={deletingCustomerId === customer.id || isDeleting}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                            >
                              {deletingCustomerId === customer.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {isLoading ? (
            <div className="p-8 text-center bg-card border border-border rounded-xl">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Klanten laden...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-8 text-center bg-card border border-border rounded-xl">
              <p className="text-muted-foreground">Geen klanten gevonden</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">
                        {format(new Date(customer.created_at), "dd MMM yyyy", { locale: nl })}
                      </span>
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(customer.status)}`}
                    >
                      {getStatusLabel(customer.status)}
                    </span>
                  </div>

                  <div className="mb-4 space-y-1">
                    <div className="text-sm text-foreground break-all">
                      <span className="text-muted-foreground mr-2">Email:</span>
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div className="text-sm text-foreground">
                        <span className="text-muted-foreground mr-2">Tel:</span>
                        {customer.phone}
                      </div>
                    )}
                    {customer.address && (
                      <div className="text-sm text-foreground">
                        <span className="text-muted-foreground mr-2">Adres:</span>
                        {customer.address}
                      </div>
                    )}
                    <div className="text-sm flex items-center justify-between pt-2">
                      <span className="text-muted-foreground">Status:</span>
                      <Select
                        value={customer.status}
                        onValueChange={async (value) => {
                          try {
                            await supabase
                              .from("customers")
                              .update({ status: value })
                              .eq("id", customer.id);
                            await fetchCustomers();
                            toast({
                              title: "Status bijgewerkt",
                              description: "De status is succesvol bijgewerkt",
                            });
                          } catch (error: any) {
                            toast({
                              title: "Fout",
                              description: error.message,
                              variant: "destructive",
                            });
                          }
                        }}
                        disabled={deletingCustomerId === customer.id || isDeleting}
                      >
                        <SelectTrigger className={`w-[140px] h-8 text-xs ${getStatusColor(customer.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actief</SelectItem>
                          <SelectItem value="completed">Afgerond</SelectItem>
                          <SelectItem value="archived">Gearchiveerd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openCustomerDetail(customer)}
                      disabled={deletingCustomerId === customer.id || isDeleting}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(customer)}
                      disabled={deletingCustomerId === customer.id || isDeleting}
                    >
                      {deletingCustomerId === customer.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Verwijderen
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Klant Details</DialogTitle>
            <DialogDescription>
              Bewerk klantgegevens en voeg aanvullende informatie toe
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Naam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefoon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="project_type">Project Type</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value) => setFormData({ ...formData, project_type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keuken">Keuken Wrappen</SelectItem>
                      <SelectItem value="interieur">Interieur Wrappen</SelectItem>
                      <SelectItem value="zakelijk">Zakelijk Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin_notes">Admin Notities</Label>
                <Textarea
                  id="admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  rows={4}
                  className="mt-1"
                  placeholder="Interne notities..."
                />
              </div>

              {/* Appointments */}
              <div>
                <Label>Afspraken</Label>
                <div className="mt-2 space-y-2">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {format(new Date(apt.date), "dd MMMM yyyy", { locale: nl })} om {apt.time}
                        </div>
                        {apt.notes && <div className="text-sm text-muted-foreground">{apt.notes}</div>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAppointment(apt.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex flex-col md:flex-row gap-2">
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className="w-full md:w-32"
                    />
                    <Input
                      placeholder="Notities"
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                      className="flex-1"
                    />
                    <Button onClick={addAppointment}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div>
                <Label>Foto's</Label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={url}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(url)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Original Lead Info */}
              {selectedCustomer.lead_source && (
                <div className="pt-4 border-t border-border">
                  <Label className="text-xs text-muted-foreground mb-2 block">Lead Bron</Label>
                  <p className="text-sm font-medium">
                    {selectedCustomer.lead_source === "configurator" ? "Configurator" : "Contact Formulier"}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse md:flex-row justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={handleSaveCustomer} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Opslaan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Klant Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze klant wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              {customerToDelete && (
                <div className="mt-2 p-2 bg-secondary/50 rounded text-sm text-foreground">
                  <div className="mb-1"><strong>Naam:</strong> {customerToDelete.name}</div>
                  <div className="mb-1"><strong>Email:</strong> {customerToDelete.email}</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCustomer}
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
