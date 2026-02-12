import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Plus, ArrowRight, Mail, MessageSquare, CheckSquare, Calendar, Search, MoreHorizontal, Pencil, Copy, Trash2, Play, Tag, UserCheck, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EditAutomationDialog from "@/components/dialogs/EditAutomationDialog";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog";

const triggerLabels: Record<string, string> = {
  new_lead: "Nuevo lead", status_change: "Cambio estado", service_renewal: "Renovación",
  service_expired: "Servicio vencido", task_overdue: "Tarea vencida", task_completed: "Tarea completada",
  no_response: "Sin respuesta", scheduled: "Programada", manual: "Manual",
};

const actionIcons: Record<string, any> = {
  send_email: Mail, send_bulk_email: Send, create_task: CheckSquare, create_event: Calendar,
  notify: MessageSquare, send_whatsapp: MessageSquare, send_telegram: MessageSquare,
  update_status: UserCheck, add_tag: Tag, wait: Clock,
};

const actionLabels: Record<string, string> = {
  send_email: "Email", send_bulk_email: "Email masivo", create_task: "Tarea",
  create_event: "Evento", notify: "Notificación", send_whatsapp: "WhatsApp",
  send_telegram: "Telegram", update_status: "Cambiar estado", add_tag: "Etiqueta", wait: "Espera",
};

const Automations = () => {
  const { data: automations = [], isLoading } = useSupabaseQuery<any>("automations");
  const insertMutation = useSupabaseInsert("automations");
  const updateMutation = useSupabaseUpdate("automations");
  const deleteMutation = useSupabaseDelete("automations");
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [editAuto, setEditAuto] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = automations.filter((a: any) =>
    !searchQuery.trim() || a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (auto: any) => {
    await updateMutation.mutateAsync({ id: auto.id, is_active: !auto.is_active });
    toast.success(auto.is_active ? "Desactivada" : "Activada");
  };

  const handleNew = () => { setEditAuto(null); setDialogOpen(true); };

  const handleSave = async (data: any) => {
    if (data.id) {
      await updateMutation.mutateAsync(data);
      toast.success("Automatización actualizada");
    } else {
      await insertMutation.mutateAsync({ ...data, is_active: false, created_by: user?.id });
      toast.success("Automatización creada");
    }
  };

  const handleDuplicate = async (auto: any) => {
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = auto;
    await insertMutation.mutateAsync({ ...rest, name: `${rest.name} (copia)`, is_active: false, created_by: user?.id });
    toast.success("Automatización duplicada");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    toast.success("Automatización eliminada");
    setDeleteId(null);
  };

  const handleRun = async (auto: any) => {
    toast.info(`Ejecutando "${auto.name}"...`);
    try {
      const { data, error } = await supabase.functions.invoke("run-automation", {
        body: {
          event: auto.trigger_type,
          automationId: auto.id,
          client: {},
        },
      });
      if (error) throw error;
      toast.success(`"${auto.name}" ejecutada: ${data?.executed || 0} resultado(s)`);
    } catch (err: any) {
      console.error("Run automation error:", err);
      toast.error(`Error al ejecutar: ${err.message}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Automatizaciones</h1>
          <p className="text-muted-foreground mt-1">Reglas, flujos y campañas automáticas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar..." className="pl-9 w-[200px]" />
          </div>
          <Button className="gap-2" onClick={handleNew}><Plus className="h-4 w-4" />Nueva Regla</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{searchQuery ? "Sin resultados" : "No hay automatizaciones. Crea tu primera regla."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((auto: any) => {
            const actions = Array.isArray(auto.actions) ? auto.actions : [];
            return (
              <motion.div key={auto.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="rounded-lg bg-accent/10 p-2.5 shrink-0"><Zap className="h-5 w-5 text-accent" /></div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{auto.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={auto.is_active ? "default" : "secondary"} className="text-[10px]">
                          {auto.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {triggerLabels[auto.trigger_type] || auto.trigger_type}
                        </Badge>
                        {actions.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">{actions.length} acción{actions.length > 1 ? "es" : ""}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={auto.is_active} onCheckedChange={() => handleToggle(auto)} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditAuto(auto); setDialogOpen(true); }}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(auto)}><Copy className="h-4 w-4 mr-2" />Duplicar</DropdownMenuItem>
                        {auto.trigger_type === "manual" && (
                          <DropdownMenuItem onClick={() => handleRun(auto)}><Play className="h-4 w-4 mr-2" />Ejecutar ahora</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(auto.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Actions preview */}
                {actions.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <Zap className="h-3 w-3" />{triggerLabels[auto.trigger_type] || auto.trigger_type}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {actions.map((action: any, i: number) => {
                      const Icon = actionIcons[action.type] || Zap;
                      return (
                        <Badge key={i} variant="secondary" className="text-[10px] gap-1">
                          <Icon className="h-3 w-3" />{actionLabels[action.type] || action.type}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {auto.description && <p className="text-sm text-muted-foreground mt-3">{auto.description}</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      <EditAutomationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        automation={editAuto}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Eliminar automatización"
        description="¿Estás seguro de eliminar esta automatización? Esta acción no se puede deshacer."
      />
    </motion.div>
  );
};

export default Automations;
