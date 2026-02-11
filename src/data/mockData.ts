export interface Client {
  id: string;
  name: string;
  type: "empresa" | "particular";
  email: string;
  phone: string;
  status: "lead" | "activo" | "inactivo";
  tags: string[];
  owner: string;
  createdAt: string;
  sector?: string;
}

export interface ContactPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position?: string;
  clientId?: string;
  clientName?: string;
  preferredChannel: "email" | "whatsapp" | "telegram" | "phone";
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "unico" | "recurrente";
  cycle?: "mensual" | "anual";
  taxRate: number;
  status: "activo" | "inactivo";
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "alta" | "media" | "baja";
  status: "pendiente" | "en_progreso" | "completada" | "vencida";
  assignee: string;
  dueDate: string;
  clientName?: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  channel: "whatsapp" | "telegram" | "email";
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  status: "abierta" | "cerrada";
}

export const clients: Client[] = [
  { id: "1", name: "Grupo Tecnológico Ibérica", type: "empresa", email: "info@gti.es", phone: "+34 911 234 567", status: "activo", tags: ["VIP", "Tecnología"], owner: "Carlos M.", createdAt: "2024-11-15", sector: "Tecnología" },
  { id: "2", name: "Martínez & Asociados", type: "empresa", email: "contacto@martinez.com", phone: "+34 912 345 678", status: "activo", tags: ["Legal"], owner: "Ana R.", createdAt: "2024-12-01", sector: "Legal" },
  { id: "3", name: "María López García", type: "particular", email: "maria@gmail.com", phone: "+34 654 321 098", status: "lead", tags: ["Nuevo"], owner: "Carlos M.", createdAt: "2025-01-20" },
  { id: "4", name: "Distribuciones Levante S.L.", type: "empresa", email: "admin@dlevante.es", phone: "+34 963 456 789", status: "activo", tags: ["Distribución", "Premium"], owner: "Ana R.", createdAt: "2024-09-10", sector: "Distribución" },
  { id: "5", name: "Pedro Sánchez Ruiz", type: "particular", email: "pedro.sr@outlook.com", phone: "+34 678 901 234", status: "inactivo", tags: [], owner: "Luis T.", createdAt: "2024-06-15" },
  { id: "6", name: "Clínica Dental Sonrisa", type: "empresa", email: "info@sonrisa.es", phone: "+34 913 567 890", status: "activo", tags: ["Salud"], owner: "Carlos M.", createdAt: "2025-01-05", sector: "Salud" },
];

export const contacts: ContactPerson[] = [
  { id: "1", firstName: "Javier", lastName: "Fernández", email: "javier@gti.es", phone: "+34 611 222 333", position: "Director IT", clientId: "1", clientName: "Grupo Tecnológico Ibérica", preferredChannel: "email" },
  { id: "2", firstName: "Laura", lastName: "Martínez", email: "laura@martinez.com", phone: "+34 622 333 444", position: "Socia", clientId: "2", clientName: "Martínez & Asociados", preferredChannel: "whatsapp" },
  { id: "3", firstName: "María", lastName: "López García", email: "maria@gmail.com", phone: "+34 654 321 098", clientId: "3", clientName: "María López García", preferredChannel: "telegram" },
  { id: "4", firstName: "Andrés", lastName: "Gómez", email: "andres@dlevante.es", phone: "+34 644 555 666", position: "CEO", clientId: "4", clientName: "Distribuciones Levante S.L.", preferredChannel: "phone" },
  { id: "5", firstName: "Elena", lastName: "Ruiz", email: "elena@sonrisa.es", phone: "+34 655 666 777", position: "Administradora", clientId: "6", clientName: "Clínica Dental Sonrisa", preferredChannel: "email" },
];

export const services: Service[] = [
  { id: "1", name: "Consultoría Estratégica", description: "Análisis y planificación estratégica del negocio", price: 2500, currency: "EUR", type: "unico", taxRate: 21, status: "activo" },
  { id: "2", name: "Soporte Técnico Premium", description: "Soporte 24/7 con SLA de 2h", price: 450, currency: "EUR", type: "recurrente", cycle: "mensual", taxRate: 21, status: "activo" },
  { id: "3", name: "Desarrollo Web", description: "Diseño y desarrollo de sitios web a medida", price: 8000, currency: "EUR", type: "unico", taxRate: 21, status: "activo" },
  { id: "4", name: "Hosting Gestionado", description: "Alojamiento con monitorización y backups", price: 120, currency: "EUR", type: "recurrente", cycle: "mensual", taxRate: 21, status: "activo" },
  { id: "5", name: "Auditoría de Seguridad", description: "Análisis completo de seguridad informática", price: 3500, currency: "EUR", type: "unico", taxRate: 21, status: "activo" },
  { id: "6", name: "Mantenimiento Anual", description: "Mantenimiento preventivo y correctivo", price: 3600, currency: "EUR", type: "recurrente", cycle: "anual", taxRate: 21, status: "inactivo" },
];

export const tasks: Task[] = [
  { id: "1", title: "Llamar a Javier para renovación", priority: "alta", status: "pendiente", assignee: "Carlos M.", dueDate: "2025-02-12", clientName: "Grupo Tecnológico Ibérica" },
  { id: "2", title: "Enviar propuesta de soporte", priority: "media", status: "en_progreso", assignee: "Ana R.", dueDate: "2025-02-13", clientName: "Martínez & Asociados" },
  { id: "3", title: "Seguimiento lead María López", priority: "alta", status: "pendiente", assignee: "Carlos M.", dueDate: "2025-02-11", clientName: "María López García" },
  { id: "4", title: "Preparar informe mensual", priority: "baja", status: "completada", assignee: "Luis T.", dueDate: "2025-02-10" },
  { id: "5", title: "Revisar contrato Levante", priority: "media", status: "pendiente", assignee: "Ana R.", dueDate: "2025-02-15", clientName: "Distribuciones Levante S.L." },
  { id: "6", title: "Actualizar catálogo servicios", priority: "baja", status: "en_progreso", assignee: "Luis T.", dueDate: "2025-02-18" },
];

export const conversations: Conversation[] = [
  { id: "1", contactName: "Javier Fernández", channel: "whatsapp", lastMessage: "Perfecto, quedamos el jueves entonces.", timestamp: "Hace 5 min", unread: true, status: "abierta" },
  { id: "2", contactName: "Laura Martínez", channel: "email", lastMessage: "Adjunto el contrato revisado para su firma.", timestamp: "Hace 30 min", unread: true, status: "abierta" },
  { id: "3", contactName: "María López", channel: "telegram", lastMessage: "Me interesa saber más sobre el servicio de consultoría.", timestamp: "Hace 1h", unread: true, status: "abierta" },
  { id: "4", contactName: "Andrés Gómez", channel: "whatsapp", lastMessage: "Gracias, recibido.", timestamp: "Hace 3h", unread: false, status: "abierta" },
  { id: "5", contactName: "Elena Ruiz", channel: "email", lastMessage: "¿Podrían enviarme la factura del mes pasado?", timestamp: "Ayer", unread: false, status: "abierta" },
];

export const stats = {
  totalClients: 127,
  activeClients: 98,
  totalLeads: 24,
  pendingTasks: 15,
  unreadMessages: 3,
  revenue: 45200,
  conversionRate: 68,
  renewalsPending: 7,
};
