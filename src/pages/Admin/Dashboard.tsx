import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AuthGuard } from "@/components/Admin/AuthGuard";
import { LogOut, Mail, Phone, MapPin, Calendar, Image as ImageIcon, FileText, Filter, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";

interface ConfiguratorLead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  address?: string;
  service_details: any;
  color_details: any;
  image_url: string;
  status: string;
  admin_notes?: string;
  source: "configurator";
}

interface ContactLead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  type: string;
  message?: string;
  photo_urls: string[];
  status: string;
  admin_notes?: string;
  source: "contact_form";
}

type Lead = ConfiguratorLead | ContactLead;

const Dashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Fetch configurator submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Fetch contact requests
      const { data: contacts, error: contactsError } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactsError) throw contactsError;

      // Combine and format leads
      const configuratorLeads: ConfiguratorLead[] = (submissions || []).map((s) => ({
        ...s,
        source: "configurator" as const,
      }));

      const contactLeads: ContactLead[] = (contacts || []).map((c) => ({
        ...c,
        source: "contact_form" as const,
      }));

      const allLeads = [...configuratorLeads, ...contactLeads].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setLeads(allLeads);
      setFilteredLeads(allLeads);
    } catch (error: any) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Fout bij ophalen leads",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    let filtered = leads;

    if (sourceFilter !== "all") {
      filtered = filtered.filter((lead) => lead.source === sourceFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [sourceFilter, statusFilter, leads]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const updateLeadStatus = async (leadId: string, newStatus: string, tableName: string) => {
    setUpdatingStatus(leadId);
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Status bijgewerkt",
        description: "De status is succesvol bijgewerkt",
      });

      await fetchLeads();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateLeadNotes = async (leadId: string, tableName: string) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ admin_notes: notes })
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Notities bijgewerkt",
        description: "De notities zijn succesvol opgeslagen",
      });

      await fetchLeads();
      setNotes("");
    } catch (error: any) {
      console.error("Error updating notes:", error);
      toast({
        title: "Fout bij bijwerken",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setNotes(lead.admin_notes || "");
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "archived":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nieuw";
      case "in_progress":
        return "In Behandeling";
      case "completed":
        return "Afgerond";
      case "archived":
        return "Gearchiveerd";
      default:
        return status;
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    inProgress: leads.filter((l) => l.status === "in_progress").length,
    configurator: leads.filter((l) => l.source === "configurator").length,
    contact: leads.filter((l) => l.source === "contact_form").length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container-wide py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Beheer alle leads en aanvragen</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </header>

        <div className="container-wide py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Totaal Leads</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              <div className="text-sm text-muted-foreground">Nieuw</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">In Behandeling</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-foreground">{stats.configurator}</div>
              <div className="text-sm text-muted-foreground">Configurator</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-foreground">{stats.contact}</div>
              <div className="text-sm text-muted-foreground">Contact</div>
            </motion.div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Filters:</span>
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Bron" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Bronnen</SelectItem>
                  <SelectItem value="configurator">Configurator</SelectItem>
                  <SelectItem value="contact_form">Contact Formulier</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Statussen</SelectItem>
                  <SelectItem value="new">Nieuw</SelectItem>
                  <SelectItem value="in_progress">In Behandeling</SelectItem>
                  <SelectItem value="completed">Afgerond</SelectItem>
                  <SelectItem value="archived">Gearchiveerd</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchLeads} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Vernieuwen
              </Button>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Leads laden...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Geen leads gevonden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-foreground">Datum</th>
                      <th className="text-left p-4 text-sm font-medium text-foreground">Naam</th>
                      <th className="text-left p-4 text-sm font-medium text-foreground">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-foreground">Bron</th>
                      <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-foreground">Actie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="p-4 text-sm text-muted-foreground">
                          {format(new Date(lead.created_at), "dd MMM yyyy HH:mm", { locale: nl })}
                        </td>
                        <td className="p-4 text-sm font-medium text-foreground">{lead.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{lead.email}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              lead.source === "configurator"
                                ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                : "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                            }`}
                          >
                            {lead.source === "configurator" ? "Configurator" : "Contact"}
                          </span>
                        </td>
                        <td className="p-4">
                          <Select
                            value={lead.status}
                            onValueChange={(value) =>
                              updateLeadStatus(
                                lead.id,
                                value,
                                lead.source === "configurator" ? "submissions" : "contact_requests"
                              )
                            }
                            disabled={updatingStatus === lead.id}
                          >
                            <SelectTrigger className={`w-[160px] h-8 text-xs ${getStatusColor(lead.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Nieuw</SelectItem>
                              <SelectItem value="in_progress">In Behandeling</SelectItem>
                              <SelectItem value="completed">Afgerond</SelectItem>
                              <SelectItem value="archived">Gearchiveerd</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLeadDetail(lead)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lead Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
              <DialogDescription>
                Volledige informatie over deze lead
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Naam</Label>
                    <p className="font-medium text-foreground">{selectedLead.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {selectedLead.email}
                    </p>
                  </div>
                  {selectedLead.source === "contact_form" && "phone" in selectedLead && selectedLead.phone && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Telefoon</Label>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {selectedLead.phone}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Datum</Label>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(selectedLead.created_at), "dd MMMM yyyy 'om' HH:mm", { locale: nl })}
                    </p>
                  </div>
                </div>

                {/* Configurator Specific */}
                {selectedLead.source === "configurator" && (
                  <>
                    {"address" in selectedLead && selectedLead.address && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Adres</Label>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {selectedLead.address}
                        </p>
                      </div>
                    )}
                    {"service_details" in selectedLead && selectedLead.service_details && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Service</Label>
                        <p className="font-medium text-foreground">
                          {selectedLead.service_details.label || selectedLead.service_details.value}
                        </p>
                      </div>
                    )}
                    {"color_details" in selectedLead && selectedLead.color_details && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Gekozen Kleur</Label>
                        <p className="font-medium text-foreground">
                          {selectedLead.color_details.name}
                          {selectedLead.color_details.code && ` (${selectedLead.color_details.code})`}
                        </p>
                      </div>
                    )}
                    {"image_url" in selectedLead && selectedLead.image_url && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">Upload Afbeelding</Label>
                        <img
                          src={selectedLead.image_url}
                          alt="Upload"
                          className="rounded-lg border border-border max-w-full h-auto"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Contact Form Specific */}
                {selectedLead.source === "contact_form" && (
                  <>
                    {"type" in selectedLead && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Type Project</Label>
                        <p className="font-medium text-foreground">
                          {selectedLead.type === "keuken"
                            ? "Keuken Wrappen"
                            : selectedLead.type === "interieur"
                            ? "Interieur Wrappen"
                            : "Zakelijk Project"}
                        </p>
                      </div>
                    )}
                    {"message" in selectedLead && selectedLead.message && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                          <FileText className="w-3 h-3" />
                          Bericht
                        </Label>
                        <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg">
                          {selectedLead.message}
                        </p>
                      </div>
                    )}
                    {"photo_urls" in selectedLead && selectedLead.photo_urls && selectedLead.photo_urls.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                          <ImageIcon className="w-3 h-3" />
                          Foto's ({selectedLead.photo_urls.length})
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedLead.photo_urls.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Foto ${idx + 1}`}
                              className="rounded-lg border border-border w-full h-auto"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Admin Notes */}
                <div>
                  <Label htmlFor="admin-notes" className="mb-2 block">
                    Admin Notities
                  </Label>
                  <Textarea
                    id="admin-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Voeg interne notities toe..."
                    rows={4}
                    className="mb-2"
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      updateLeadNotes(
                        selectedLead.id,
                        selectedLead.source === "configurator" ? "submissions" : "contact_requests"
                      )
                    }
                  >
                    Notities Opslaan
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;

