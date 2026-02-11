import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Contact,
  Package,
  CheckSquare,
  MessageSquare,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: Contact, label: "Contactos", path: "/contacts" },
  { icon: Package, label: "Servicios", path: "/services" },
  { icon: CheckSquare, label: "Tareas", path: "/tasks" },
  { icon: MessageSquare, label: "Inbox", path: "/inbox" },
  { icon: Zap, label: "Automatizaciones", path: "/automations" },
  { icon: Settings, label: "Ajustes", path: "/settings" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col sidebar-gradient border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Zap className="h-5 w-5 text-accent-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground tracking-tight">
          NimbusCRM
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
              {item.label === "Inbox" && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">Admin</p>
            <p className="text-xs text-sidebar-muted truncate">admin@nimbus.io</p>
          </div>
          <button className="text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
