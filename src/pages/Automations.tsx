import { motion } from "framer-motion";
import { Zap, Plus, ArrowRight, Mail, MessageSquare, CheckSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const triggerIcons: Record<string, any> = {
  new_lead: Zap,
  service_renewal: Calendar,
  no_response: MessageSquare,
  task_overdue: CheckSquare,
};

const actionIcons: Record<string, any> = {
  send_email: Mail,
  create_task: CheckSquare,
  notify: MessageSquare,
  create_event: Calendar,
};

const Automations = () => {
  const { data: automations = [], isLoading } = useSupabaseQuery<any>("automations");
  const insertMutation = useSupabaseInsert("automations");
  const updateMutation = useSupabaseUpdate("automations");
  const { user } = useAuth();

  const handleToggle = async (auto: any) => {
    await updateMutation.mutateAsync({ id: auto.id, is_active: !auto.is_active });
    toast.success(auto.is_active ? "Automatización desactivada" : "Automatización activada");
  };

  const handleCreateDefault = async () => {
    await insertMutation.mutateAsync({
      name: "Nueva automatización",
      description: "Configura el trigger y las acciones",
      trigger_type: "new_lead",
      trigger_config: { event: "new_lead" },
      actions: [{ type: "send_email", config: { template: "welcome" } }],
      is_active: false,
      created_by: user?.id,
    });
    toast.success("Automatización creada");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automatizaciones</h1>
          <p className="text-muted-foreground mt-1">Reglas y flujos automáticos</p>
        </div>
        <Button className="gap-2" onClick={handleCreateDefault}>
          <Plus className="h-4 w-4" />Nueva Regla
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : automations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No hay automatizaciones. Crea tu primera regla.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((auto: any) => {
            const TriggerIcon = triggerIcons[auto.trigger_type] || Zap;
            const actions = Array.isArray(auto.actions) ? auto.actions : [];
            return (
              <motion.div key={auto.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent/10 p-2.5"><Zap className="h-5 w-5 text-accent" /></div>
                    <div>
                      <p className="font-semibold text-foreground">{auto.name}</p>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {auto.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </div>
                  <Switch checked={auto.is_active} onCheckedChange={() => handleToggle(auto)} />
                </div>

                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                    <TriggerIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{auto.trigger_type?.replace(/_/g, " ")}</span>
                  </div>
                  {actions.length > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  {actions.map((action: any, i: number) => {
                    const ActionIcon = actionIcons[action.type] || Zap;
                    return (
                      <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                        <ActionIcon className="h-4 w-4 text-accent" />
                        <span className="text-foreground">{action.type?.replace(/_/g, " ")}</span>
                      </div>
                    );
                  })}
                </div>

                {auto.description && <p className="text-sm text-muted-foreground mt-3">{auto.description}</p>}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Automations;
