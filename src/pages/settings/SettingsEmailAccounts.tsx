import { motion } from "framer-motion";
import { Plus, Mail, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface EmailAccount {
  id: string;
  email: string;
  type: "gmail" | "outlook" | "imap";
  status: "connected" | "error";
  imapHost?: string;
  imapPort?: string;
  smtpHost?: string;
  smtpPort?: string;
}

const defaultAccounts: EmailAccount[] = [
  { id: "1", email: "info@valgesta.com", type: "gmail", status: "connected" },
  { id: "2", email: "soporte@valgesta.com", type: "outlook", status: "connected" },
];

const SettingsEmailAccounts = () => {
  const [accounts, setAccounts] = useState(defaultAccounts);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("oauth");
  const [imapForm, setImapForm] = useState({ email: "", imapHost: "", imapPort: "993", smtpHost: "", smtpPort: "587", password: "" });

  const handleOAuth = (provider: "gmail" | "outlook") => {
    toast.info(`Redirigiendo a ${provider === "gmail" ? "Google" : "Microsoft"} para autorización...`);
    const newAcc: EmailAccount = { id: Date.now().toString(), email: `nueva@${provider === "gmail" ? "gmail.com" : "outlook.com"}`, type: provider, status: "connected" };
    setAccounts([...accounts, newAcc]);
    setOpen(false);
  };

  const handleImap = () => {
    if (!imapForm.email || !imapForm.imapHost || !imapForm.smtpHost) return;
    const newAcc: EmailAccount = {
      id: Date.now().toString(), email: imapForm.email, type: "imap", status: "connected",
      imapHost: imapForm.imapHost, imapPort: imapForm.imapPort, smtpHost: imapForm.smtpHost, smtpPort: imapForm.smtpPort,
    };
    setAccounts([...accounts, newAcc]);
    setImapForm({ email: "", imapHost: "", imapPort: "993", smtpHost: "", smtpPort: "587", password: "" });
    setOpen(false);
    toast.success("Cuenta IMAP/SMTP configurada");
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
    toast.success("Cuenta eliminada");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuentas de Correo</h1>
          <p className="text-muted-foreground mt-1">Gmail, Outlook, IMAP/POP y SMTP</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Añadir Cuenta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Añadir cuenta de correo</DialogTitle></DialogHeader>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="oauth">Gmail / Outlook</TabsTrigger>
                <TabsTrigger value="imap">IMAP / POP + SMTP</TabsTrigger>
              </TabsList>
              <TabsContent value="oauth" className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">Conecta tu cuenta mediante OAuth2 (recomendado)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-14 gap-2" onClick={() => handleOAuth("gmail")}>
                    <Mail className="h-5 w-5 text-destructive" />Gmail
                  </Button>
                  <Button variant="outline" className="h-14 gap-2" onClick={() => handleOAuth("outlook")}>
                    <Mail className="h-5 w-5 text-info" />Outlook
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="imap" className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Email</Label><Input value={imapForm.email} onChange={e => setImapForm({ ...imapForm, email: e.target.value })} placeholder="correo@dominio.com" /></div>
                <div className="space-y-2"><Label>Contraseña</Label><Input type="password" value={imapForm.password} onChange={e => setImapForm({ ...imapForm, password: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Servidor IMAP</Label><Input value={imapForm.imapHost} onChange={e => setImapForm({ ...imapForm, imapHost: e.target.value })} placeholder="imap.dominio.com" /></div>
                  <div className="space-y-2"><Label>Puerto IMAP</Label><Input value={imapForm.imapPort} onChange={e => setImapForm({ ...imapForm, imapPort: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Servidor SMTP</Label><Input value={imapForm.smtpHost} onChange={e => setImapForm({ ...imapForm, smtpHost: e.target.value })} placeholder="smtp.dominio.com" /></div>
                  <div className="space-y-2"><Label>Puerto SMTP</Label><Input value={imapForm.smtpPort} onChange={e => setImapForm({ ...imapForm, smtpPort: e.target.value })} /></div>
                </div>
                <div className="flex justify-end"><Button onClick={handleImap}>Conectar</Button></div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-card rounded-xl border p-5 flex items-center gap-4">
            <div className="rounded-lg bg-muted p-2.5 shrink-0"><Mail className="h-5 w-5 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">{acc.email}</p>
                <Badge variant="secondary" className="text-[10px] uppercase">{acc.type}</Badge>
              </div>
              {acc.type === "imap" && acc.imapHost && <p className="text-xs text-muted-foreground mt-0.5">IMAP: {acc.imapHost}:{acc.imapPort} · SMTP: {acc.smtpHost}:{acc.smtpPort}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {acc.status === "connected" ? (
                <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" />Conectado</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" />Error</span>
              )}
              <button onClick={() => removeAccount(acc.id)} className="text-muted-foreground hover:text-destructive ml-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SettingsEmailAccounts;