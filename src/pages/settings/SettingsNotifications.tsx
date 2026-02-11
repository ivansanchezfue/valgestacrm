import { motion } from "framer-motion";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const notifOptions = [
  { key: "email_new_lead", label: "Nuevo lead", desc: "Notificar cuando se cree un nuevo lead", email: true, push: true, inapp: true },
  { key: "email_task_due", label: "Tarea vencida", desc: "Cuando una tarea alcanza su fecha límite", email: true, push: true, inapp: true },
  { key: "email_message", label: "Mensaje nuevo", desc: "Al recibir un mensaje en el inbox", email: false, push: true, inapp: true },
  { key: "email_renewal", label: "Renovación próxima", desc: "Cuando un servicio está por vencer", email: true, push: false, inapp: true },
];

const SettingsNotifications = () => {
  const [prefs, setPrefs] = useState(notifOptions);

  const toggle = (idx: number, channel: "email" | "push" | "inapp") => {
    setPrefs(prev => prev.map((p, i) => i === idx ? { ...p, [channel]: !p[channel] } : p));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
        <p className="text-muted-foreground mt-1">Configura tus alertas y avisos</p>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 p-4 border-b bg-muted/50 text-xs font-semibold text-muted-foreground">
          <span>Evento</span>
          <span className="text-center">Email</span>
          <span className="text-center">Push</span>
          <span className="text-center">App</span>
        </div>
        {prefs.map((opt, idx) => (
          <div key={opt.key} className="grid grid-cols-[1fr_60px_60px_60px] gap-2 p-4 border-b last:border-0 items-center">
            <div>
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
            <div className="flex justify-center"><Switch checked={opt.email} onCheckedChange={() => toggle(idx, "email")} /></div>
            <div className="flex justify-center"><Switch checked={opt.push} onCheckedChange={() => toggle(idx, "push")} /></div>
            <div className="flex justify-center"><Switch checked={opt.inapp} onCheckedChange={() => toggle(idx, "inapp")} /></div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Preferencias guardadas")}>Guardar preferencias</Button>
      </div>
    </motion.div>
  );
};

export default SettingsNotifications;