import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const { signIn, verifyMfa } = useAuth();
  const { appName } = useBranding();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.needsMfa) {
        setMfaStep(true);
      } else {
        toast.success(`Bienvenido a ${appName}`);
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleMfaVerify = async () => {
    if (otpCode.length !== 6) return;
    setVerifyingMfa(true);
    try {
      await verifyMfa(otpCode);
      toast.success(`Bienvenido a ${appName}`);
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Código inválido");
      setOtpCode("");
    } finally {
      setVerifyingMfa(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent mb-4">
            <Zap className="h-7 w-7 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{appName}</h1>
          <p className="text-muted-foreground mt-1">
            {mfaStep ? "Verificación de dos factores" : "Inicia sesión en tu cuenta"}
          </p>
        </div>

        <div className="bg-card rounded-xl border p-6">
          {!mfaStep ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" type="email" placeholder="correo@empresa.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Cargando..." : "Iniciar Sesión"}
              </Button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2 justify-center text-muted-foreground">
                <Shield className="h-5 w-5" />
                <p className="text-sm">Introduce el código de Google Authenticator</p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
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
              <Button className="w-full" onClick={handleMfaVerify} disabled={otpCode.length !== 6 || verifyingMfa}>
                {verifyingMfa ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Verificar
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => { setMfaStep(false); setOtpCode(""); }}>
                Volver al login
              </Button>
            </div>
          )}
          {!mfaStep && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Contacta al administrador para obtener acceso
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
