import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import CreateTaskDialog from "@/components/dialogs/CreateTaskDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import React from "react";

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  pendiente: { icon: Clock, color: "text-warning" },
  en_progreso: { icon: AlertCircle, color: "text-info" },
  completada: { icon: CheckCircle2, color: "text-success" },
  vencida: { icon: AlertCircle, color: "text-destructive" },
};

const priorityStyles: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baja: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

const Tasks = () => {
  const { data: tasks = [], isLoading } = useSupabaseQuery<any>("tasks");
  const { data: clients = [] } = useSupabaseQuery<any>("clients");
  const insertMutation = useSupabaseInsert("tasks");
  const updateMutation = useSupabaseUpdate("tasks");
  const deleteMutation = useSupabaseDelete("tasks");
  const { user } = useAuth();

  const clientMap = Object.fromEntries((clients || []).map((c: any) => [c.id, c.name]));

  const grouped = {
    pendiente: tasks.filter((t: any) => t.status === "pendiente"),
    en_progreso: tasks.filter((t: any) => t.status === "en_progreso"),
    completada: tasks.filter((t: any) => t.status === "completada"),
  };

  const handleCreate = async (form: any) => {
    await insertMutation.mutateAsync({ ...form, created_by: user?.id });
    toast.success("Tarea creada");
  };

  const nextStatus: Record<string, string> = { pendiente: "en_progreso", en_progreso: "completada" };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} tareas en total</p>
        </div>
        <CreateTaskDialog onCreated={handleCreate} clients={clients} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(grouped).map(([status, items]) => {
            const config = statusConfig[status];
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-4">
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  <h3 className="font-semibold text-foreground">{statusLabels[status]}</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((task: any) => (
                    <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-4 card-hover">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className={`text-[10px] shrink-0 ${priorityStyles[task.priority]}`}>{task.priority}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {nextStatus[status] && (
                                <DropdownMenuItem onClick={() => { updateMutation.mutateAsync({ id: task.id, status: nextStatus[status] }); toast.success("Estado actualizado"); }}>
                                  <ArrowRight className="h-4 w-4 mr-2" />Mover a {statusLabels[nextStatus[status]]}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => { deleteMutation.mutateAsync(task.id); toast.success("Tarea eliminada"); }}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.assignee}</span>
                        <span>{task.due_date}</span>
                      </div>
                      {task.client_id && clientMap[task.client_id] && (
                        <p className="text-xs text-accent font-medium mt-2">{clientMap[task.client_id]}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Tasks;
