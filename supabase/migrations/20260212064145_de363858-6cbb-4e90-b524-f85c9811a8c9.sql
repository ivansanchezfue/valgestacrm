
-- Add status column to internal_messages
ALTER TABLE public.internal_messages ADD COLUMN status text NOT NULL DEFAULT 'delivered';

-- Allow participants to update message status in their chats
CREATE POLICY "Users can update message status in their chats"
  ON public.internal_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM internal_chats
      WHERE internal_chats.id = internal_messages.chat_id
      AND (internal_chats.user1_id = auth.uid() OR internal_chats.user2_id = auth.uid())
    )
  );
