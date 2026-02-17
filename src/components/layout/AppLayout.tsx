import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AppSidebar from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBranding } from "@/contexts/BrandingContext";
import ChatNotificationListener from "@/components/ChatNotificationListener";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { appName } = useBranding();

  const marginLeft = isMobile ? "ml-0" : collapsed ? "ml-[68px]" : "ml-64";

  return (
    <div className="flex min-h-screen bg-background">
      <ChatNotificationListener />
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
      )}
      <AppSidebar
        isOpen={!isMobile || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={!isMobile && collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <main className={`flex-1 ${marginLeft} transition-all duration-200`}>
        {isMobile && (
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background px-4 py-3">
            <button onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5 text-foreground" /></button>
            <span className="text-lg font-bold text-foreground tracking-tight">{appName}</span>
          </div>
        )}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
