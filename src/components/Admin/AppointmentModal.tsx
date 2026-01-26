import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContactSearchSelect } from "./ContactSearchSelect";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, Check, Clock, Send } from "lucide-react";

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  appointment_type: string;
  date: string;
  time: string | null;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  contact_id: string | null;
  follow_up_sent?: boolean;
  created_at: string;
  updated_at: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  type: "lead" | "klant";
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  appointment?: Appointment | null;
  defaultDate?: string;
}

export const AppointmentModal = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  defaultDate,
}: AppointmentModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);
  const [followUpSent, setFollowUpSent] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    appointment_type: "afspraak",
    date: "",
    time: "",
    status: "gepland",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    address: "",
  });

  // Initialize form when modal opens or appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        title: appointment.title || "",
        description: appointment.description || "",
        appointment_type: appointment.appointment_type || "afspraak",
        date: appointment.date || "",
        time: appointment.time?.slice(0, 5) || "", // Format HH:mm
        status: appointment.status || "gepland",
        customer_name: appointment.customer_name || "",
        customer_email: appointment.customer_email || "",
        customer_phone: appointment.customer_phone || "",
        address: appointment.address || "",
      });
      // If appointment has contact data, set it
      if (appointment.customer_name && appointment.customer_email) {
        setSelectedContact({
          id: appointment.contact_id || "",
          name: appointment.customer_name,
          email: appointment.customer_email,
          phone: appointment.customer_phone || undefined,
          address: appointment.address || undefined,
          type: appointment.contact_id ? "klant" : "lead",
        });
      } else {
        setSelectedContact(null);
      }
      setFollowUpSent(appointment.follow_up_sent || false);
    } else {
      // Reset form for new appointment
      setFormData({
        title: "",
        description: "",
        appointment_type: "afspraak",
        date: defaultDate || "",
        time: "",
        status: "gepland",
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        address: "",
      });
      setSelectedContact(null);
    }
  }, [appointment, defaultDate, isOpen]);

  // Handle contact selection
  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData((prev) => ({
        ...prev,
        customer_name: contact.name,
        customer_email: contact.email,
        customer_phone: contact.phone || "",
        address: contact.address || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        address: "",
      }));
    }
  };

  const handleSendReviewRequest = async () => {
    if (!appointment?.id) return;

    setSendingReview(true);
    try {
      const { error } = await supabase.functions.invoke("notify-follow-up-service", {
        body: { appointment_id: appointment.id }
      });

      if (error) throw error;

      toast({
        title: "Review verzoek verstuurd",
        description: "De klant heeft een review verzoek ontvangen.",
      });
      
      setFollowUpSent(true);
      onSave(); // Refresh parent list
    } catch (error: any) {
      console.error("Error sending review request:", error);
      toast({
        title: "Fout bij versturen",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setSendingReview(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Titel verplicht",
        description: "Vul een titel in voor de afspraak",
        variant: "destructive",
      });
      return;
    }

    if (!formData.date) {
      toast({
        title: "Datum verplicht",
        description: "Selecteer een datum voor de afspraak",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const appointmentData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        appointment_type: formData.appointment_type,
        date: formData.date,
        time: formData.time || null,
        status: formData.status,
        customer_name: formData.customer_name.trim() || null,
        customer_email: formData.customer_email.trim() || null,
        customer_phone: formData.customer_phone.trim() || null,
        address: formData.address.trim() || null,
        contact_id: selectedContact?.type === "klant" ? selectedContact.id : null,
      };

      if (appointment?.id) {
        // Update existing appointment
        const { error } = await supabase
          .from("appointments")
          .update(appointmentData)
          .eq("id", appointment.id);

        if (error) throw error;

        toast({
          title: "Afspraak bijgewerkt",
          description: "De afspraak is succesvol bijgewerkt",
        });
      } else {
        // Create new appointment
        const { error } = await supabase.from("appointments").insert(appointmentData);

        if (error) throw error;

        toast({
          title: "Afspraak aangemaakt",
          description: "De afspraak is succesvol aangemaakt",
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Fout bij opslaan",
        description: error.message || "Er is een fout opgetreden",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Afspraak Details" : "Nieuwe Afspraak"}
          </DialogTitle>
          <DialogDescription>
            {appointment 
              ? "Bekijk en bewerk de afspraakgegevens hieronder" 
              : "Vul de afspraakgegevens in. Velden met * zijn verplicht."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Status */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gepland">Gepland</SelectItem>
                  <SelectItem value="voltooid">Voltooid</SelectItem>
                  <SelectItem value="geannuleerd">Geannuleerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Bijv. Bezichtiging keuken"
              className="mt-1"
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Datum *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Tijd</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Aanvullende informatie over de afspraak..."
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Customer Section */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-primary mb-4">Klantgegevens (optioneel)</p>

            {/* Contact Search */}
            <div className="mb-4">
              <Label className="mb-2 block">Selecteer bestaande klant</Label>
              <ContactSearchSelect
                onSelect={handleContactSelect}
                selectedContact={selectedContact}
              />
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Of vul handmatig in</span>
              </div>
            </div>

            {/* Manual Entry Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Naam</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, customer_name: e.target.value }))
                  }
                  placeholder="Naam van de klant"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_email: e.target.value }))
                    }
                    placeholder="email@voorbeeld.nl"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Telefoon</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))
                    }
                    placeholder="06 12345678"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Straat 123, 1234 AB Plaats"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Service Review Reminder Section */}
          {formData.status === "voltooid" && appointment && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-primary mb-1">Review verzoek</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {followUpSent ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Review verzoek is verzonden</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Review verzoek wordt automatisch verstuurd na 7 dagen</span>
                      </>
                    )}
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleSendReviewRequest}
                  disabled={followUpSent || sendingReview || !formData.customer_email}
                  className={followUpSent ? "text-green-600 border-green-200 bg-green-50" : ""}
                >
                  {sendingReview ? (
                    <RefreshCw className="w-3 h-3 animate-spin mr-2" />
                  ) : followUpSent ? (
                    <Check className="w-3 h-3 mr-2" />
                  ) : (
                    <Send className="w-3 h-3 mr-2" />
                  )}
                  {followUpSent ? 'Verstuurd' : 'Verstuur nu'}
                </Button>
              </div>
              {!formData.customer_email && (
                <p className="text-xs text-destructive mt-2">
                  * Voeg een emailadres toe om een review verzoek te kunnen sturen.
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Annuleren
            </Button>
            <Button type="submit" disabled={isSaving}>
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

