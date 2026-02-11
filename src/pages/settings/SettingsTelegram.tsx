import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SettingsTelegram = () => {
  const [connected, setConnected] = useState(true);
  const [config, setConfig] = useState({
    botToken: "••••••••••••••••",
    botUsername: "@ValgestaCRM_bot",
    webhookUrl: "https://api.valgesta.com/webhooks/telegram",
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Telegram Bot</h1>
        <p className="text-muted-foreground mt-1">Configuración del bot de Telegram</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-info/10 p-2.5"><Send className="h-5 w-5 text-info" /></div>
            <div>
              <p className="font-semibold text-foreground">Telegram Bot</p>
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span className="text-xs text-success">Activo</span>
              </div>
            </div>
          </div>
          <Switch checked={connected} onCheckedChange={setConnected} />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2"><Label>Bot Token</Label><Input type="password" value={config.botToken} onChange={e => setConfig({ ...config, botToken: e.target.value })} /></div>
          <div className="space-y-2"><Label>Username del Bot</Label><Input value={config.botUsername} onChange={e => setConfig({ ...config, botUsername: e.target.value })} /></div>
          <div className="space-y-2"><Label>Webhook URL</Label><Input value={config.webhookUrl} readOnly className="bg-muted" /></div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => toast.success("Configuración de Telegram guardada")}>Guardar configuración</Button>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsTelegram;