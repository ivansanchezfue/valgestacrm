import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Package,
} from "lucide-react";
import { stats, tasks, conversations } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

const statCards = [
  { label: "Clientes Activos", value: stats.activeClients, icon: Users, change: "+12%", color: "text-info" },
  { label: "Leads Nuevos", value: stats.totalLeads, icon: UserPlus, change: "+5", color: "text-success" },
  { label: "Tareas Pendientes", value: stats.pendingTasks, icon: CheckSquare, change: "3 urgentes", color: "text-warning" },
  { label: "Mensajes Sin Leer", value: stats.unreadMessages, icon: MessageSquare, change: "Hoy", color: "text-accent" },
];

const priorityColors: Record<string, string> = {
  alta: "bg-destructive/10 text-destructive",
  media: "bg-warning/10 text-warning",
  baja: "bg-muted text-muted-foreground",
};

const channelIcons: Record<string, string> = {
  whatsapp: "🟢",
  telegram: "🔵",
  email: "📧",
};

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div {...fadeIn} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad comercial</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fadeIn}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="stat-card group cursor-default"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
              <div className={`rounded-lg bg-muted p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span>{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue + Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="stat-card lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h3 className="font-semibold text-foreground">Ingresos Mes</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">€{stats.revenue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">+18% vs. mes anterior</p>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-accent" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">72% del objetivo mensual</p>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="stat-card lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-info" />
            <h3 className="font-semibold text-foreground">Conversión</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
          <p className="text-sm text-muted-foreground mt-1">Leads → Clientes</p>
          <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-info" style={{ width: `${stats.conversionRate}%` }} />
          </div>
        </motion.div>

        <motion.div {...fadeIn} transition={{ delay: 0.3 }} className="stat-card lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-warning" />
            <h3 className="font-semibold text-foreground">Renovaciones</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.renewalsPending}</p>
          <p className="text-sm text-muted-foreground mt-1">Próximos 30 días</p>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Procesadas</span>
              <span className="font-medium text-foreground">5/12</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[42%] rounded-full bg-warning" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tasks + Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <motion.div {...fadeIn} transition={{ delay: 0.35 }} className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold text-foreground mb-4">Tareas Próximas</h3>
          <div className="space-y-3">
            {tasks.filter(t => t.status !== "completada").slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="mt-0.5">
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                    {task.clientName && (
                      <span className="text-xs text-muted-foreground">• {task.clientName}</span>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}>
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Conversations */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }} className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold text-foreground mb-4">Conversaciones Recientes</h3>
          <div className="space-y-3">
            {conversations.slice(0, 4).map((conv) => (
              <div key={conv.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground shrink-0">
                  {conv.contactName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate ${conv.unread ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {conv.contactName}
                    </p>
                    <span className="text-sm">{channelIcons[conv.channel]}</span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-foreground" : "text-muted-foreground"}`}>
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[11px] text-muted-foreground">{conv.timestamp}</span>
                  {conv.unread && (
                    <div className="mt-1 h-2 w-2 rounded-full bg-accent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
