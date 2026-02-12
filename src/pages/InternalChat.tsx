import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Send, Search, MoreVertical, Trash2, MessageSquarePlus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string | null;
  last_message_at: string;
  other_user?: Profile;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

const InternalChat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load chats
  const loadChats = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("internal_chats")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error) { console.error(error); return; }

    // Load other user profiles
    const otherIds = (data || []).map(c => c.user1_id === user.id ? c.user2_id : c.user1_id);
    const uniqueIds = [...new Set(otherIds)];

    let profilesMap: Record<string, Profile> = {};
    if (uniqueIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", uniqueIds);
      if (profs) profs.forEach(p => { profilesMap[p.id] = p; });
    }

    const enriched = (data || []).map(c => ({
      ...c,
      other_user: profilesMap[c.user1_id === user.id ? c.user2_id : c.user1_id],
    }));
    setChats(enriched);
  }, [user]);

  // Load messages for selected chat
  const loadMessages = useCallback(async (chatId: string) => {
    const { data, error } = await supabase
      .from("internal_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (error) { console.error(error); return; }
    setMessages(data || []);
    setTimeout(scrollToBottom, 100);
  }, [scrollToBottom]);

  // Load profiles for search
  const loadProfiles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").neq("id", user.id);
    setProfiles(data || []);
  }, [user]);

  useEffect(() => { loadChats(); loadProfiles(); }, [loadChats, loadProfiles]);

  useEffect(() => {
    if (selectedChat) loadMessages(selectedChat.id);
  }, [selectedChat, loadMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!selectedChat) return;
    const channel = supabase
      .channel(`internal_messages_${selectedChat.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "internal_messages",
        filter: `chat_id=eq.${selectedChat.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(scrollToBottom, 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, scrollToBottom]);

  // Realtime for chat list updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("internal_chats_list")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "internal_chats",
      }, () => { loadChats(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadChats]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !user || sending) return;
    setSending(true);
    const body = newMessage.trim();
    setNewMessage("");

    const { error: msgError } = await supabase.from("internal_messages").insert({
      chat_id: selectedChat.id,
      sender_id: user.id,
      body,
    });

    if (msgError) { toast.error("Error al enviar mensaje"); setSending(false); return; }

    await supabase.from("internal_chats").update({
      last_message: body,
      last_message_at: new Date().toISOString(),
    }).eq("id", selectedChat.id);

    setSending(false);
    inputRef.current?.focus();
  };

  const handleSelectUser = async (profile: Profile) => {
    if (!user) return;
    setSearchOpen(false);

    // Check existing chat (both directions)
    const { data: existing } = await supabase
      .from("internal_chats")
      .select("*")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${user.id})`);

    if (existing && existing.length > 0) {
      const chat = { ...existing[0], other_user: profile };
      setSelectedChat(chat);
      return;
    }

    // Create new chat (ensure user1_id < user2_id for consistency)
    const [u1, u2] = user.id < profile.id ? [user.id, profile.id] : [profile.id, user.id];
    const { data: newChat, error } = await supabase
      .from("internal_chats")
      .insert({ user1_id: u1, user2_id: u2 })
      .select()
      .single();

    if (error) { toast.error("Error al crear conversación"); return; }
    setSelectedChat({ ...newChat, other_user: profile });
    loadChats();
  };

  const handleDeleteChat = async () => {
    if (!deleteChat) return;
    const { error } = await supabase.from("internal_chats").delete().eq("id", deleteChat.id);
    if (error) { toast.error("Error al eliminar conversación"); return; }
    toast.success("Conversación eliminada");
    if (selectedChat?.id === deleteChat.id) { setSelectedChat(null); setMessages([]); }
    setDeleteChat(null);
    loadChats();
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const formatTime = (date: string) => {
    try { return format(new Date(date), "HH:mm", { locale: es }); } catch { return ""; }
  };

  const formatDate = (date: string) => {
    try { return format(new Date(date), "d MMM", { locale: es }); } catch { return ""; }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Chat list panel */}
      <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r border-border bg-card`}>
        {/* Header with search */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Chat Interno</h2>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="Nueva conversación">
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Buscar usuario..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron usuarios</CommandEmpty>
                    <CommandGroup heading="Usuarios">
                      {profiles.map(p => (
                        <CommandItem key={p.id} onSelect={() => handleSelectUser(p)} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shrink-0">
                              {getInitials(p.full_name || p.email)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{p.full_name || "Sin nombre"}</p>
                              <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <MessageSquarePlus className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No tienes conversaciones</p>
              <p className="text-xs mt-1">Usa el botón + para iniciar una</p>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors ${selectedChat?.id === chat.id ? "bg-accent" : ""}`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                  {getInitials(chat.other_user?.full_name || chat.other_user?.email || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate text-foreground">{chat.other_user?.full_name || chat.other_user?.email || "Usuario"}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(chat.last_message_at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{chat.last_message || "Sin mensajes"}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); setDeleteChat(chat); }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Eliminar conversación
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className={`${selectedChat ? "flex" : "hidden md:flex"} flex-1 flex-col bg-background`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
              <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                {getInitials(selectedChat.other_user?.full_name || selectedChat.other_user?.email || "?")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{selectedChat.other_user?.full_name || "Usuario"}</p>
                <p className="text-xs text-muted-foreground truncate">{selectedChat.other_user?.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive" onClick={() => setDeleteChat(selectedChat)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar conversación
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-border bg-card">
              <form
                onSubmit={e => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 max-w-3xl mx-auto"
              >
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquarePlus className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Selecciona una conversación</p>
              <p className="text-sm mt-1">o inicia una nueva con el botón +</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteChat} onOpenChange={open => !open && setDeleteChat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los mensajes con {deleteChat?.other_user?.full_name || "este usuario"}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InternalChat;
