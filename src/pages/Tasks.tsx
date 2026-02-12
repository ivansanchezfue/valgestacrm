import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle2, Search, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import CreateTaskDialog from "@/components/dialogs/CreateTaskDialog";
import EditTaskDialog from "@/components/dialogs/EditTaskDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Trash2, ArrowRight } from "lucide-react";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [editTask, setEditTask] = useState<any>(null);

  const clientMap = Object.fromEntries((clients || []).map((c: any) => [c.id, c.name]));

  const filteredTasks = tasks.filter((t: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.observations?.toLowerCase().includes(q) ||
      t.assignee?.toLowerCase().includes(q) ||
      (t.client_id && clientMap[t.client_id]?.toLowerCase().includes(q))
    );
  });

  const grouped = {
    pendiente: filteredTasks.filter((t: any) => t.status === "pendiente"),
    en_progreso: filteredTasks.filter((t: any) => t.status === "en_progreso"),
    completada: filteredTasks.filter((t: any) => t.status === "completada"),
  };

  const handleCreate = async (form: any) => {
    await insertMutation.mutateAsync({ ...form, created_by: user?.id });
    toast.success("Tarea creada");
  };

  const handleEdit = async (data: any) => {
    const { id, ...fields } = data;
    await updateMutation.mutateAsync({ id, ...fields });
    toast.success("Tarea actualizada");
  };

  const nextStatus: Record<string, string> = { pendiente: "en_progreso", en_progreso: "completada" };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
          <p className="text-muted-foreground mt-1">{tasks.length} tareas en total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="pl-9 w-[220px]"
            />
          </div>
          <CreateTaskDialog onCreated={handleCreate} clients={clients} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {Object.entries(grouped).map(([status, items]) => {
            const config = statusConfig[status];
            return (
              <div key={status} className="min-w-0">
                <div className="flex items-center gap-2 mb-4 sticky top-0 bg-background z-10 py-1">
                  <config.icon className={`h-4 w-4 ${config.color}`} />
                  <h3 className="font-semibold text-foreground">{statusLabels[status]}</h3>
                  <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
                </div>
                <div className="space-y-3">
                  {items.map((task: any) => (
                    <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-4 card-hover">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">{task.title}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="secondary" className={`text-[10px] ${priorityStyles[task.priority]}`}>{task.priority}</Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditTask(task)}>
                                <Pencil className="h-4 w-4 mr-2" />Editar
                              </DropdownMenuItem>
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

                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{task.description}</p>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground gap-2 flex-wrap">
                        {task.assignee && <span className="bg-muted px-2 py-0.5 rounded-md truncate max-w-[120px]">{task.assignee}</span>}
                        {task.due_date && (
                          <span className="bg-muted px-2 py-0.5 rounded-md whitespace-nowrap">
                            📅 {new Date(task.due_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                      </div>

                      {task.client_id && clientMap[task.client_id] && (
                        <p className="text-xs text-accent font-medium mt-2 truncate">🏢 {clientMap[task.client_id]}</p>
                      )}
                    </motion.div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm opacity-60">Sin tareas</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditTaskDialog
        task={editTask}
        clients={clients}
        open={!!editTask}
        onOpenChange={(open) => { if (!open) setEditTask(null); }}
        onSave={handleEdit}
      />
    </motion.div>
  );
};

export default Tasks;
