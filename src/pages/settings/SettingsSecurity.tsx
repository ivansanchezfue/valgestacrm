import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SettingsSecurity = () => {
  const [twoFa, setTwoFa] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFa(checked);
    if (checked) {
      toast.info("Para configurar Google Authenticator: 1) Instala la app en tu móvil. 2) Escanea el código QR que se mostrará. Esta función requiere configuración backend adicional.");
    } else {
      toast.success("2FA desactivado");
    }
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
            <Input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nueva contraseña</Label>
            <Input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirmar nueva contraseña</Label>
            <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleChangePassword} disabled={loading}>{loading ? "Actualizando..." : "Actualizar contraseña"}</Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Autenticación de dos factores (2FA)</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Activar 2FA con Google Authenticator</p>
            <p className="text-xs text-muted-foreground">Añade una capa extra de seguridad usando Google Authenticator</p>
          </div>
          <Switch checked={twoFa} onCheckedChange={handleToggle2FA} />
        </div>
        {twoFa && (
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Configuración de Google Authenticator:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Descarga Google Authenticator en tu dispositivo móvil</li>
              <li>Abre la app y selecciona "Añadir cuenta"</li>
              <li>Escanea el código QR o introduce la clave manual</li>
              <li>Introduce el código de 6 dígitos para verificar</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">Nota: La generación de códigos QR TOTP requiere configuración adicional del servidor.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SettingsSecurity;
