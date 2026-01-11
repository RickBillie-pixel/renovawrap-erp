import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Search, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  type: "lead" | "klant";
  source?: string;
}

interface ContactSearchSelectProps {
  onSelect: (contact: Contact | null) => void;
  selectedContact?: Contact | null;
  className?: string;
}

export const ContactSearchSelect = ({
  onSelect,
  selectedContact,
  className,
}: ContactSearchSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search contacts when query changes
  useEffect(() => {
    const searchContacts = async () => {
      if (!searchQuery.trim()) {
        setContacts([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = `%${searchQuery}%`;

        // Fetch customers
        const { data: customers, error: customersError } = await supabase
          .from("customers")
          .select("id, name, email, phone, address")
          .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
          .limit(10);

        if (customersError) throw customersError;

        // Fetch configurator leads (submissions)
        const { data: submissions, error: submissionsError } = await supabase
          .from("submissions")
          .select("id, name, email, address")
          .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(10);

        if (submissionsError) throw submissionsError;

        // Fetch contact form leads
        const { data: contactRequests, error: contactError } = await supabase
          .from("contact_requests")
          .select("id, name, email, phone")
          .or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`)
          .limit(10);

        if (contactError) throw contactError;

        // Combine and deduplicate by email
        const allContacts: Contact[] = [];
        const seenEmails = new Set<string>();

        // Add customers first (they take priority)
        (customers || []).forEach((c) => {
          if (!seenEmails.has(c.email.toLowerCase())) {
            seenEmails.add(c.email.toLowerCase());
            allContacts.push({
              id: c.id,
              name: c.name,
              email: c.email,
              phone: c.phone || undefined,
              address: c.address || undefined,
              type: "klant",
            });
          }
        });

        // Add leads from submissions
        (submissions || []).forEach((s) => {
          if (!seenEmails.has(s.email.toLowerCase())) {
            seenEmails.add(s.email.toLowerCase());
            allContacts.push({
              id: s.id,
              name: s.name,
              email: s.email,
              address: s.address || undefined,
              type: "lead",
              source: "configurator",
            });
          }
        });

        // Add leads from contact requests
        (contactRequests || []).forEach((cr) => {
          if (!seenEmails.has(cr.email.toLowerCase())) {
            seenEmails.add(cr.email.toLowerCase());
            allContacts.push({
              id: cr.id,
              name: cr.name,
              email: cr.email,
              phone: cr.phone || undefined,
              type: "lead",
              source: "contact_form",
            });
          }
        });

        setContacts(allContacts);
      } catch (error) {
        console.error("Error searching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContacts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelect = (contact: Contact) => {
    onSelect(contact);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery("");
  };

  // If a contact is selected, show it
  if (selectedContact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-lg",
          className
        )}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground truncate">{selectedContact.name}</div>
          <div className="text-sm text-muted-foreground truncate">{selectedContact.email}</div>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
            selectedContact.type === "klant"
              ? "bg-green-500/10 text-green-600 border border-green-500/20"
              : "bg-orange-500/10 text-orange-600 border border-orange-500/20"
          )}
        >
          {selectedContact.type === "klant" ? "Klant" : "Lead"}
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="p-1 hover:bg-secondary rounded transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Zoek op naam of email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {/* Dropdown */}
      {isOpen && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Zoeken...</div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Geen resultaten gevonden
            </div>
          ) : (
            <ul className="py-1">
              {contacts.map((contact) => (
                <li key={`${contact.type}-${contact.id}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(contact)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{contact.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{contact.email}</div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                        contact.type === "klant"
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                      )}
                    >
                      {contact.type === "klant" ? "Klant" : "Lead"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

