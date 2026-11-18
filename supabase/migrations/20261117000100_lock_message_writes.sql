-- Close direct-write bypasses (2026-11-17)
-- DMs, conversation creation and read receipts all go through the SECURITY DEFINER
-- RPCs (send_dm, get_or_create_conversation, mark_conversation_read), which check
-- the caller and blocks. Direct table writes skipped those checks:
--  * a blocked user could INSERT messages straight into the table
--  * a participant could UPDATE a conversation's last_message_content preview
--  * a receiver could UPDATE the content of messages sent to them

DROP POLICY IF EXISTS messages_insert_dm ON public.messages;
DROP POLICY IF EXISTS messages_insert ON public.messages;
DROP POLICY IF EXISTS messages_update ON public.messages;
-- Only group messages may be inserted directly, and only by group members.
CREATE POLICY messages_insert ON public.messages FOR INSERT WITH CHECK (
  (auth.uid())::text = sender_id
  AND group_id IS NOT NULL
  AND conversation_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = messages.group_id AND gm.user_id = (auth.uid())::text
  )
);

DROP POLICY IF EXISTS conversations_insert ON public.conversations;
DROP POLICY IF EXISTS conversations_update ON public.conversations;
