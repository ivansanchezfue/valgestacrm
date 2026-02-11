import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Package } from "lucide-react";
import { services as initialServices, Service } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CreateServiceDialog from "@/components/dialogs/CreateServiceDialog";

const Services = () => {
  const [serviceList, setServiceList] = useState<Service[]>(initialServices);
  const [search, setSearch] = useState("");

  const filtered = serviceList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Servicios</h1>
          <p className="text-muted-foreground mt-1">Catálogo de servicios</p>
        </div>
        <CreateServiceDialog onCreated={(s) => setServiceList([...serviceList, s])} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar servicios..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <motion.div key={service.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border p-5 card-hover cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2.5"><Package className="h-5 w-5 text-accent" /></div>
                <div>
                  <p className="font-semibold text-foreground">{service.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px] capitalize">{service.type}</Badge>
                    {service.cycle && <span className="text-[10px] text-muted-foreground capitalize">{service.cycle}</span>}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${service.status === "activo" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                {service.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{service.description}</p>
            <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground">€{service.price.toLocaleString()}</span>
                {service.type === "recurrente" && <span className="text-sm text-muted-foreground">/{service.cycle === "mensual" ? "mes" : "año"}</span>}
              </div>
              <span className="text-xs text-muted-foreground">IVA {service.taxRate}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Services;