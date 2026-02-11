import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EditContactDialogProps {
  contact: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  clients?: any[];
}

const EditContactDialog = ({ contact, open, onOpenChange, onSave, clients = [] }: EditContactDialogProps) => {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", position: "", preferred_channel: "email", client_id: "" });

  useEffect(() => {
    if (contact) {
      setForm({ first_name: contact.first_name || "", last_name: contact.last_name || "", email: contact.email || "", phone: contact.phone || "", position: contact.position || "", preferred_channel: contact.preferred_channel || "email", client_id: contact.client_id || "" });
    }
  }, [contact]);

  const handleSave = () => {
    if (!form.first_name.trim() || !form.email.trim()) { toast.error("Nombre y email obligatorios"); return; }
    onSave({ id: contact.id, ...form, client_id: form.client_id || null });
    onOpenChange(false);
    toast.success("Contacto actualizado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Contacto</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nombre *</Label><Input value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Apellidos</Label><Input value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Cargo</Label><Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Canal preferido</Label>
              <Select value={form.preferred_channel} onValueChange={v => setForm({ ...form, preferred_channel: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="email">Email</SelectItem><SelectItem value="whatsapp">WhatsApp</SelectItem><SelectItem value="telegram">Telegram</SelectItem><SelectItem value="phone">Teléfono</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Cliente asociado</Label>
              <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sin cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin cliente</SelectItem>
                  {clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditContactDialog;
