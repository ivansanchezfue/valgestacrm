import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditServiceDialogProps {
  service: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

const EditServiceDialog = ({ service, open, onOpenChange, onSave }: EditServiceDialogProps) => {
  const [form, setForm] = useState({ name: "", description: "", price: "", type: "unico", cycle: "mensual", tax_rate: "21", status: "activo" });

  useEffect(() => {
    if (service) {
      setForm({ name: service.name || "", description: service.description || "", price: String(service.price || ""), type: service.type || "unico", cycle: service.cycle || "mensual", tax_rate: String(service.tax_rate || "21"), status: service.status || "activo" });
    }
  }, [service]);

  const handleSave = () => {
    if (!form.name.trim() || !form.price) { toast.error("Nombre y precio obligatorios"); return; }
    onSave({ id: service.id, ...form, price: Number(form.price), tax_rate: Number(form.tax_rate), cycle: form.type === "recurrente" ? form.cycle : null });
    onOpenChange(false);
    toast.success("Servicio actualizado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Servicio</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Descripción</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Precio (€) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            <div className="space-y-2"><Label>IVA (%)</Label><Input type="number" value={form.tax_rate} onChange={e => setForm({ ...form, tax_rate: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unico">Único</SelectItem><SelectItem value="recurrente">Recurrente</SelectItem></SelectContent></Select>
            </div>
            {form.type === "recurrente" && (
              <div className="space-y-2">
                <Label>Ciclo</Label>
                <Select value={form.cycle} onValueChange={v => setForm({ ...form, cycle: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mensual">Mensual</SelectItem><SelectItem value="anual">Anual</SelectItem></SelectContent></Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="activo">Activo</SelectItem><SelectItem value="inactivo">Inactivo</SelectItem></SelectContent></Select>
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

export default EditServiceDialog;
