import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseQuery, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { toast } from "sonner";
import { Upload, FileText, Image, File, Trash2, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface EditClientDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

const fileIcon = (type: string) => {
  if (type?.startsWith("image/")) return <Image className="h-4 w-4 text-primary" />;
  if (type?.includes("pdf")) return <FileText className="h-4 w-4 text-destructive" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

const EditClientDialog = ({ client, open, onOpenChange, onSave }: EditClientDialogProps) => {
  const [form, setForm] = useState({ name: "", type: "empresa", email: "", phone: "", status: "lead", sector: "", owner: "", notes: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const { data: documents = [], refetch: refetchDocs } = useSupabaseQuery<any>("client_documents", {
    filters: client ? { client_id: client.id } : undefined,
    select: "*",
  });

  const deleteDocMutation = useSupabaseDelete("client_documents");

  useEffect(() => {
    if (client) {
      setForm({
        name: client.name || "",
        type: client.type || "empresa",
        email: client.email || "",
        phone: client.phone || "",
        status: client.status || "lead",
        sector: client.sector || "",
        owner: client.owner || "",
        notes: client.notes || "",
      });
    }
  }, [client]);

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) { toast.error("Nombre y email obligatorios"); return; }
    onSave({ id: client.id, ...form });
    onOpenChange(false);
    toast.success("Cliente actualizado");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !client) return;

    setUploading(true);
    try {
      const filePath = `${client.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("client-documents").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: insertError } = await (supabase.from("client_documents") as any).insert({
        client_id: client.id,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user?.id,
      });
      if (insertError) throw insertError;

      toast.success("Documento subido");
      refetchDocs();
    } catch (err: any) {
      toast.error(err.message || "Error al subir documento");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = (doc: any) => {
    const { data } = supabase.storage.from("client-documents").getPublicUrl(doc.file_path);
    window.open(data.publicUrl, "_blank");
  };

  const handleDeleteDoc = async (doc: any) => {
    try {
      await supabase.storage.from("client-documents").remove([doc.file_path]);
      await deleteDocMutation.mutateAsync(doc.id);
      toast.success("Documento eliminado");
      refetchDocs();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
        <Tabs defaultValue="datos" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="datos" className="flex-1">Datos</TabsTrigger>
            <TabsTrigger value="documentos" className="flex-1">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="datos">
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2"><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="empresa">Empresa</SelectItem><SelectItem value="particular">Particular</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lead">Lead</SelectItem><SelectItem value="activo">Activo</SelectItem><SelectItem value="inactivo">Inactivo</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Sector</Label><Input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} /></div>
                <div className="space-y-2"><Label>Responsable</Label><Input value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea
                  placeholder="Notas internas sobre este cliente..."
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Guardar</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos">
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.xml,.xlsx,.xls,.doc,.docx,.csv,.txt"
                  onChange={handleUpload}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {uploading ? "Subiendo..." : "Subir documento"}
                </Button>
              </div>

              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay documentos asociados a este cliente.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      {fileIcon(doc.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file_size ? formatSize(doc.file_size) : ""} · {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteDoc(doc)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
