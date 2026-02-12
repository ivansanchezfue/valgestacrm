import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Filter, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSupabaseQuery, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import CreateClientDialog from "@/components/dialogs/CreateClientDialog";
import EditClientDialog from "@/components/dialogs/EditClientDialog";
import AssignServiceDialog from "@/components/dialogs/AssignServiceDialog";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  activo: "bg-success/10 text-success border-success/20",
  lead: "bg-warning/10 text-warning border-warning/20",
  inactivo: "bg-muted text-muted-foreground border-border",
};

const Clients = () => {
  const [search, setSearch] = useState("");
  const [editClient, setEditClient] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useSupabaseQuery<any>("clients");
  const insertMutation = useSupabaseInsert("clients");
  const updateMutation = useSupabaseUpdate("clients");
  const deleteMutation = useSupabaseDelete("clients");
  const { user } = useAuth();

  const filtered = clients.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (form: any) => {
    await insertMutation.mutateAsync({ ...form, created_by: user?.id });
    toast.success("Cliente creado");
  };

  const handleUpdate = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast.success("Cliente eliminado");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">{clients.length} clientes registrados</p>
        </div>
        <CreateClientDialog onCreated={handleCreate} />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="bg-card rounded-xl border overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Responsable</TableHead>
                    <TableHead className="font-semibold">Etiquetas</TableHead>
                    <TableHead className="font-semibold">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((client: any) => (
                    <TableRow key={client.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div><p className="font-medium text-foreground">{client.name}</p><p className="text-xs text-muted-foreground">{client.email}</p></div>
                      </TableCell>
                      <TableCell className="capitalize text-sm text-muted-foreground">{client.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs capitalize ${statusStyles[client.status]}`}>{client.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{client.owner}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">{(client.tags || []).map((tag: string) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <AssignServiceDialog clientId={client.id} clientName={client.name} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditClient(client)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(client.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((client: any) => (
              <div key={client.id} className="bg-card rounded-xl border p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className={`text-xs capitalize ${statusStyles[client.status]}`}>{client.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditClient(client)}><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(client.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{client.type}</span>
                  <span>{client.owner}</span>
                </div>
                <AssignServiceDialog clientId={client.id} clientName={client.name} />
              </div>
            ))}
          </div>
        </>
      )}

      <EditClientDialog
        client={editClient}
        open={!!editClient}
        onOpenChange={(open) => !open && setEditClient(null)}
        onSave={handleUpdate}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará el cliente y todos sus datos asociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { handleDelete(deleteId); setDeleteId(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Clients;
