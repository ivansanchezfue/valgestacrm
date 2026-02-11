import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseQuery, useSupabaseInsert } from "@/hooks/useSupabaseData";

interface AssignServiceDialogProps {
  clientId: string;
  clientName: string;
}

const AssignServiceDialog = ({ clientId, clientName }: AssignServiceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [priceOverride, setPriceOverride] = useState("");
  const [discount, setDiscount] = useState("0");

  const { data: services } = useSupabaseQuery<any>("services", { filters: { status: "activo" } });
  const insertMutation = useSupabaseInsert("customer_services");

  const handleSave = async () => {
    if (!serviceId) { toast.error("Selecciona un servicio"); return; }
    await insertMutation.mutateAsync({
      client_id: clientId,
      service_id: serviceId,
      price_override: priceOverride ? Number(priceOverride) : null,
      discount: Number(discount),
      status: "activo",
    });
    setOpen(false);
    setServiceId("");
    setPriceOverride("");
    setDiscount("0");
    toast.success("Servicio asignado al cliente");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><Link2 className="h-3.5 w-3.5" />Asignar Servicio</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Asignar Servicio a {clientName}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Servicio *</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger>
              <SelectContent>
                {services?.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name} — €{Number(s.price).toLocaleString()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Precio especial (€)</Label><Input type="number" value={priceOverride} onChange={e => setPriceOverride(e.target.value)} placeholder="Dejar vacío = precio base" /></div>
            <div className="space-y-2"><Label>Descuento (%)</Label><Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={insertMutation.isPending}>Asignar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignServiceDialog;
