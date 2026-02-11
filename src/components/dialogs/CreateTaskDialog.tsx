import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskDialogProps {
  onCreated?: (task: any) => void;
  clients?: any[];
}

const CreateTaskDialog = ({ onCreated, clients = [] }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "media" as string, assignee: "", due_date: "", client_id: "",
  });

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    onCreated?.({ ...form, status: "pendiente", client_id: form.client_id || null, due_date: form.due_date || null });
    setForm({ title: "", description: "", priority: "media", assignee: "", due_date: "", client_id: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nueva Tarea</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nueva Tarea</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Título *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título de la tarea" /></div>
          <div className="space-y-2"><Label>Descripción</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Fecha límite</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Asignado a</Label><Input value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })} placeholder="Nombre" /></div>
            <div className="space-y-2">
              <Label>Cliente</Label>
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Crear Tarea</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;
