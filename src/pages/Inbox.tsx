import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, Paperclip, MoreVertical, ArrowLeft } from "lucide-react";
import { conversations } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const channelConfig: Record<string, { label: string; color: string }> = {
  whatsapp: { label: "WhatsApp", color: "bg-success" },
  telegram: { label: "Telegram", color: "bg-info" },
  email: { label: "Email", color: "bg-accent" },
};

const mockMessages = [
  { id: "1", text: "Hola, quería confirmar la reunión del jueves.", from: "contact", time: "10:32" },
  { id: "2", text: "¡Claro! Tenemos la sala reservada a las 16:00. ¿Te viene bien?", from: "agent", time: "10:35" },
  { id: "3", text: "Perfecto, quedamos el jueves entonces.", from: "contact", time: "10:38" },
];

const Inbox = () => {
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const selected = conversations.find((c) => c.id === selectedId);
  const isMobile = useIsMobile();
  const showChat = isMobile ? !!selectedId : true;
  const showList = isMobile ? !selectedId : true;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inbox</h1>
        <p className="text-muted-foreground mt-1">Bandeja de entrada omnicanal</p>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden flex" style={{ height: "calc(100vh - 200px)" }}>
        {/* Conversation List */}
        {showList && (
          <div className={`${isMobile ? "w-full" : "w-80"} border-r flex flex-col shrink-0`}>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9 h-9 text-sm" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`flex items-start gap-3 p-3 cursor-pointer border-b transition-colors ${
                    selectedId === conv.id && !isMobile ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                      {conv.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${channelConfig[conv.channel]?.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conv.unread ? "font-semibold text-foreground" : "text-foreground"}`}>{conv.contactName}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{conv.timestamp}</span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${conv.unread ? "text-foreground" : "text-muted-foreground"}`}>{conv.lastMessage}</p>
                  </div>
                  {conv.unread && <div className="mt-2 h-2 w-2 rounded-full bg-accent shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        {showChat && selected ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b">
              {isMobile && (
                <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                {selected.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{selected.contactName}</p>
                <Badge variant="secondary" className={`text-[10px] ${channelConfig[selected.channel]?.color} text-card`}>
                  {channelConfig[selected.channel]?.label}
                </Badge>
              </div>
              <button className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-5 w-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.from === "agent" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.from === "agent" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.from === "agent" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 sm:p-4 border-t">
              <div className="flex items-center gap-2">
                <button className="text-muted-foreground hover:text-foreground transition-colors"><Paperclip className="h-5 w-5" /></button>
                <Input placeholder="Escribe un mensaje..." className="flex-1" />
                <Button size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        ) : !isMobile ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Selecciona una conversación</div>
        ) : null}
      </div>
    </motion.div>
  );
};

export default Inbox;