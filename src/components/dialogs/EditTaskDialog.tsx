import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";

interface EditTaskDialogProps {
  task: any;
  clients?: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

const EditTaskDialog = ({ task, clients = [], open, onOpenChange, onSave }: EditTaskDialogProps) => {
  const [clientSearch, setClientSearch] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "media", assignee: "", client_id: "", observations: "",
  });
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const { data: profiles = [] } = useSupabaseQuery<any>("profiles");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "media",
        assignee: task.assignee || "",
        client_id: task.client_id || "",
        observations: task.observations || "",
      });
      setDueDate(task.due_date ? parseISO(task.due_date) : undefined);
    }
  }, [task]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      id: task.id,
      ...form,
      client_id: form.client_id || null,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
    });
    onOpenChange(false);
  };

  const selectedClient = clients.find((c: any) => c.id === form.client_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar Tarea</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>Observaciones</Label>
            <Textarea rows={3} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} placeholder="Observaciones adicionales sobre la tarea..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                  <SelectItem value="media">🟡 Media</SelectItem>
                  <SelectItem value="baja">🟢 Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha límite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Asignar a usuario</Label>
              <Select value={form.assignee} onValueChange={v => setForm({ ...form, assignee: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                <SelectContent>
                  {profiles.map((p: any) => (
                    <SelectItem key={p.id} value={p.full_name || p.email}>{p.full_name || p.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cliente</Label>
              <Popover open={clientSearch} onOpenChange={setClientSearch}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !form.client_id && "text-muted-foreground")}>
                    {selectedClient ? selectedClient.name : "Buscar cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0 pointer-events-auto" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró cliente.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem value="" onSelect={() => { setForm({ ...form, client_id: "" }); setClientSearch(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", !form.client_id ? "opacity-100" : "opacity-0")} />
                          Sin cliente
                        </CommandItem>
                        {clients.map((c: any) => (
                          <CommandItem key={c.id} value={c.name} onSelect={() => { setForm({ ...form, client_id: c.id }); setClientSearch(false); }}>
                            <Check className={cn("mr-2 h-4 w-4", form.client_id === c.id ? "opacity-100" : "opacity-0")} />
                            {c.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar cambios</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
