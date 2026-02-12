import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ArrowUp, ArrowDown, Mail, CheckSquare, Calendar, MessageSquare, Clock, Tag, UserCheck, Zap, Send } from "lucide-react";
import { useSupabaseQuery } from "@/hooks/useSupabaseData";
import { Separator } from "@/components/ui/separator";

const triggerTypes = [
  { value: "new_lead", label: "Nuevo lead/cliente", desc: "Se dispara cuando se crea un cliente" },
  { value: "status_change", label: "Cambio de estado", desc: "Cuando un cliente cambia de estado" },
  { value: "service_renewal", label: "Renovación de servicio", desc: "Días antes del vencimiento" },
  { value: "service_expired", label: "Servicio vencido", desc: "Días después de expirar" },
  { value: "task_overdue", label: "Tarea vencida", desc: "Tarea no completada a tiempo" },
  { value: "task_completed", label: "Tarea completada", desc: "Al completar una tarea" },
  { value: "no_response", label: "Sin respuesta", desc: "Cliente sin actividad" },
  { value: "scheduled", label: "Programada", desc: "Ejecución periódica" },
  { value: "manual", label: "Manual", desc: "Ejecución bajo demanda" },
];

const actionTypes = [
  { value: "send_email", label: "Enviar email", icon: Mail },
  { value: "send_bulk_email", label: "Email masivo", icon: Send },
  { value: "create_task", label: "Crear tarea", icon: CheckSquare },
  { value: "create_event", label: "Crear evento", icon: Calendar },
  { value: "notify", label: "Notificación interna", icon: MessageSquare },
  { value: "send_whatsapp", label: "Enviar WhatsApp", icon: MessageSquare },
  { value: "send_telegram", label: "Enviar Telegram", icon: MessageSquare },
  { value: "update_status", label: "Cambiar estado", icon: UserCheck },
  { value: "add_tag", label: "Añadir etiqueta", icon: Tag },
  { value: "wait", label: "Esperar", icon: Clock },
];

const clientStatuses = ["lead", "activo", "inactivo", "suspendido"];
const priorities = ["alta", "media", "baja"];
const frequencies = [
  { value: "once", label: "Una vez" },
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
];
const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation?: any;
  onSave: (data: any) => void;
}

const EditAutomationDialog = ({ open, onOpenChange, automation, onSave }: Props) => {
  const { data: emailAccounts = [] } = useSupabaseQuery<any>("email_accounts");
  const { data: services = [] } = useSupabaseQuery<any>("services");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("new_lead");
  const [triggerConfig, setTriggerConfig] = useState<any>({});
  const [actions, setActions] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});

  useEffect(() => {
    if (automation) {
      setName(automation.name || "");
      setDescription(automation.description || "");
      setTriggerType(automation.trigger_type || "new_lead");
      setTriggerConfig(automation.trigger_config || {});
      setActions(Array.isArray(automation.actions) ? automation.actions : []);
      setFilters(automation.trigger_config?.filters || {});
    } else {
      setName(""); setDescription(""); setTriggerType("new_lead");
      setTriggerConfig({}); setActions([]); setFilters({});
    }
  }, [automation, open]);

  const updateTriggerConfig = (key: string, value: any) => setTriggerConfig((c: any) => ({ ...c, [key]: value }));
  const updateFilter = (key: string, value: any) => setFilters((f: any) => ({ ...f, [key]: value }));

  const addAction = () => setActions([...actions, { type: "send_email", config: {} }]);
  const removeAction = (i: number) => setActions(actions.filter((_, idx) => idx !== i));
  const moveAction = (i: number, dir: -1 | 1) => {
    const newArr = [...actions];
    const j = i + dir;
    if (j < 0 || j >= newArr.length) return;
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    setActions(newArr);
  };
  const updateAction = (i: number, key: string, value: any) => {
    const newArr = [...actions];
    if (key === "type") { newArr[i] = { type: value, config: {} }; }
    else { newArr[i] = { ...newArr[i], config: { ...newArr[i].config, [key]: value } }; }
    setActions(newArr);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const finalConfig = { ...triggerConfig, filters };
    onSave({
      ...(automation?.id ? { id: automation.id } : {}),
      name: name.trim(),
      description: description.trim(),
      trigger_type: triggerType,
      trigger_config: finalConfig,
      actions,
    });
    onOpenChange(false);
  };

  const renderTriggerFields = () => {
    switch (triggerType) {
      case "new_lead":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Tipo de cliente</Label>
              <Select value={triggerConfig.client_type || ""} onValueChange={v => updateTriggerConfig("client_type", v)}>
                <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                <SelectContent><SelectItem value="empresa">Empresa</SelectItem><SelectItem value="particular">Particular</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Sector</Label>
              <Input value={triggerConfig.sector || ""} onChange={e => updateTriggerConfig("sector", e.target.value)} placeholder="Ej: Tecnología" />
            </div>
          </div>
        );
      case "status_change":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Estado origen</Label>
              <Select value={triggerConfig.from_status || ""} onValueChange={v => updateTriggerConfig("from_status", v)}>
                <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                <SelectContent>{clientStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Estado destino</Label>
              <Select value={triggerConfig.to_status || ""} onValueChange={v => updateTriggerConfig("to_status", v)}>
                <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                <SelectContent>{clientStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        );
      case "service_renewal":
        return (
          <div className="space-y-1"><Label className="text-xs">Días antes del vencimiento</Label>
            <Select value={String(triggerConfig.days_before || "7")} onValueChange={v => updateTriggerConfig("days_before", parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="7">7 días</SelectItem><SelectItem value="15">15 días</SelectItem><SelectItem value="30">30 días</SelectItem><SelectItem value="60">60 días</SelectItem></SelectContent>
            </Select>
          </div>
        );
      case "service_expired":
        return (
          <div className="space-y-1"><Label className="text-xs">Días después del vencimiento</Label>
            <Select value={String(triggerConfig.days_after || "1")} onValueChange={v => updateTriggerConfig("days_after", parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="1">1 día</SelectItem><SelectItem value="3">3 días</SelectItem><SelectItem value="7">7 días</SelectItem><SelectItem value="15">15 días</SelectItem></SelectContent>
            </Select>
          </div>
        );
      case "task_overdue":
        return (
          <div className="space-y-1"><Label className="text-xs">Prioridad mínima</Label>
            <Select value={triggerConfig.min_priority || "baja"} onValueChange={v => updateTriggerConfig("min_priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        );
      case "no_response":
        return (
          <div className="space-y-1"><Label className="text-xs">Días sin actividad</Label>
            <Select value={String(triggerConfig.days_inactive || "7")} onValueChange={v => updateTriggerConfig("days_inactive", parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="3">3 días</SelectItem><SelectItem value="7">7 días</SelectItem><SelectItem value="14">14 días</SelectItem><SelectItem value="30">30 días</SelectItem></SelectContent>
            </Select>
          </div>
        );
      case "scheduled":
        return (
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Frecuencia</Label>
              <Select value={triggerConfig.frequency || "daily"} onValueChange={v => updateTriggerConfig("frequency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{frequencies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {triggerConfig.frequency === "weekly" && (
              <div className="space-y-1"><Label className="text-xs">Día de la semana</Label>
                <Select value={String(triggerConfig.day_of_week || "0")} onValueChange={v => updateTriggerConfig("day_of_week", parseInt(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{daysOfWeek.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {triggerConfig.frequency === "monthly" && (
              <div className="space-y-1"><Label className="text-xs">Día del mes</Label>
                <Input type="number" min={1} max={28} value={triggerConfig.day_of_month || 1} onChange={e => updateTriggerConfig("day_of_month", parseInt(e.target.value))} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Hora</Label>
                <Input type="number" min={0} max={23} value={triggerConfig.hour ?? 9} onChange={e => updateTriggerConfig("hour", parseInt(e.target.value))} />
              </div>
              <div className="space-y-1"><Label className="text-xs">Minuto</Label>
                <Input type="number" min={0} max={59} value={triggerConfig.minute ?? 0} onChange={e => updateTriggerConfig("minute", parseInt(e.target.value))} />
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const renderActionFields = (action: any, i: number) => {
    const c = action.config || {};
    const set = (key: string, value: any) => updateAction(i, key, value);

    switch (action.type) {
      case "send_email":
        return (
          <div className="space-y-2">
            <div className="space-y-1"><Label className="text-xs">Cuenta de correo</Label>
              <Select value={c.account_id || ""} onValueChange={v => set("account_id", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                <SelectContent>{emailAccounts.map((ea: any) => <SelectItem key={ea.id} value={ea.id}>{ea.email}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Destinatario</Label>
              <Select value={c.to || "client_email"} onValueChange={v => set("to", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_email">Email del cliente</SelectItem>
                  <SelectItem value="contact_email">Email del contacto</SelectItem>
                  <SelectItem value="custom">Email personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {c.to === "custom" && <Input value={c.custom_email || ""} onChange={e => set("custom_email", e.target.value)} placeholder="email@ejemplo.com" />}
            <Input value={c.subject || ""} onChange={e => set("subject", e.target.value)} placeholder="Asunto del email" />
            <Textarea value={c.body || ""} onChange={e => set("body", e.target.value)} placeholder="Cuerpo del email. Variables: {{nombre}}, {{empresa}}, {{servicio}}" rows={3} />
          </div>
        );
      case "send_bulk_email":
        return (
          <div className="space-y-2">
            <div className="space-y-1"><Label className="text-xs">Cuenta de correo</Label>
              <Select value={c.account_id || ""} onValueChange={v => set("account_id", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cuenta" /></SelectTrigger>
                <SelectContent>{emailAccounts.map((ea: any) => <SelectItem key={ea.id} value={ea.id}>{ea.email}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Destinatarios</Label>
              <Select value={c.recipients || "all"} onValueChange={v => set("recipients", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  <SelectItem value="by_status">Por estado</SelectItem>
                  <SelectItem value="by_tag">Por etiqueta</SelectItem>
                  <SelectItem value="by_sector">Por sector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {c.recipients === "by_status" && <Input value={c.filter_value || ""} onChange={e => set("filter_value", e.target.value)} placeholder="Estado: lead, activo..." />}
            {c.recipients === "by_tag" && <Input value={c.filter_value || ""} onChange={e => set("filter_value", e.target.value)} placeholder="Etiqueta" />}
            {c.recipients === "by_sector" && <Input value={c.filter_value || ""} onChange={e => set("filter_value", e.target.value)} placeholder="Sector" />}
            <Input value={c.subject || ""} onChange={e => set("subject", e.target.value)} placeholder="Asunto del email" />
            <Textarea value={c.body || ""} onChange={e => set("body", e.target.value)} placeholder="Cuerpo del email. Variables: {{nombre}}, {{empresa}}" rows={3} />
          </div>
        );
      case "create_task":
        return (
          <div className="space-y-2">
            <Input value={c.title || ""} onChange={e => set("title", e.target.value)} placeholder="Título de la tarea" />
            <Input value={c.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descripción" />
            <div className="grid grid-cols-2 gap-2">
              <Select value={c.priority || "media"} onValueChange={v => set("priority", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={c.assignee || ""} onChange={e => set("assignee", e.target.value)} placeholder="Asignado a" />
            </div>
          </div>
        );
      case "create_event":
        return (
          <div className="space-y-2">
            <Input value={c.title || ""} onChange={e => set("title", e.target.value)} placeholder="Título del evento" />
            <Input value={c.description || ""} onChange={e => set("description", e.target.value)} placeholder="Descripción" />
          </div>
        );
      case "notify":
        return (
          <div className="space-y-2">
            <Textarea value={c.message || ""} onChange={e => set("message", e.target.value)} placeholder="Mensaje de notificación" rows={2} />
          </div>
        );
      case "send_whatsapp":
      case "send_telegram":
        return (
          <div className="space-y-2">
            <Textarea value={c.message || ""} onChange={e => set("message", e.target.value)} placeholder="Mensaje. Variables: {{nombre}}" rows={2} />
          </div>
        );
      case "update_status":
        return (
          <Select value={c.new_status || "activo"} onValueChange={v => set("new_status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{clientStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        );
      case "add_tag":
        return <Input value={c.tag || ""} onChange={e => set("tag", e.target.value)} placeholder="Nombre de la etiqueta" />;
      case "wait":
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" min={1} value={c.duration || 1} onChange={e => set("duration", parseInt(e.target.value))} />
            <Select value={c.unit || "days"} onValueChange={v => set("unit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="minutes">Minutos</SelectItem><SelectItem value="hours">Horas</SelectItem><SelectItem value="days">Días</SelectItem></SelectContent>
            </Select>
          </div>
        );
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{automation ? "Editar Automatización" : "Nueva Automatización"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: Basic */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Zap className="h-4 w-4 text-accent" />Información básica</h3>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la automatización" />
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción (opcional)" rows={2} />
          </div>

          <Separator />

          {/* Section 2: Trigger */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">🎯 Trigger — ¿Cuándo se dispara?</h3>
            <Select value={triggerType} onValueChange={v => { setTriggerType(v); setTriggerConfig({}); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{triggerTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label} — {t.desc}</SelectItem>)}</SelectContent>
            </Select>
            {renderTriggerFields()}
          </div>

          <Separator />

          {/* Section 3: Filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">🔍 Filtros (opcional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Estado del cliente</Label>
                <Select value={filters.client_status || ""} onValueChange={v => updateFilter("client_status", v)}>
                  <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                  <SelectContent>{clientStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label className="text-xs">Etiqueta</Label>
                <Input value={filters.tag || ""} onChange={e => updateFilter("tag", e.target.value)} placeholder="Ej: premium" />
              </div>
              <div className="space-y-1"><Label className="text-xs">Sector</Label>
                <Input value={filters.sector || ""} onChange={e => updateFilter("sector", e.target.value)} placeholder="Ej: Tecnología" />
              </div>
              <div className="space-y-1"><Label className="text-xs">Servicio asignado</Label>
                <Select value={filters.service_id || ""} onValueChange={v => updateFilter("service_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
                  <SelectContent>{services.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 4: Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">⚡ Acciones — ¿Qué hacer?</h3>
              <Button variant="outline" size="sm" onClick={addAction} className="gap-1"><Plus className="h-3.5 w-3.5" />Añadir</Button>
            </div>
            {actions.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Sin acciones. Añade al menos una.</p>}
            {actions.map((action, i) => {
              const at = actionTypes.find(a => a.value === action.type);
              const Icon = at?.icon || Zap;
              return (
                <div key={i} className="bg-muted/50 rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{i + 1}</Badge>
                    <Icon className="h-4 w-4 text-accent shrink-0" />
                    <Select value={action.type} onValueChange={v => updateAction(i, "type", v)}>
                      <SelectTrigger className="flex-1 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{actionTypes.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveAction(i, -1)} disabled={i === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveAction(i, 1)} disabled={i === actions.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeAction(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  {renderActionFields(action, i)}
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>{automation ? "Guardar cambios" : "Crear automatización"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAutomationDialog;
