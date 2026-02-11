import { motion } from "framer-motion";
import { Plus, Copy, Trash2, Key, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
}

const defaultKeys: ApiKey[] = [
  { id: "1", name: "Producción", key: "vcrm_prod_sk_1234567890abcdef", created: "2025-01-15", lastUsed: "Hace 2h" },
  { id: "2", name: "Desarrollo", key: "vcrm_dev_sk_0987654321fedcba", created: "2025-02-01", lastUsed: "Hace 1 día" },
];

const SettingsApiKeys = () => {
  const [keys, setKeys] = useState(defaultKeys);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const createKey = () => {
    if (!newName.trim()) return;
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newName,
      key: `vcrm_${newName.toLowerCase().replace(/\s/g, "_")}_sk_${Math.random().toString(36).slice(2, 18)}`,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Nunca",
    };
    setKeys([...keys, newKey]);
    setNewName("");
    setOpen(false);
    toast.success("API Key creada");
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
    toast.success("API Key eliminada");
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copiada al portapapeles");
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-1">Claves de acceso a la API de ValgestaCRM</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Nueva API Key</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear API Key</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Producción, Desarrollo..." /></div>
              <div className="flex justify-end"><Button onClick={createKey}>Crear</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {keys.map(k => (
          <div key={k.id} className="bg-card rounded-xl border p-5 flex items-center gap-4 flex-wrap">
            <div className="rounded-lg bg-muted p-2.5 shrink-0"><Key className="h-4 w-4 text-muted-foreground" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{k.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs text-muted-foreground font-mono">
                  {visibleKeys.has(k.id) ? k.key : k.key.slice(0, 12) + "••••••••••"}
                </code>
                <button onClick={() => toggleVisibility(k.id)} className="text-muted-foreground hover:text-foreground">
                  {visibleKeys.has(k.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Creada: {k.created} · Último uso: {k.lastUsed}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => copyKey(k.key)}><Copy className="h-3.5 w-3.5" /></Button>
              <Button variant="outline" size="sm" onClick={() => deleteKey(k.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SettingsApiKeys;