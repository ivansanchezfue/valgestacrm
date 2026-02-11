import { motion } from "framer-motion";
import { Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const users = [
  { id: "1", name: "Carlos Martínez", email: "carlos@valgesta.com", role: "Admin", status: "activo" },
  { id: "2", name: "Ana Ruiz", email: "ana@valgesta.com", role: "Manager", status: "activo" },
  { id: "3", name: "Luis Torres", email: "luis@valgesta.com", role: "Agente", status: "activo" },
  { id: "4", name: "Elena Gómez", email: "elena@valgesta.com", role: "Agente", status: "inactivo" },
];

const roleColors: Record<string, string> = {
  Admin: "bg-destructive/10 text-destructive",
  Manager: "bg-accent/10 text-accent",
  Agente: "bg-info/10 text-info",
};

const SettingsUsersRoles = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios y Roles</h1>
          <p className="text-muted-foreground mt-1">Gestión de equipo y permisos</p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo Usuario</Button>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Rol</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge variant="secondary" className={`text-[10px] ${roleColors[u.role] || ""}`}>{u.role}</Badge></TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] capitalize ${u.status === "activo" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default SettingsUsersRoles;