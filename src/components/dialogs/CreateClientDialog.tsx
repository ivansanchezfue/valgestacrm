import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateClientDialogProps {
  onCreated?: (client: any) => void;
}

const CreateClientDialog = ({ onCreated }: CreateClientDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "empresa" as string, email: "", phone: "", status: "lead" as string, sector: "", owner: "",
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Nombre y email son obligatorios");
      return;
    }
    onCreated?.(form);
    setForm({ name: "", type: "empresa", email: "", phone: "", status: "lead", sector: "", owner: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo Cliente</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo Cliente</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2"><Label>Nombre / Razón social *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Empresa S.L." /></div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="empresa">Empresa</SelectItem><SelectItem value="particular">Particular</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="lead">Lead</SelectItem><SelectItem value="activo">Activo</SelectItem><SelectItem value="inactivo">Inactivo</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@empresa.com" /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+34 600 000 000" /></div>
            <div className="space-y-2"><Label>Sector</Label><Input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="Tecnología, Legal..." /></div>
            <div className="space-y-2"><Label>Responsable</Label><Input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} placeholder="Nombre del responsable" /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Crear Cliente</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClientDialog;
