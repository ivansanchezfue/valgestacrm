import { motion } from "framer-motion";
import {
  Users, UserPlus, CheckSquare, MessageSquare, TrendingUp, ArrowUpRight, Calendar, Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

const priorityColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baja: "bg-muted text-muted-foreground",
};

const channelIcons: Record<string, string> = {
  whatsapp: "🟢", telegram: "🔵", email: "📧",
};

const Dashboard = () => {
  const { data: clients = [] } = useSupabaseQuery<any>("clients");
  const { data: tasks = [] } = useSupabaseQuery<any>("tasks");
  const { data: conversations = [] } = useSupabaseQuery<any>("conversations");

  const activeClients = clients.filter((c: any) => c.status === "activo").length;
  const leads = clients.filter((c: any) => c.status === "lead").length;
  const pendingTasks = tasks.filter((t: any) => t.status === "pendiente").length;
  const unreadMessages = conversations.filter((c: any) => c.unread).length;

  const statCards = [
    { label: "Clientes Activos", value: activeClients, icon: Users, change: `${clients.length} total`, color: "text-info" },
    { label: "Leads Nuevos", value: leads, icon: UserPlus, change: "Este mes", color: "text-success" },
    { label: "Tareas Pendientes", value: pendingTasks, icon: CheckSquare, change: `${tasks.length} total`, color: "text-warning" },
    { label: "Mensajes Sin Leer", value: unreadMessages, icon: MessageSquare, change: "Hoy", color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <motion.div {...fadeIn} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad comercial</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} {...fadeIn} transition={{ duration: 0.3, delay: i * 0.05 }} className="stat-card group cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
              <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold text-foreground mb-4">Tareas Próximas</h3>
          <div className="space-y-3">
            {tasks.filter((t: any) => t.status !== "completada").slice(0, 4).map((task: any) => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="mt-0.5"><CheckSquare className="h-4 w-4 text-muted-foreground" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{task.due_date}</span>
                  </div>
                </div>
                <Badge variant="secondary" className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}>{task.priority}</Badge>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay tareas</p>}
          </div>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold text-foreground mb-4">Conversaciones Recientes</h3>
          <div className="space-y-3">
            {conversations.slice(0, 4).map((conv: any) => (
              <div key={conv.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground shrink-0">
                  {conv.contact_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${conv.unread ? "font-semibold text-foreground" : "text-foreground"}`}>{conv.contact_name}</p>
                    <span className="text-sm">{channelIcons[conv.channel]}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-foreground" : "text-muted-foreground"}`}>{conv.last_message}</p>
                </div>
                {conv.unread && <div className="mt-2 h-2 w-2 rounded-full bg-accent" />}
              </div>
            ))}
            {conversations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No hay conversaciones</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
