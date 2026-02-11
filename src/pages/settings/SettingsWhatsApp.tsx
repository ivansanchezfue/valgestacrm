import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SettingsWhatsApp = () => {
  const [connected, setConnected] = useState(true);
  const [config, setConfig] = useState({
    phoneNumber: "+34 600 123 456",
    businessId: "123456789",
    apiToken: "••••••••••••••••",
    webhookUrl: "https://api.valgesta.com/webhooks/whatsapp",
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">WhatsApp Business API</h1>
        <p className="text-muted-foreground mt-1">Configuración de la integración con WhatsApp</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2.5"><MessageSquare className="h-5 w-5 text-success" /></div>
            <div>
              <p className="font-semibold text-foreground">WhatsApp Business</p>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span className="text-xs text-success">Activo</span>
              </div>
            </div>
          </div>
          <Switch checked={connected} onCheckedChange={setConnected} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2"><Label>Número de teléfono</Label><Input value={config.phoneNumber} onChange={e => setConfig({ ...config, phoneNumber: e.target.value })} /></div>
          <div className="space-y-2"><Label>Business Account ID</Label><Input value={config.businessId} onChange={e => setConfig({ ...config, businessId: e.target.value })} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>API Token</Label><Input type="password" value={config.apiToken} onChange={e => setConfig({ ...config, apiToken: e.target.value })} /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Webhook URL</Label><Input value={config.webhookUrl} readOnly className="bg-muted" /></div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Configuración de WhatsApp guardada")}>Guardar configuración</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsWhatsApp;