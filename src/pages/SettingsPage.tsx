import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Link,
  Database,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    title: "Cuenta",
    items: [
      { icon: User, label: "Perfil", description: "Nombre, email, avatar", badge: null },
      { icon: Shield, label: "Seguridad", description: "Contraseña, 2FA", badge: null },
      { icon: Bell, label: "Notificaciones", description: "Email, push, in-app", badge: null },
    ],
  },
  {
    title: "Administración",
    items: [
      { icon: Shield, label: "Usuarios y Roles", description: "Gestionar equipo y permisos", badge: "Admin" },
      { icon: Database, label: "Catálogos", description: "Etiquetas, estados, campos personalizados", badge: null },
      { icon: FileText, label: "Plantillas", description: "Plantillas de email y mensajes", badge: null },
    ],
  },
  {
    title: "Integraciones",
    items: [
      { icon: Link, label: "Gmail / Outlook", description: "Cuentas de correo conectadas", badge: "2 conectadas" },
      { icon: Link, label: "WhatsApp Business", description: "API de WhatsApp", badge: "Activo" },
      { icon: Link, label: "Telegram Bot", description: "Bot de Telegram", badge: "Activo" },
      { icon: Link, label: "Google Calendar", description: "Sincronización de eventos", badge: "Conectado" },
    ],
  },
];

const SettingsPage = () => {
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
