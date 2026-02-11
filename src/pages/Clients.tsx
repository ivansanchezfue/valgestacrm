import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
import { clients } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusStyles: Record<string, string> = {
  activo: "bg-success/10 text-success border-success/20",
  lead: "bg-warning/10 text-warning border-warning/20",
  inactivo: "bg-muted text-muted-foreground border-border",
};

const Clients = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">{clients.length} clientes registrados</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Tipo</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Responsable</TableHead>
              <TableHead className="font-semibold">Etiquetas</TableHead>
              <TableHead className="font-semibold">Creado</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className="cursor-pointer hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.email}</p>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-sm text-muted-foreground">{client.type}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-xs capitalize ${statusStyles[client.status]}`}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.owner}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {client.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.createdAt}</TableCell>
                <TableCell>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default Clients;
