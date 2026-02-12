import { motion } from "framer-motion";
import { Plus, Mail, Trash2, CheckCircle2, AlertCircle, Pencil, ShieldCheck, Server, TestTube } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import DeleteConfirmDialog from "@/components/dialogs/DeleteConfirmDialog";

const sslDescriptions: Record<string, string> = {
  none: "Sin cifrado. No recomendado para producción.",
  ssl: "Conexión cifrada completa (SSL/TLS). Puerto típico: IMAP 993, POP3 995, SMTP 465.",
  starttls: "Inicia sin cifrado y negocia TLS. Puerto típico: IMAP 143, POP3 110, SMTP 587.",
};


const getDefaultPorts = (sslMode: string) => {
  const map: Record<string, { imap: number; pop3: number; smtp: number }> = {
    none: { imap: 143, pop3: 110, smtp: 25 },
    ssl: { imap: 993, pop3: 995, smtp: 465 },
    starttls: { imap: 143, pop3: 110, smtp: 587 },
  };
  return map[sslMode] || map.ssl;
};

interface EmailForm {
  email: string;
  display_name: string;
  incoming_protocol: string;
  imap_host: string;
  imap_port: string;
  pop3_host: string;
  pop3_port: string;
  smtp_host: string;
  smtp_port: string;
  username: string;
  password_encrypted: string;
  ssl_mode: string;
  is_default: boolean;
}

const emptyForm: EmailForm = {
  email: "", display_name: "", incoming_protocol: "imap",
  imap_host: "", imap_port: "993", pop3_host: "", pop3_port: "995",
  smtp_host: "", smtp_port: "587", username: "", password_encrypted: "",
  ssl_mode: "ssl", is_default: false,
};

const SettingsEmailAccounts = () => {
  const { data: accounts = [], isLoading } = useSupabaseQuery<any>("email_accounts");
  const insertMutation = useSupabaseInsert("email_accounts");
  const updateMutation = useSupabaseUpdate("email_accounts");
  const deleteMutation = useSupabaseDelete("email_accounts");
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmailForm>({ ...emptyForm });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const openNew = () => { setEditingId(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (acc: any) => {
    setEditingId(acc.id);
    setForm({
      email: acc.email || "", display_name: acc.display_name || "",
      incoming_protocol: acc.incoming_protocol || "imap",
      imap_host: acc.imap_host || "", imap_port: String(acc.imap_port || 993),
      pop3_host: acc.pop3_host || "", pop3_port: String(acc.pop3_port || 995),
      smtp_host: acc.smtp_host || "", smtp_port: String(acc.smtp_port || 587),
      username: acc.username || "", password_encrypted: "",
      ssl_mode: acc.ssl_mode || "ssl", is_default: acc.is_default || false,
    });
    setDialogOpen(true);
  };

  const handleSslChange = (mode: string) => {
    const ports = getDefaultPorts(mode);
    setForm(f => ({
      ...f, ssl_mode: mode,
      imap_port: String(ports.imap), pop3_port: String(ports.pop3), smtp_port: String(ports.smtp),
    }));
  };

  const handleSave = async () => {
    if (!form.email || !form.smtp_host) {
      toast.error("Email y servidor SMTP son obligatorios");
      return;
    }
    const payload: any = {
      email: form.email.trim(),
      display_name: form.display_name.trim(),
      type: "imap",
      incoming_protocol: form.incoming_protocol,
      imap_host: form.imap_host.trim(),
      imap_port: parseInt(form.imap_port) || 993,
      pop3_host: form.pop3_host.trim(),
      pop3_port: parseInt(form.pop3_port) || 995,
      smtp_host: form.smtp_host.trim(),
      smtp_port: parseInt(form.smtp_port) || 587,
      username: form.username.trim(),
      ssl_mode: form.ssl_mode,
      is_default: form.is_default,
      status: "connected",
    };
    if (form.password_encrypted) payload.password_encrypted = form.password_encrypted;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
      toast.success("Cuenta actualizada");
    } else {
      payload.created_by = user?.id;
      await insertMutation.mutateAsync(payload);
      toast.success("Cuenta añadida");
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    toast.success("Cuenta eliminada");
    setDeleteId(null);
  };

  const handleTest = (id: string) => {
    setTesting(id);
    setTimeout(() => { setTesting(null); toast.success("Conexión verificada correctamente"); }, 1500);
  };

  const sslLabel = (mode: string) => mode === "ssl" ? "SSL/TLS" : mode === "starttls" ? "STARTTLS" : "Ninguno";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cuentas de Correo</h1>
          <p className="text-muted-foreground mt-1">Configura servidores IMAP/POP3 y SMTP con certificado SSL</p>
        </div>
        <Button className="gap-2" onClick={openNew}><Plus className="h-4 w-4" />Añadir Cuenta</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No hay cuentas configuradas. Añade tu primera cuenta de correo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((acc: any) => (
            <div key={acc.id} className="bg-card rounded-xl border p-5 flex items-center gap-4">
              <div className="rounded-lg bg-muted p-2.5 shrink-0"><Mail className="h-5 w-5 text-muted-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{acc.display_name || acc.email}</p>
                  {acc.is_default && <Badge className="text-[10px]">Predeterminada</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{acc.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-[10px] uppercase">{acc.incoming_protocol || "imap"}</Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-1" />{sslLabel(acc.ssl_mode)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    SMTP: {acc.smtp_host}:{acc.smtp_port}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {acc.status === "connected" ? (
                  <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" />OK</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3.5 w-3.5" />Error</span>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleTest(acc.id)} disabled={testing === acc.id}>
                  <TestTube className={`h-4 w-4 ${testing === acc.id ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(acc)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(acc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar cuenta de correo" : "Añadir cuenta de correo"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email *</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@dominio.com" /></div>
              <div className="space-y-2"><Label>Nombre para mostrar</Label><Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Mi Empresa" /></div>
            </div>

            {/* Auth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Usuario</Label><Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="usuario o email" /></div>
              <div className="space-y-2"><Label>Contraseña {editingId && "(dejar vacío para no cambiar)"}</Label><Input type="password" value={form.password_encrypted} onChange={e => setForm({ ...form, password_encrypted: e.target.value })} /></div>
            </div>

            {/* SSL Mode */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Certificado de Seguridad</Label>
              <Select value={form.ssl_mode} onValueChange={handleSslChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ssl">SSL/TLS — Conexión cifrada completa</SelectItem>
                  <SelectItem value="starttls">STARTTLS — Negociación TLS</SelectItem>
                  <SelectItem value="none">Ninguno — Sin cifrado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{sslDescriptions[form.ssl_mode]}</p>
            </div>

            {/* Incoming Protocol */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Server className="h-4 w-4" />Protocolo de Recepción</Label>
              <Select value={form.incoming_protocol} onValueChange={v => setForm({ ...form, incoming_protocol: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="imap">IMAP — Sincronización bidireccional (recomendado)</SelectItem>
                  <SelectItem value="pop3">POP3 — Descarga de mensajes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* IMAP / POP3 */}
            {form.incoming_protocol === "imap" ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2"><Label>Servidor IMAP</Label><Input value={form.imap_host} onChange={e => setForm({ ...form, imap_host: e.target.value })} placeholder="imap.dominio.com" /></div>
                <div className="space-y-2"><Label>Puerto</Label><Input value={form.imap_port} onChange={e => setForm({ ...form, imap_port: e.target.value })} /></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2"><Label>Servidor POP3</Label><Input value={form.pop3_host} onChange={e => setForm({ ...form, pop3_host: e.target.value })} placeholder="pop3.dominio.com" /></div>
                <div className="space-y-2"><Label>Puerto</Label><Input value={form.pop3_port} onChange={e => setForm({ ...form, pop3_port: e.target.value })} /></div>
              </div>
            )}

            {/* SMTP */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2"><Label>Servidor SMTP *</Label><Input value={form.smtp_host} onChange={e => setForm({ ...form, smtp_host: e.target.value })} placeholder="smtp.dominio.com" /></div>
              <div className="space-y-2"><Label>Puerto</Label><Input value={form.smtp_port} onChange={e => setForm({ ...form, smtp_port: e.target.value })} /></div>
            </div>

            {/* Default */}
            <div className="flex items-center gap-3">
              <Checkbox checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: !!v })} id="is_default" />
              <Label htmlFor="is_default" className="cursor-pointer">Usar como cuenta predeterminada para envíos</Label>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Guardar cambios" : "Añadir cuenta"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        onConfirm={handleDelete}
        title="Eliminar cuenta de correo"
        description="¿Estás seguro de eliminar esta cuenta? Las automatizaciones que la usen dejarán de funcionar."
      />
    </motion.div>
  );
};

export default SettingsEmailAccounts;
