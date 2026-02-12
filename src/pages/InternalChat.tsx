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
import { Send, MoreVertical, Trash2, MessageSquarePlus, ArrowLeft, Check, CheckCheck } from "lucide-react";
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
  has_unread?: boolean;
}

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  status: string;
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
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedChatRef = useRef<Chat | null>(null);

  useEffect(() => { selectedChatRef.current = selectedChat; }, [selectedChat]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async (chatId: string) => {
    if (!user) return;
    await supabase
      .from("internal_messages")
      .update({ status: "read" })
      .eq("chat_id", chatId)
      .neq("sender_id", user.id)
      .neq("status", "read");
  }, [user]);

  // Load chats with unread indicator
  const loadChats = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("internal_chats")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (error) { console.error(error); return; }

    const otherIds = (data || []).map(c => c.user1_id === user.id ? c.user2_id : c.user1_id);
    const uniqueIds = [...new Set(otherIds)];

    let profilesMap: Record<string, Profile> = {};
    if (uniqueIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("*").in("id", uniqueIds);
      if (profs) profs.forEach(p => { profilesMap[p.id] = p; });
    }

    // Check unread per chat
    const chatIds = (data || []).map(c => c.id);
    let unreadMap: Record<string, boolean> = {};
    if (chatIds.length > 0) {
      const { data: unreadMsgs } = await supabase
        .from("internal_messages")
        .select("chat_id")
        .in("chat_id", chatIds)
        .neq("sender_id", user.id)
        .neq("status", "read");
      if (unreadMsgs) {
        unreadMsgs.forEach(m => { unreadMap[m.chat_id] = true; });
      }
    }

    const enriched = (data || []).map(c => ({
      ...c,
      other_user: profilesMap[c.user1_id === user.id ? c.user2_id : c.user1_id],
      has_unread: !!unreadMap[c.id],
    }));
    setChats(enriched);
  }, [user]);

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

  const loadProfiles = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").neq("id", user.id);
    setProfiles(data || []);
  }, [user]);

  useEffect(() => { loadChats(); loadProfiles(); }, [loadChats, loadProfiles]);

  // When selecting a chat, load messages and mark as read
  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
      markAsRead(selectedChat.id);
    }
  }, [selectedChat, loadMessages, markAsRead]);

  // Realtime for new messages + status updates
  useEffect(() => {
    if (!selectedChat) return;
    const channel = supabase
      .channel(`msgs_${selectedChat.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "internal_messages",
        filter: `chat_id=eq.${selectedChat.id}`,
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark as read if from other user
        if (newMsg.sender_id !== user?.id) {
          markAsRead(selectedChat.id);
        }
        setTimeout(scrollToBottom, 100);
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "internal_messages",
        filter: `chat_id=eq.${selectedChat.id}`,
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, status: updated.status } : m));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedChat, scrollToBottom, user, markAsRead]);

  // Realtime for chat list updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("chats_list")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_chats" }, () => { loadChats(); })
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_messages" }, () => { loadChats(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadChats]);

  // Typing indicator via Broadcast
  useEffect(() => {
    if (!selectedChat || !user) return;
    const channel = supabase.channel(`typing_${selectedChat.id}`);
    channel.on("broadcast", { event: "typing" }, (payload) => {
      if (payload.payload?.user_id !== user.id) {
        setOtherTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 3000);
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
      setOtherTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [selectedChat, user]);

  const emitTyping = useCallback(() => {
    if (!selectedChat || !user) return;
    if (typingDebounceRef.current) return;
    supabase.channel(`typing_${selectedChat.id}`).send({
      type: "broadcast", event: "typing", payload: { user_id: user.id },
    });
    typingDebounceRef.current = setTimeout(() => { typingDebounceRef.current = null; }, 1000);
  }, [selectedChat, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    emitTyping();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !user || sending) return;
    setSending(true);
    const body = newMessage.trim();
    setNewMessage("");

    const { error: msgError } = await supabase.from("internal_messages").insert({
      chat_id: selectedChat.id, sender_id: user.id, body,
    });
    if (msgError) { toast.error("Error al enviar mensaje"); setSending(false); return; }

    await supabase.from("internal_chats").update({
      last_message: body, last_message_at: new Date().toISOString(),
    }).eq("id", selectedChat.id);

    setSending(false);
    inputRef.current?.focus();
  };

  const handleSelectUser = async (profile: Profile) => {
    if (!user) return;
    setSearchOpen(false);
    const { data: existing } = await supabase
      .from("internal_chats").select("*")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${profile.id}),and(user1_id.eq.${profile.id},user2_id.eq.${user.id})`);
    if (existing && existing.length > 0) {
      setSelectedChat({ ...existing[0], other_user: profile });
      return;
    }
    const [u1, u2] = user.id < profile.id ? [user.id, profile.id] : [profile.id, user.id];
    const { data: newChat, error } = await supabase
      .from("internal_chats").insert({ user1_id: u1, user2_id: u2 }).select().single();
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
  const formatTime = (date: string) => { try { return format(new Date(date), "HH:mm", { locale: es }); } catch { return ""; } };
  const formatDate = (date: string) => { try { return format(new Date(date), "d MMM", { locale: es }); } catch { return ""; } };

  const MessageStatus = ({ status }: { status: string }) => {
    if (status === "read") return <CheckCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    return <Check className="h-3.5 w-3.5 text-primary-foreground/50 shrink-0" />;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Chat list panel */}
      <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 flex-col border-r border-border bg-card`}>
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
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                    {getInitials(chat.other_user?.full_name || chat.other_user?.email || "?")}
                  </div>
                  {chat.has_unread && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate text-foreground ${chat.has_unread ? "font-bold" : "font-medium"}`}>
                      {chat.other_user?.full_name || chat.other_user?.email || "Usuario"}
                    </p>
                    <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(chat.last_message_at)}</span>
                  </div>
                  <p className={`text-xs truncate ${chat.has_unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {chat.last_message || "Sin mensajes"}
                  </p>
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
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
              <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary shrink-0">
                {getInitials(selectedChat.other_user?.full_name || selectedChat.other_user?.email || "?")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{selectedChat.other_user?.full_name || "Usuario"}</p>
                {otherTyping ? (
                  <p className="text-xs text-primary animate-pulse">Escribiendo...</p>
                ) : (
                  <p className="text-xs text-muted-foreground truncate">{selectedChat.other_user?.email}</p>
                )}
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

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
                {messages.map(msg => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                        <div className={`flex items-center gap-1 justify-end mt-1`}>
                          <p className={`text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{formatTime(msg.created_at)}</p>
                          {isMine && <MessageStatus status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 max-w-3xl mx-auto">
                <Input ref={inputRef} value={newMessage} onChange={handleInputChange} placeholder="Escribe un mensaje..." className="flex-1" autoComplete="off" />
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
