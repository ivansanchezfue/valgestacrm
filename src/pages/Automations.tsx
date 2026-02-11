import { motion } from "framer-motion";
import { Zap, Plus, ArrowRight, Mail, MessageSquare, CheckSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const automations = [
  {
    id: "1",
    name: "Bienvenida a nuevo lead",
    trigger: "Nuevo lead creado",
    actions: ["Enviar email de bienvenida", "Crear tarea de seguimiento"],
    active: true,
    triggerIcon: Zap,
    actionIcons: [Mail, CheckSquare],
  },
  {
    id: "2",
    name: "Recordatorio de renovación",
    trigger: "Servicio a 30 días de vencer",
    actions: ["Notificar al responsable", "Crear evento en calendario"],
    active: true,
    triggerIcon: Calendar,
    actionIcons: [MessageSquare, Calendar],
  },
  {
    id: "3",
    name: "Seguimiento sin respuesta",
    trigger: "Sin respuesta en 48h",
    actions: ["Enviar mensaje de seguimiento"],
    active: false,
    triggerIcon: MessageSquare,
    actionIcons: [Mail],
  },
  {
    id: "4",
    name: "Tarea vencida - escalado",
    trigger: "Tarea vencida",
    actions: ["Notificar al manager", "Reasignar tarea"],
    active: true,
    triggerIcon: CheckSquare,
    actionIcons: [MessageSquare, CheckSquare],
  },
];

const Automations = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automatizaciones</h1>
          <p className="text-muted-foreground mt-1">Reglas y flujos automáticos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Regla
        </Button>
      </div>

      <div className="space-y-4">
        {automations.map((auto) => (
          <motion.div
            key={auto.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border p-5 card-hover"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2.5">
                  <Zap className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{auto.name}</p>
                  <Badge variant="secondary" className="text-[10px] mt-1">
                    {auto.active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              </div>
              <Switch checked={auto.active} />
            </div>

            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                <auto.triggerIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{auto.trigger}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              {auto.actions.map((action, i) => {
                const ActionIcon = auto.actionIcons[i];
                return (
                  <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                    {ActionIcon && <ActionIcon className="h-4 w-4 text-accent" />}
                    <span className="text-foreground">{action}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Automations;
