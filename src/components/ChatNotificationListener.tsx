import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

const ChatNotificationListener = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const profilesCache = useRef<Record<string, Profile>>({});

  const getProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (profilesCache.current[userId]) return profilesCache.current[userId];
    const { data } = await supabase.from("profiles").select("id, full_name, email").eq("id", userId).single();
    if (data) profilesCache.current[userId] = data;
    return data;
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("global_msg_notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "internal_messages",
      }, async (payload) => {
        const msg = payload.new as { id: string; chat_id: string; sender_id: string; body: string };
        if (msg.sender_id === user.id) return;

        // Check if user is participant of this chat
        const { data: chat } = await supabase
          .from("internal_chats")
          .select("id, user1_id, user2_id")
          .eq("id", msg.chat_id)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .single();

        if (!chat) return;

        // Don't notify if user is already viewing this chat
        if (location.pathname === "/chat") return;

        const sender = await getProfile(msg.sender_id);
        const name = sender?.full_name || sender?.email || "Nuevo mensaje";
        const preview = msg.body.length > 60 ? msg.body.substring(0, 60) + "..." : msg.body;

        toast.info(`${name}: ${preview}`, {
          duration: 5000,
          action: {
            label: "Ver",
            onClick: () => navigate("/chat"),
          },
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, location.pathname, navigate, getProfile]);

  return null;
};

export default ChatNotificationListener;
