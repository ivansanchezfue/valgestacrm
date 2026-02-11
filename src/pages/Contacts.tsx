import { motion } from "framer-motion";
import { useState } from "react";
import { Search, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import CreateContactDialog from "@/components/dialogs/CreateContactDialog";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import { toast } from "sonner";

const channelLabels: Record<string, { label: string; style: string }> = {
  email: { label: "Email", style: "bg-info/10 text-info" },
  whatsapp: { label: "WhatsApp", style: "bg-success/10 text-success" },
  telegram: { label: "Telegram", style: "bg-primary/10 text-primary" },
  phone: { label: "Teléfono", style: "bg-muted text-muted-foreground" },
};

const Contacts = () => {
  const [search, setSearch] = useState("");
  const [editContact, setEditContact] = useState<any>(null);

  const { data: contacts = [], isLoading } = useSupabaseQuery<any>("contacts");
  const { data: clients = [] } = useSupabaseQuery<any>("clients");
  const insertMutation = useSupabaseInsert("contacts");
  const updateMutation = useSupabaseUpdate("contacts");
  const deleteMutation = useSupabaseDelete("contacts");
  const { user } = useAuth();

  const filtered = contacts.filter((c: any) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  // Build client name lookup
  const clientMap = Object.fromEntries((clients || []).map((c: any) => [c.id, c.name]));

  const handleCreate = async (form: any) => {
    await insertMutation.mutateAsync({ ...form, created_by: user?.id });
    toast.success("Contacto creado");
  };

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast.success("Contacto eliminado");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contactos</h1>
          <p className="text-muted-foreground mt-1">{contacts.length} contactos</p>
        </div>
        <CreateContactDialog onCreated={handleCreate} clients={clients} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar contactos..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contact: any) => (
            <motion.div key={contact.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 card-hover">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground shrink-0">
                  {contact.first_name?.[0]}{contact.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{contact.first_name} {contact.last_name}</p>
                  {contact.position && <p className="text-xs text-muted-foreground">{contact.position}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className={`text-[10px] shrink-0 ${channelLabels[contact.preferred_channel]?.style}`}>
                    {channelLabels[contact.preferred_channel]?.label}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditContact(contact)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(contact.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <p className="text-muted-foreground truncate">{contact.email}</p>
                <p className="text-muted-foreground">{contact.phone}</p>
                {contact.client_id && clientMap[contact.client_id] && (
                  <p className="text-xs text-accent font-medium mt-2">{clientMap[contact.client_id]}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <EditContactDialog
        contact={editContact}
        open={!!editContact}
        onOpenChange={(open) => !open && setEditContact(null)}
        onSave={handleUpdate}
        clients={clients}
      />
    </motion.div>
  );
};

export default Contacts;
