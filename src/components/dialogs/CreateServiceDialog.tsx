import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateServiceDialogProps {
  onCreated?: (service: any) => void;
}

const CreateServiceDialog = ({ onCreated }: CreateServiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", price: "", type: "unico" as string, cycle: "mensual" as string, taxRate: "21",
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Nombre y precio son obligatorios");
      return;
    }
    onCreated?.({ ...form, id: Date.now().toString(), price: Number(form.price), taxRate: Number(form.taxRate), currency: "EUR", status: "activo" });
    setForm({ name: "", description: "", price: "", type: "unico", cycle: "mensual", taxRate: "21" });
    setOpen(false);
    toast.success("Servicio creado correctamente");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo Servicio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nuevo Servicio</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre del servicio" /></div>
          <div className="space-y-2"><Label>Descripción</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Precio (€) *</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" /></div>
            <div className="space-y-2"><Label>IVA (%)</Label><Input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unico">Único</SelectItem>
                  <SelectItem value="recurrente">Recurrente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === "recurrente" && (
              <div className="space-y-2">
                <Label>Ciclo</Label>
                <Select value={form.cycle} onValueChange={v => setForm({ ...form, cycle: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Crear Servicio</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceDialog;