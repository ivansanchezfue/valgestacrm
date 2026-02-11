import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Bell,
  Mail,
  MessageSquare,
  Send,
  Calendar,
  Key,
  Database,
  FileText,
  Users,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Cuenta",
    items: [
      { icon: User, label: "Perfil", description: "Nombre, email, avatar", path: "/settings/profile", badge: null },
      { icon: Shield, label: "Seguridad", description: "Contraseña, 2FA", path: "/settings/security", badge: null },
      { icon: Bell, label: "Notificaciones", description: "Email, push, in-app", path: "/settings/notifications", badge: null },
    ],
  },
  {
    title: "Administración",
    items: [
      { icon: Users, label: "Usuarios y Roles", description: "Gestionar equipo y permisos", path: "/settings/users", badge: "Admin" },
      { icon: Database, label: "Catálogos", description: "Etiquetas, estados, campos personalizados", path: "/settings/catalogs", badge: null },
      { icon: FileText, label: "Plantillas", description: "Plantillas de email y mensajes", path: "/settings/templates", badge: null },
      { icon: Key, label: "API Keys", description: "Claves de acceso a la API", path: "/settings/api-keys", badge: null },
    ],
  },
  {
    title: "Integraciones",
    items: [
      { icon: Mail, label: "Cuentas de Correo", description: "Gmail, Outlook, IMAP/POP, SMTP", path: "/settings/email", badge: "2 conectadas" },
      { icon: MessageSquare, label: "WhatsApp Business", description: "API de WhatsApp", path: "/settings/whatsapp", badge: "Activo" },
      { icon: Send, label: "Telegram Bot", description: "Bot de Telegram", path: "/settings/telegram", badge: "Activo" },
      { icon: Calendar, label: "Google Calendar", description: "Sincronización de eventos", path: "/settings/calendar", badge: "Conectado" },
    ],
  },
];

const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ajustes</h1>
        <p className="text-muted-foreground mt-1">Configuración del sistema</p>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {section.title}
          </h3>
          <div className="bg-card rounded-xl border overflow-hidden divide-y divide-border">
            {section.items.map((item) => (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="rounded-lg bg-muted p-2.5">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px]">
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default SettingsPage;