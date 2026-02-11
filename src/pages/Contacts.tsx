import { motion } from "framer-motion";
import { useState } from "react";
import { Search } from "lucide-react";
import { contacts as initialContacts, ContactPerson } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CreateContactDialog from "@/components/dialogs/CreateContactDialog";

const channelLabels: Record<string, { label: string; style: string }> = {
  email: { label: "Email", style: "bg-info/10 text-info" },
  whatsapp: { label: "WhatsApp", style: "bg-success/10 text-success" },
  telegram: { label: "Telegram", style: "bg-primary/10 text-primary" },
  phone: { label: "Teléfono", style: "bg-muted text-muted-foreground" },
};

const Contacts = () => {
  const [contactList, setContactList] = useState<ContactPerson[]>(initialContacts);
  const [search, setSearch] = useState("");

  const filtered = contactList.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-muted-foreground mt-1">{contactList.length} contactos</p>
        </div>
        <CreateContactDialog onCreated={(c) => setContactList([...contactList, c])} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contactos..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <motion.div key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 card-hover cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground shrink-0">
                {contact.firstName[0]}{contact.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{contact.firstName} {contact.lastName}</p>
                {contact.position && <p className="text-xs text-muted-foreground">{contact.position}</p>}
              </div>
              <Badge variant="secondary" className={`text-[10px] shrink-0 ${channelLabels[contact.preferredChannel]?.style}`}>
                {channelLabels[contact.preferredChannel]?.label}
              </Badge>
            </div>
            <div className="mt-4 space-y-1.5 text-sm">
              <p className="text-muted-foreground truncate">{contact.email}</p>
              <p className="text-muted-foreground">{contact.phone}</p>
              {contact.clientName && <p className="text-xs text-accent font-medium mt-2">{contact.clientName}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Contacts;