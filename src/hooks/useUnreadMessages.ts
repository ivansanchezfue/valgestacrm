import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }

    // Get chats where user participates
    const { data: chats } = await supabase
      .from("internal_chats")
      .select("id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!chats || chats.length === 0) { setUnreadCount(0); return; }

    const chatIds = chats.map(c => c.id);
    const { count } = await supabase
      .from("internal_messages")
      .select("id", { count: "exact", head: true })
      .in("chat_id", chatIds)
      .neq("sender_id", user.id)
      .neq("status", "read");

    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("unread_badge")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_messages" }, () => {
        fetchUnreadCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnreadCount]);

  return unreadCount;
};
