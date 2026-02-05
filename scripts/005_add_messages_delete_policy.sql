-- Add DELETE policy for messages table
-- This allows users to delete their own messages (where they are sender or receiver)

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;

-- Users can delete messages they sent or received
CREATE POLICY "messages_delete_own" ON public.messages 
  FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Admin can delete any messages
DROP POLICY IF EXISTS "messages_delete_admin" ON public.messages;

CREATE POLICY "messages_delete_admin" ON public.messages 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
