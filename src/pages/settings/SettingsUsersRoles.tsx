import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, MoreHorizontal, Trash2, Key, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  manager: "bg-accent/10 text-accent",
  agent: "bg-primary/10 text-primary",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  agent: "Agente",
};

const SettingsUsersRoles = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "", role: "agent" });
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  const callManageUsers = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("manage-users", {
      body,
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const fetchUsers = async () => {
    try {
      const data = await callManageUsers({ action: "list" });
      setUsers(data.users || []);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error("Completa todos los campos");
      return;
    }
    setCreating(true);
    try {
      await callManageUsers({ action: "create", ...newUser });
      toast.success("Usuario creado exitosamente");
      setCreateOpen(false);
      setNewUser({ email: "", password: "", full_name: "", role: "agent" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Error al crear usuario");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await callManageUsers({ action: "delete", user_id: deleteTarget.id });
      toast.success("Usuario eliminado");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    }
  };

  const handleChangePassword = async () => {
    if (!passwordTarget || newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await callManageUsers({ action: "change_password", user_id: passwordTarget.id, new_password: newPassword });
      toast.success("Contraseña actualizada");
      setPasswordTarget(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar contraseña");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await callManageUsers({ action: "update_role", user_id: userId, role });
      toast.success("Rol actualizado");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar rol");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios y Roles</h1>
          <p className="text-muted-foreground mt-1">Gestión de equipo y permisos</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo Usuario</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Crear Usuario</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input placeholder="Nombre del usuario" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="correo@empresa.com" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" placeholder="Mínimo 6 caracteres" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="agent">Agente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={creating}>
                {creating ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando usuarios...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Nombre</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Rol</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-foreground">{u.full_name || "Sin nombre"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-[10px] capitalize ${roleColors[u.role] || ""}`}>
                      {roleLabels[u.role] || u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRoleChange(u.id, u.role === "admin" ? "agent" : "admin")}>
                          <Shield className="h-4 w-4 mr-2" />
                          {u.role === "admin" ? "Quitar Admin" : "Hacer Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setPasswordTarget(u); setNewPassword(""); }}>
                          <Key className="h-4 w-4 mr-2" />Cambiar Contraseña
                        </DropdownMenuItem>
                        {u.id !== user?.id && (
                          <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(u)}>
                            <Trash2 className="h-4 w-4 mr-2" />Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No hay usuarios</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>¿Estás seguro de eliminar a {deleteTarget?.full_name || deleteTarget?.email}? Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!passwordTarget} onOpenChange={(o) => { if (!o) setPasswordTarget(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cambiar contraseña de {passwordTarget?.full_name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} className="w-full">Actualizar Contraseña</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SettingsUsersRoles;
