import { motion } from "framer-motion";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  channel: string;
  subject?: string;
  body: string;
}

const defaultTemplates: Template[] = [
  { id: "1", name: "Bienvenida Lead", channel: "email", subject: "¡Bienvenido a Valgesta!", body: "Hola {{nombre}}, gracias por tu interés en nuestros servicios..." },
  { id: "2", name: "Seguimiento", channel: "whatsapp", body: "Hola {{nombre}}, ¿cómo estás? Queríamos hacer seguimiento de..." },
  { id: "3", name: "Renovación", channel: "email", subject: "Tu servicio está próximo a vencer", body: "Hola {{nombre}}, tu servicio {{servicio}} vence el {{fecha}}..." },
];

const SettingsTemplates = () => {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Template>>({});

  const handleSave = () => {
    if (!form.name || !form.body || !form.channel) return;
    const newT: Template = { id: Date.now().toString(), name: form.name, channel: form.channel, subject: form.subject, body: form.body };
    setTemplates([...templates, newT]);
    setForm({});
    setOpen(false);
    toast.success("Plantilla creada");
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Plantilla eliminada");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plantillas</h1>
          <p className="text-muted-foreground mt-1">Plantillas de email y mensajes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Nueva Plantilla</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva plantilla</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Bienvenida" /></div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={form.channel} onValueChange={v => setForm({ ...form, channel: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar canal" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.channel === "email" && (
                <div className="space-y-2"><Label>Asunto</Label><Input value={form.subject || ""} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
              )}
              <div className="space-y-2"><Label>Cuerpo</Label><Textarea rows={5} value={form.body || ""} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Usa {{nombre}}, {{servicio}}, {{fecha}} como variables" /></div>
              <div className="flex justify-end"><Button onClick={handleSave}>Guardar</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {templates.map(t => (
          <div key={t.id} className="bg-card rounded-xl border p-5 flex items-start gap-4">
            <div className="rounded-lg bg-muted p-2.5 shrink-0"><FileText className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-foreground">{t.name}</p>
                <Badge variant="secondary" className="text-[10px] capitalize">{t.channel}</Badge>
              </div>
              {t.subject && <p className="text-xs text-muted-foreground mt-1">Asunto: {t.subject}</p>}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
            </div>
            <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SettingsTemplates;