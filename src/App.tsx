import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Contacts from "./pages/Contacts";
import Services from "./pages/Services";
import Tasks from "./pages/Tasks";
import Inbox from "./pages/Inbox";
import Automations from "./pages/Automations";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tasks" element={<Tasks />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;