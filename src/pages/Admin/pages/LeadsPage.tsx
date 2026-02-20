import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Calendar, Image as ImageIcon, FileText, Filter, RefreshCw, Eye, Trash2, Euro, MoreVertical, UserPlus, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { nl } from "date-fns/locale/nl";

/** Maakt van een objectkey een leesbaar label (bijv. "selected_option" → "Selected option") */
function formatWizardKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/** Waarde uit wizard_data netjes weergeven (geen raw JSON) */
function formatWizardValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Ja" : "Nee";
  if (typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "—";
    return (
      <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
        {entries.map(([k, v]) => (
          <li key={k}>
            <span className="text-muted-foreground">{formatWizardKey(k)}:</span>{" "}
            {formatWizardValue(v)}
          </li>
        ))}
      </ul>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return (
      <ul className="list-disc list-inside space-y-0.5 text-sm">
        {value.map((item, i) => (
          <li key={i}>{formatWizardValue(item)}</li>
        ))}
      </ul>
    );
  }
  return String(value);
}

/** Wizard data als overzichtelijke velden i.p.v. JSON */
function WizardDataDisplay({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([_, v]) => v !== undefined && v !== null && (typeof v !== "string" || v !== "")
  );
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">Geen gegevens</p>;
  return (
    <div className="grid gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="border-b border-border/50 pb-2 last:border-0 last:pb-0">
          <div className="text-xs font-medium text-muted-foreground mb-0.5">
            {formatWizardKey(key)}
          </div>
          <div className="text-sm text-foreground">{formatWizardValue(value)}</div>
        </div>
      ))}
    </div>
  );
}

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

interface AdSubmissionLead {
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
  source: "ad_submission";
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

interface KeuzehulpLead {
  id: string;
  created_at: string;
  updated_at: string;
  service_slug: string;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  contact_address: string | null;
  wizard_data: Record<string, unknown>;
  status: string;
  notes: string | null;
  configurator_submission_id: string | null;
  foto_urls: string[] | null;
  source: "keuzehulp";
}

type Lead = ConfiguratorLead | AdSubmissionLead | ContactLead | KeuzehulpLead;

function getLeadDisplayName(lead: Lead): string {
  if (lead.source === "keuzehulp") return lead.contact_name || lead.contact_email || "—";
  return lead.name;
}
function getLeadDisplayEmail(lead: Lead): string {
  if (lead.source === "keuzehulp") return lead.contact_email;
  return lead.email;
}
function getLeadTableName(lead: Lead): string {
  switch (lead.source) {
    case "configurator": return "submissions";
    case "contact_form": return "contact_requests";
    case "ad_submission": return "ad_submissions";
    case "keuzehulp": return "keuzehulp_submissions";
    default: return "contact_requests";
  }
}
function getLeadNotesField(lead: Lead): "admin_notes" | "notes" {
  return lead.source === "keuzehulp" ? "notes" : "admin_notes";
}

export const LeadsPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      // Fetch configurator submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (submissionsError) throw submissionsError;

      // Fetch total usage count from tracking table (this never decreases, even if items are deleted)
      const { count: totalUsage, error: usageError } = await supabase
        .from("configurator_usage_tracking")
        .select("*", { count: "exact", head: true });

      if (usageError) throw usageError;

      // Calculate total cost based on usage tracking (€0.15 per usage)
      setTotalCost((totalUsage || 0) * 0.15);

      // Fetch contact requests
      const { data: contacts, error: contactsError } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (contactsError) throw contactsError;

      // Fetch ad submissions
      const { data: adSubmissions, error: adSubmissionsError } = await supabase
        .from("ad_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (adSubmissionsError) throw adSubmissionsError;

      // Combine and format leads
      const configuratorLeads: ConfiguratorLead[] = (submissions || []).map((s) => ({
        ...s,
        source: "configurator" as const,
      }));

      const contactLeads: ContactLead[] = (contacts || []).map((c) => ({
        ...c,
        source: "contact_form" as const,
      }));

      const adLeads: AdSubmissionLead[] = (adSubmissions || []).map((a) => ({
        ...a,
        source: "ad_submission" as const,
      }));

      let keuzehulpSubmissions: KeuzehulpLead[] = [];
      const { data: keuzehulpData, error: keuzehulpError } = await supabase
        .from("keuzehulp_submissions")
        .select("id, created_at, updated_at, service_slug, contact_name, contact_email, contact_phone, contact_address, wizard_data, status, notes, configurator_submission_id, foto_urls")
        .order("created_at", { ascending: false });
      if (!keuzehulpError && keuzehulpData) {
        keuzehulpSubmissions = keuzehulpData.map((row) => ({
          ...row,
          wizard_data: row.wizard_data ?? {},
          foto_urls: row.foto_urls ?? null,
          source: "keuzehulp" as const,
        }));
      }

      const allLeads = [...configuratorLeads, ...contactLeads, ...adLeads, ...keuzehulpSubmissions].sort(
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

  const updateLeadNotes = async (leadId: string, tableName: string, notesField: "admin_notes" | "notes") => {
    try {
      const { error } = await supabase
        .from(tableName)
        .update({ [notesField]: notes })
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

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const deleteLead = async () => {
    if (!leadToDelete) return;

    const leadId = leadToDelete.id;
    setIsDeleting(true);
    setDeletingLeadId(leadId);

    // Optimistic update: verwijder direct uit state voor naadloze UI
    const previousLeads = [...leads];
    const previousFilteredLeads = [...filteredLeads];

    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    setFilteredLeads((prev) => prev.filter((lead) => lead.id !== leadId));

    // Sluit dialogs direct voor betere UX
    setDeleteDialogOpen(false);
    // Sluit detail dialog als deze open is voor dezelfde lead
    if (selectedLead?.id === leadId) {
      setIsDetailOpen(false);
      setSelectedLead(null);
    }
    const leadToDeleteBackup = leadToDelete;
    setLeadToDelete(null);

    try {
      const tableName = getLeadTableName(leadToDeleteBackup);

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", leadId);

      if (error) throw error;

      toast({
        title: "Lead verwijderd",
        description: "De lead is succesvol verwijderd",
      });
    } catch (error: any) {
      console.error("Error deleting lead:", error);

      // Rollback: herstel de state als het misgaat
      setLeads(previousLeads);
      setFilteredLeads(previousFilteredLeads);

      toast({
        title: "Fout bij verwijderen",
        description: error.message || "De lead kon niet worden verwijderd. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingLeadId(null);
    }
  };

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    const notesValue = lead.source === "keuzehulp" ? lead.notes : lead.admin_notes;
    setNotes(notesValue ?? "");
    setIsDetailOpen(true);
  };

  const convertToCustomer = async (lead: Lead) => {
    setConvertingLeadId(lead.id);
    try {
      // Prepare customer data from lead
      const customerData: any = {
        name: getLeadDisplayName(lead),
        email: getLeadDisplayEmail(lead),
        lead_source: lead.source,
        lead_id: lead.id,
        admin_notes: lead.source === "keuzehulp" ? (lead.notes || "") : (lead.admin_notes || ""),
        status: "active",
      };

      // Add source-specific data
      if (lead.source === "configurator") {
        customerData.address = lead.address;
        customerData.service_details = lead.service_details;
        customerData.color_details = lead.color_details;
        customerData.image_url = lead.image_url;
      } else if (lead.source === "contact_form") {
        customerData.phone = lead.phone;
        customerData.project_type = lead.type;
        customerData.message = lead.message;
        customerData.photo_urls = lead.photo_urls || [];
      } else if (lead.source === "keuzehulp") {
        customerData.phone = lead.contact_phone ?? "";
        customerData.address = lead.contact_address ?? "";
        customerData.admin_notes = (customerData.admin_notes || "") + ` [Keuzehulp: ${lead.service_slug}]`;
      }

      // Insert customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert(customerData)
        .select()
        .single();

      if (customerError) throw customerError;

      // Update lead status to completed
      const tableName = getLeadTableName(lead);
      const completedStatus = lead.source === "keuzehulp" ? "accepted" : "completed";
      await supabase
        .from(tableName)
        .update({ status: completedStatus })
        .eq("id", lead.id);

      toast({
        title: "Lead omgezet naar klant",
        description: `${getLeadDisplayName(lead)} is succesvol omgezet naar klant.`,
      });

      // Refresh leads
      await fetchLeads();
    } catch (error: any) {
      console.error("Error converting lead to customer:", error);
      toast({
        title: "Fout bij omzetten",
        description: error.message || "De lead kon niet worden omgezet. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setConvertingLeadId(null);
    }
  };

  const handleSendEmail = (lead: Lead) => {
    window.location.href = `mailto:${getLeadDisplayEmail(lead)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "in_progress":
      case "contacted":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "offer_sent":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "completed":
      case "accepted":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "archived":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Nieuw";
      case "in_progress": return "In Behandeling";
      case "completed": return "Afgerond";
      case "contacted": return "Gecontacteerd";
      case "offer_sent": return "Offerte verzonden";
      case "accepted": return "Geaccepteerd";
      case "rejected": return "Afgewezen";
      case "archived": return "Gearchiveerd";
      default: return status;
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "new").length,
    inProgress: leads.filter((l) => l.status === "in_progress").length,
    configurator: leads.filter((l) => l.source === "configurator").length,
    contact: leads.filter((l) => l.source === "contact_form").length,
    adSubmission: leads.filter((l) => l.source === "ad_submission").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-6 gap-4">
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
          <div className="text-2xl font-bold text-teal-600">{stats.adSubmission}</div>
          <div className="text-sm text-muted-foreground">Ad Aanvragen</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="text-2xl font-bold text-foreground">€ {totalCost.toFixed(2).replace('.', ',')}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Euro className="w-3 h-3" />
            Geschatte Kosten
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filters:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Bron" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Bronnen</SelectItem>
                <SelectItem value="configurator">Configurator</SelectItem>
                <SelectItem value="contact_form">Contact Formulier</SelectItem>
                <SelectItem value="ad_submission">Ad Aanvragen</SelectItem>
                <SelectItem value="keuzehulp">Keuzehulp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Statussen</SelectItem>
                <SelectItem value="new">Nieuw</SelectItem>
                <SelectItem value="in_progress">In Behandeling</SelectItem>
                <SelectItem value="completed">Afgerond</SelectItem>
                <SelectItem value="contacted">Gecontacteerd</SelectItem>
                <SelectItem value="offer_sent">Offerte verzonden</SelectItem>
                <SelectItem value="accepted">Geaccepteerd</SelectItem>
                <SelectItem value="rejected">Afgewezen</SelectItem>
                <SelectItem value="archived">Gearchiveerd</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto" onClick={fetchLeads} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Vernieuwen
            </Button>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
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
                <AnimatePresence mode="popLayout">
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{
                        opacity: deletingLeadId === lead.id ? 0 : 1,
                        x: deletingLeadId === lead.id ? -20 : 0,
                        scale: deletingLeadId === lead.id ? 0.98 : 1,
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
                      className={`border-b border-border hover:bg-secondary/30 transition-colors ${deletingLeadId === lead.id ? "pointer-events-none" : ""
                        }`}
                    >
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), "dd MMM yyyy HH:mm", { locale: nl })}
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">{getLeadDisplayName(lead)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{getLeadDisplayEmail(lead)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            lead.source === "configurator"
                              ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                              : lead.source === "contact_form"
                                ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                : lead.source === "ad_submission"
                                  ? "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {lead.source === "configurator"
                            ? "Configurator"
                            : lead.source === "contact_form"
                              ? "Contact"
                              : lead.source === "ad_submission"
                                ? "Ad Aanvragen"
                                : "Keuzehulp"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Select
                          value={lead.status}
                          onValueChange={(value) =>
                            updateLeadStatus(lead.id, value, getLeadTableName(lead))
                          }
                          disabled={updatingStatus === lead.id || deletingLeadId === lead.id || isDeleting}
                        >
                          <SelectTrigger className={`w-[160px] h-8 text-xs ${getStatusColor(lead.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {lead.source === "keuzehulp" ? (
                              <>
                                <SelectItem value="new">Nieuw</SelectItem>
                                <SelectItem value="contacted">Gecontacteerd</SelectItem>
                                <SelectItem value="offer_sent">Offerte verzonden</SelectItem>
                                <SelectItem value="accepted">Geaccepteerd</SelectItem>
                                <SelectItem value="rejected">Afgewezen</SelectItem>
                                <SelectItem value="archived">Gearchiveerd</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="new">Nieuw</SelectItem>
                                <SelectItem value="in_progress">In Behandeling</SelectItem>
                                <SelectItem value="completed">Afgerond</SelectItem>
                                <SelectItem value="archived">Gearchiveerd</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openLeadDetail(lead)}
                            disabled={deletingLeadId === lead.id || convertingLeadId === lead.id || isDeleting}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deletingLeadId === lead.id || convertingLeadId === lead.id || isDeleting}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleSendEmail(lead)}>
                                <Send className="w-4 h-4 mr-2" />
                                Email verzenden
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => convertToCustomer(lead)}
                                disabled={convertingLeadId === lead.id}
                              >
                                {convertingLeadId === lead.id ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <UserPlus className="w-4 h-4 mr-2" />
                                )}
                                Omzetten naar klant
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClick(lead)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
              <p className="text-muted-foreground">Leads laden...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
             <div className="p-8 text-center bg-card border border-border rounded-xl">
              <p className="text-muted-foreground">Geen leads gevonden</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-card border border-border rounded-xl p-4 shadow-sm"
                >
                   <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground mb-1">
                          {format(new Date(lead.created_at), "dd MMM HH:mm", { locale: nl })}
                        </span>
                         <h3 className="font-semibold text-lg">{getLeadDisplayName(lead)}</h3>
                      </div>
                       <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              lead.source === "configurator"
                                ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                : lead.source === "contact_form"
                                  ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                  : lead.source === "ad_submission"
                                    ? "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            }`}
                          >
                            {lead.source === "configurator"
                              ? "Config."
                              : lead.source === "contact_form"
                                ? "Contact"
                                : lead.source === "ad_submission"
                                  ? "Ad San."
                                  : "Keuzeh."}
                       </span>
                   </div>

                   <div className="mb-4 space-y-2">
                      <div className="text-sm text-foreground break-all">
                        <span className="text-muted-foreground mr-2">Email:</span>
                        {getLeadDisplayEmail(lead)}
                      </div>
                      <div className="text-sm flex items-center justify-between">
                         <span className="text-muted-foreground">Status:</span>
                         <Select
                            value={lead.status}
                            onValueChange={(value) =>
                              updateLeadStatus(lead.id, value, getLeadTableName(lead))
                            }
                            disabled={updatingStatus === lead.id || deletingLeadId === lead.id || isDeleting}
                          >
                            <SelectTrigger className={`w-[140px] h-8 text-xs ${getStatusColor(lead.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                           <SelectContent>
                              {lead.source === "keuzehulp" ? (
                                <>
                                  <SelectItem value="new">Nieuw</SelectItem>
                                  <SelectItem value="contacted">Gecontacteerd</SelectItem>
                                  <SelectItem value="offer_sent">Offerte verzonden</SelectItem>
                                  <SelectItem value="accepted">Geaccepteerd</SelectItem>
                                  <SelectItem value="rejected">Afgewezen</SelectItem>
                                  <SelectItem value="archived">Gearchiveerd</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="new">Nieuw</SelectItem>
                                  <SelectItem value="in_progress">In Behandeling</SelectItem>
                                  <SelectItem value="completed">Afgerond</SelectItem>
                                  <SelectItem value="archived">Gearchiveerd</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openLeadDetail(lead)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <MoreVertical className="w-4 h-4 mr-2" />
                            Acties
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => handleSendEmail(lead)}>
                              <Send className="w-4 h-4 mr-2" />
                              Email sturen
                           </DropdownMenuItem>
                           <DropdownMenuItem
                              onClick={() => convertToCustomer(lead)}
                              disabled={convertingLeadId === lead.id}
                            >
                              {convertingLeadId === lead.id ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4 mr-2" />
                              )}
                              Klant maken
                            </DropdownMenuItem>
                             <DropdownMenuItem
                                onClick={() => handleDeleteClick(lead)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Naam</Label>
                  <p className="font-medium text-foreground">{getLeadDisplayName(selectedLead)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {getLeadDisplayEmail(selectedLead)}
                  </p>
                </div>
                {selectedLead.source === "keuzehulp" && selectedLead.contact_phone && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Telefoon</Label>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {selectedLead.contact_phone}
                    </p>
                  </div>
                )}
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

              {/* Keuzehulp: wizard data en overige velden netjes weergegeven */}
              {selectedLead.source === "keuzehulp" && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
                  <Label className="text-sm font-medium text-foreground">Keuzehulp</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Service</Label>
                      <p className="font-medium text-foreground">{selectedLead.service_slug}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <p className="font-medium text-foreground">{getStatusLabel(selectedLead.status)}</p>
                    </div>
                    {selectedLead.contact_address && (
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">Adres</Label>
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {selectedLead.contact_address}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs text-muted-foreground">Laatst bijgewerkt</Label>
                      <p className="font-medium text-foreground">
                        {format(new Date(selectedLead.updated_at), "dd MMM yyyy HH:mm", { locale: nl })}
                      </p>
                    </div>
                    {selectedLead.configurator_submission_id && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Configurator submission</Label>
                        <p className="font-mono text-xs text-foreground truncate" title={selectedLead.configurator_submission_id}>
                          {selectedLead.configurator_submission_id}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedLead.wizard_data && Object.keys(selectedLead.wizard_data).length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">Stappen / antwoorden uit de wizard</Label>
                      <div className="bg-background rounded-lg p-3 border border-border">
                        <WizardDataDisplay data={selectedLead.wizard_data} />
                      </div>
                    </div>
                  )}
                  {selectedLead.foto_urls && selectedLead.foto_urls.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" />
                        Foto's ({selectedLead.foto_urls.length})
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedLead.foto_urls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Foto ${idx + 1}`}
                            className="rounded-lg border border-border w-full h-auto object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                      getLeadTableName(selectedLead),
                      getLeadNotesField(selectedLead)
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lead Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je deze lead wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              {leadToDelete && (
                <div className="mt-2 p-2 bg-secondary/50 rounded text-sm text-foreground">
                  <div className="mb-1"><strong>Naam:</strong> {getLeadDisplayName(leadToDelete)}</div>
                  <div className="mb-1"><strong>Email:</strong> {getLeadDisplayEmail(leadToDelete)}</div>
                  <div><strong>Datum:</strong> {format(new Date(leadToDelete.created_at), "dd MMM yyyy HH:mm", { locale: nl })}</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteLead}
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

