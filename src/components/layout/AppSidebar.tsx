import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Contact, Package, CheckSquare, MessageSquare, Settings, LogOut, Zap, X, Sun, Moon, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

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

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const AppSidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }: AppSidebarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada");
  };

  const sidebarWidth = collapsed ? "w-[68px]" : "w-64";

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen ${sidebarWidth} flex-col sidebar-gradient border-r border-sidebar-border transition-all duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent shrink-0">
            <Zap className="h-5 w-5 text-accent-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold text-sidebar-foreground tracking-tight whitespace-nowrap">ValgestaCRM</span>}
        </div>
        <button onClick={onClose} className="text-sidebar-muted hover:text-sidebar-foreground md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && item.label}
              {!collapsed && item.label === "Inbox" && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-accent-foreground">3</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          {theme === "light" ? <Moon className="h-[18px] w-[18px] shrink-0" /> : <Sun className="h-[18px] w-[18px] shrink-0" />}
          {!collapsed && (theme === "light" ? "Modo oscuro" : "Modo claro")}
        </button>

        {/* Collapse toggle (desktop only) */}
        <button onClick={onToggleCollapse} className="hidden md:flex items-center gap-3 rounded-lg px-3 py-2 w-full text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors">
          {collapsed ? <ChevronRight className="h-[18px] w-[18px] shrink-0" /> : <ChevronLeft className="h-[18px] w-[18px] shrink-0" />}
          {!collapsed && "Colapsar menú"}
        </button>

        {/* User */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground shrink-0">
            {user?.email?.substring(0, 2).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.user_metadata?.full_name || "Usuario"}</p>
              <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
            </div>
          )}
          <button onClick={handleLogout} title="Cerrar sesión" className="text-sidebar-muted hover:text-sidebar-foreground transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
