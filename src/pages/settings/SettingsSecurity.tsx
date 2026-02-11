import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsSecurity = () => {
  const [twoFa, setTwoFa] = useState(false);

  const handleChangePassword = () => {
    toast.success("Contraseña actualizada correctamente");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seguridad</h1>
        <p className="text-muted-foreground mt-1">Contraseña y autenticación</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-5">
        <h3 className="font-semibold text-foreground">Cambiar contraseña</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Contraseña actual</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Nueva contraseña</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label>Confirmar nueva contraseña</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleChangePassword}>Actualizar contraseña</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Autenticación de dos factores (2FA)</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Activar 2FA</p>
            <p className="text-xs text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
          </div>
          <Switch checked={twoFa} onCheckedChange={setTwoFa} />
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsSecurity;