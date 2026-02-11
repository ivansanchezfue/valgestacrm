import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AppSidebar from "./AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/50" onClick={() => setSidebarOpen(false)} />
      )}

      <AppSidebar isOpen={!isMobile || sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className={`flex-1 ${isMobile ? "ml-0" : "ml-64"}`}>
        {/* Mobile header */}
        {isMobile && (
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background px-4 py-3">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-lg font-bold text-foreground tracking-tight">ValgestaCRM</span>
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