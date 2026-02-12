
-- Internal chat threads between two users
CREATE TABLE public.internal_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_chat_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT no_self_chat CHECK (user1_id <> user2_id)
);

ALTER TABLE public.internal_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chats"
ON public.internal_chats FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats they participate in"
ON public.internal_chats FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their own chats"
ON public.internal_chats FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their own chats"
ON public.internal_chats FOR DELETE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Internal messages
CREATE TABLE public.internal_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES public.internal_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
ON public.internal_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.internal_chats
    WHERE id = chat_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their chats"
ON public.internal_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.internal_chats
    WHERE id = chat_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own messages"
ON public.internal_messages FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internal_messages;

-- Index for faster message queries
CREATE INDEX idx_internal_messages_chat_id ON public.internal_messages(chat_id, created_at);
CREATE INDEX idx_internal_chats_users ON public.internal_chats(user1_id, user2_id);
