import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Contacts from "./pages/Contacts";
import Services from "./pages/Services";
import Tasks from "./pages/Tasks";
import Inbox from "./pages/Inbox";
import Automations from "./pages/Automations";
import InternalChat from "./pages/InternalChat";
import Auth from "./pages/Auth";
import SettingsPage from "./pages/SettingsPage";
import SettingsProfile from "./pages/settings/SettingsProfile";
import SettingsSecurity from "./pages/settings/SettingsSecurity";
import SettingsNotifications from "./pages/settings/SettingsNotifications";
import SettingsUsersRoles from "./pages/settings/SettingsUsersRoles";
import SettingsCatalogs from "./pages/settings/SettingsCatalogs";
import SettingsTemplates from "./pages/settings/SettingsTemplates";
import SettingsApiKeys from "./pages/settings/SettingsApiKeys";
import SettingsEmailAccounts from "./pages/settings/SettingsEmailAccounts";
import SettingsWhatsApp from "./pages/settings/SettingsWhatsApp";
import SettingsTelegram from "./pages/settings/SettingsTelegram";
import SettingsGoogleCalendar from "./pages/settings/SettingsGoogleCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/services" element={<Services />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/chat" element={<InternalChat />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<SettingsProfile />} />
        <Route path="/settings/security" element={<SettingsSecurity />} />
        <Route path="/settings/notifications" element={<SettingsNotifications />} />
        <Route path="/settings/users" element={<SettingsUsersRoles />} />
        <Route path="/settings/catalogs" element={<SettingsCatalogs />} />
        <Route path="/settings/templates" element={<SettingsTemplates />} />
        <Route path="/settings/api-keys" element={<SettingsApiKeys />} />
        <Route path="/settings/email" element={<SettingsEmailAccounts />} />
        <Route path="/settings/whatsapp" element={<SettingsWhatsApp />} />
        <Route path="/settings/telegram" element={<SettingsTelegram />} />
        <Route path="/settings/calendar" element={<SettingsGoogleCalendar />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
