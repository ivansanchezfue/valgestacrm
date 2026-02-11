import { motion } from "framer-motion";
import { useState } from "react";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { tasks as initialTasks, Task } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import CreateTaskDialog from "@/components/dialogs/CreateTaskDialog";

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pendiente: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  en_progreso: { icon: AlertCircle, color: "text-info", bg: "bg-info/10" },
  completada: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  vencida: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
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
  vencida: "Vencida",
};

const Tasks = () => {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);

  const grouped = {
    pendiente: taskList.filter((t) => t.status === "pendiente"),
    en_progreso: taskList.filter((t) => t.status === "en_progreso"),
    completada: taskList.filter((t) => t.status === "completada"),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tareas</h1>
          <p className="text-muted-foreground mt-1">{taskList.length} tareas en total</p>
        </div>
        <CreateTaskDialog onCreated={(t) => setTaskList([...taskList, t])} />
      </div>

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
                {items.map((task) => (
                  <motion.div key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-4 card-hover cursor-pointer">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <Badge variant="secondary" className={`text-[10px] shrink-0 ${priorityStyles[task.priority]}`}>{task.priority}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{task.assignee}</span>
                      <span>{task.dueDate}</span>
                    </div>
                    {task.clientName && <p className="text-xs text-accent font-medium mt-2">{task.clientName}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Tasks;