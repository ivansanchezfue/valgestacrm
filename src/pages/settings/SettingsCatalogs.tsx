import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const defaultTags = ["VIP", "Tecnología", "Legal", "Salud", "Premium", "Distribución", "Nuevo"];
const defaultStatuses = ["lead", "activo", "inactivo"];

const SettingsCatalogs = () => {
  const [tags, setTags] = useState(defaultTags);
  const [newTag, setNewTag] = useState("");
  const [statuses] = useState(defaultStatuses);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      toast.success("Etiqueta añadida");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Catálogos</h1>
        <p className="text-muted-foreground mt-1">Etiquetas, estados y campos personalizados</p>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Etiquetas</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1.5">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Nueva etiqueta..." value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} className="max-w-xs" />
          <Button variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h3 className="font-semibold text-foreground">Estados de cliente</h3>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <Badge key={s} variant="outline" className="capitalize">{s}</Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Los estados por defecto no se pueden eliminar.</p>
      </div>
    </motion.div>
  );
};

export default SettingsCatalogs;