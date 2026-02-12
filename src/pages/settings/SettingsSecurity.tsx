import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Shield, Copy, CheckCircle2, Loader2 } from "lucide-react";

const SettingsSecurity = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { } = useAuth();

  // 2FA state
  const [mfaLoading, setMfaLoading] = useState(true);
  const [hasMfa, setHasMfa] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  // Enrollment flow
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadMfaStatus();
  }, []);

  const loadMfaStatus = async () => {
    setMfaLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const verified = data.totp.find((f: any) => f.status === "verified");
      if (verified) {
        setHasMfa(true);
        setFactorId(verified.id);
      } else {
        setHasMfa(false);
        setFactorId(null);
        // Clean up any unverified factors
        for (const f of data.totp.filter((f: any) => f.status === "unverified")) {
          await supabase.auth.mfa.unenroll({ factorId: f.id });
        }
      }
    } catch (err: any) {
      console.error("Error loading MFA status:", err);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar la configuración de 2FA");
      setEnrolling(false);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (verifyCode.length !== 6 || !factorId) return;
    setVerifying(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      toast.success("2FA activado correctamente");
      setHasMfa(true);
      setEnrolling(false);
      setQrCode(null);
      setSecret(null);
      setVerifyCode("");
    } catch (err: any) {
      toast.error(err.message || "Código inválido. Inténtalo de nuevo.");
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenroll = async () => {
    if (!factorId) return;
    setMfaLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      toast.success("2FA desactivado");
      setHasMfa(false);
      setFactorId(null);
      setEnrolling(false);
      setQrCode(null);
      setSecret(null);
    } catch (err: any) {
      toast.error(err.message || "Error al desactivar 2FA");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleToggle2FA = (checked: boolean) => {
    if (checked) {
      handleEnroll();
    } else {
      handleUnenroll();
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success("Clave copiada al portapapeles");
    }
  };

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

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seguridad</h1>
        <p className="text-muted-foreground mt-1">Contraseña y autenticación</p>
      </div>

      {/* Change password */}
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

      {/* 2FA Section */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Autenticación de dos factores (2FA)</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">Activar 2FA con Google Authenticator</p>
            <p className="text-xs text-muted-foreground">Añade una capa extra de seguridad usando Google Authenticator</p>
          </div>
          {mfaLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Switch checked={hasMfa || enrolling} onCheckedChange={handleToggle2FA} disabled={enrolling && !!qrCode} />
          )}
        </div>

        {/* Enrollment: show QR + verify */}
        {enrolling && qrCode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-muted rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <p className="font-medium text-foreground">Configurar Google Authenticator</p>
            </div>

            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Abre Google Authenticator en tu móvil</li>
              <li>Pulsa "+" y selecciona "Escanear código QR"</li>
              <li>Escanea el código de abajo</li>
              <li>Introduce el código de 6 dígitos para verificar</li>
            </ol>

            {/* QR Code */}
            <div className="flex justify-center py-2">
              <div
                className="bg-white p-3 rounded-lg"
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
            </div>

            {/* Manual secret */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">O introduce esta clave manualmente:</p>
              <div className="flex items-center gap-2">
                <code className="bg-background px-3 py-1.5 rounded text-xs font-mono text-foreground break-all flex-1">
                  {secret}
                </code>
                <Button variant="ghost" size="icon" onClick={copySecret} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* OTP verification */}
            <div className="space-y-3">
              <Label>Código de verificación</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEnrolling(false);
                    setQrCode(null);
                    setSecret(null);
                    setVerifyCode("");
                    if (factorId) {
                      supabase.auth.mfa.unenroll({ factorId });
                      setFactorId(null);
                    }
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleVerifyEnrollment} disabled={verifyCode.length !== 6 || verifying}>
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Verificar y activar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Already active */}
        {hasMfa && !enrolling && (
          <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm text-foreground">2FA está activo. Tu cuenta está protegida con Google Authenticator.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SettingsSecurity;
