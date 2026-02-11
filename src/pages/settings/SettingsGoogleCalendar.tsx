import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const SettingsGoogleCalendar = () => {
  const [connected, setConnected] = useState(true);
  const [syncTasks, setSyncTasks] = useState(true);
  const [syncRenewals, setSyncRenewals] = useState(true);
  const [defaultCalendar, setDefaultCalendar] = useState("primary");

  const handleConnect = () => {
    toast.info("Redirigiendo a Google para autorización...");
  };

  const handleSync = () => {
    toast.success("Sincronización manual iniciada");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Google Calendar</h1>
        <p className="text-muted-foreground mt-1">Sincronización de eventos y tareas</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2.5"><Calendar className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="font-semibold text-foreground">Google Calendar</p>
              {connected ? (
                <div className="flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">Conectado · admin@valgesta.com</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No conectado</span>
              )}
            </div>
          </div>
          {connected ? (
            <Button variant="outline" size="sm" className="gap-2" onClick={handleSync}>
              <RefreshCw className="h-3.5 w-3.5" />Sincronizar
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect}>Conectar</Button>
          )}
        </div>
      </div>

      {connected && (
        <div className="bg-card rounded-xl border p-6 space-y-5">
          <h3 className="font-semibold text-foreground">Opciones de sincronización</h3>

          <div className="space-y-2">
            <Label>Calendario predeterminado</Label>
            <Select value={defaultCalendar} onValueChange={setDefaultCalendar}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Calendario principal</SelectItem>
                <SelectItem value="work">Trabajo</SelectItem>
                <SelectItem value="crm">ValgestaCRM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sincronizar tareas tipo reunión</p>
                <p className="text-xs text-muted-foreground">Crear evento en Calendar al crear tarea de tipo reunión</p>
              </div>
              <Switch checked={syncTasks} onCheckedChange={setSyncTasks} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Recordatorios de renovación</p>
                <p className="text-xs text-muted-foreground">Crear recordatorio cuando un servicio esté próximo a vencer</p>
              </div>
              <Switch checked={syncRenewals} onCheckedChange={setSyncRenewals} />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={() => toast.success("Configuración guardada")}>Guardar</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SettingsGoogleCalendar;