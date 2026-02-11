import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface EditClientDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

const EditClientDialog = ({ client, open, onOpenChange, onSave }: EditClientDialogProps) => {
  const [form, setForm] = useState({ name: "", type: "empresa", email: "", phone: "", status: "lead", sector: "", owner: "" });

  useEffect(() => {
    if (client) {
      setForm({ name: client.name || "", type: client.type || "empresa", email: client.email || "", phone: client.phone || "", status: client.status || "lead", sector: client.sector || "", owner: client.owner || "" });
    }
  }, [client]);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Nombre y email obligatorios"); return; }
    onSave({ id: client.id, ...form });
    onOpenChange(false);
    toast.success("Cliente actualizado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2"><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="empresa">Empresa</SelectItem><SelectItem value="particular">Particular</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lead">Lead</SelectItem><SelectItem value="activo">Activo</SelectItem><SelectItem value="inactivo">Inactivo</SelectItem></SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sector</Label><Input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} /></div>
            <div className="space-y-2"><Label>Responsable</Label><Input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} /></div>
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

export default EditClientDialog;
