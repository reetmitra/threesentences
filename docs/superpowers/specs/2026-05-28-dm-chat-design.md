# Direct Messaging — Design Spec
**Date:** 2026-05-28  
**Scope:** 1:1 DM chat with persistent history, efficient realtime, and minimal DB compute  
**Status:** Approved

---

## Problem

The existing chat infrastructure has a `messages` table and UI components, but no `conversations` table. This means:

- Conversation list load = full `messages` table scan (O(messages), degrades over time)
- Message fetch = unbounded (no pagination)
- Realtime subscription = all messages for a user (fires on every conversation, not just the open one)
- Unread count = derived by scanning unread rows on every load
- Typing indicators = not implemented (placeholder only)

---

## Goals

- Conversation list always loads in O(conversations) regardless of message history depth
- Send a message in one DB round-trip (atomic insert + conversation update)
- Two narrow realtime subscriptions per active user — no more
- Typing indicators with zero DB writes
- Cursor-based pagination for message history
- Optimistic sends with failure/retry UI

---

## Schema

### New table: `conversations`

```sql
CREATE TABLE public.conversations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id             TEXT NOT NULL,
  user_b_id             TEXT NOT NULL,
  last_message_content  TEXT,
  last_message_at       TIMESTAMPTZ,
  last_message_sender_id TEXT,
  unread_count_a        INT NOT NULL DEFAULT 0,
  unread_count_b        INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);

CREATE INDEX conversations_user_a ON public.conversations(user_a_id);
CREATE INDEX conversations_user_b ON public.conversations(user_b_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
```

Canonical ordering (`user_a_id < user_b_id` lexicographically) guarantees exactly one row per user pair — no duplicates possible even under concurrent inserts.

`unread_count_a` is the unread count for `user_a`; `unread_count_b` for `user_b`. The current user's unread count is whichever column matches their ID.

### Messages table: add `conversation_id`

```sql
ALTER TABLE public.messages
  ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

CREATE INDEX messages_conversation_at
  ON public.messages(conversation_id, created_at DESC);
```

`sender_id` is kept. `receiver_id` is deprecated for DMs — new DM messages use `conversation_id` only. Existing messages without a `conversation_id` must be backfilled during migration (create conversation rows for each unique sender/receiver pair, then populate `conversation_id` on their messages). `group_id` path is unaffected.

### RLS Policies

```sql
-- Conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT USING (
    user_a_id = auth.uid()::TEXT OR user_b_id = auth.uid()::TEXT
  );

CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (
    user_a_id = auth.uid()::TEXT OR user_b_id = auth.uid()::TEXT
  );

CREATE POLICY "conversations_update" ON public.conversations
  FOR UPDATE USING (
    user_a_id = auth.uid()::TEXT OR user_b_id = auth.uid()::TEXT
  );

-- Messages (DM path)
CREATE POLICY "messages_select_dm" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_a_id = auth.uid()::TEXT OR user_b_id = auth.uid()::TEXT
    )
  );

CREATE POLICY "messages_insert_dm" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()::TEXT AND
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_a_id = auth.uid()::TEXT OR user_b_id = auth.uid()::TEXT
    )
  );
```

---

## RPC Functions

### `get_or_create_conversation(p_user_id_1, p_user_id_2)`

```sql
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user_id_1 TEXT,
  p_user_id_2 TEXT
) RETURNS public.conversations AS $$
DECLARE
  v_user_a TEXT;
  v_user_b TEXT;
  v_conversation public.conversations;
BEGIN
  IF p_user_id_1 < p_user_id_2 THEN
    v_user_a := p_user_id_1; v_user_b := p_user_id_2;
  ELSE
    v_user_a := p_user_id_2; v_user_b := p_user_id_1;
  END IF;

  INSERT INTO public.conversations (user_a_id, user_b_id)
  VALUES (v_user_a, v_user_b)
  ON CONFLICT (user_a_id, user_b_id) DO NOTHING;

  SELECT * INTO v_conversation
  FROM public.conversations
  WHERE user_a_id = v_user_a AND user_b_id = v_user_b;

  RETURN v_conversation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Called when a user taps "Message" on a friend's card. `ON CONFLICT DO NOTHING` handles the race where both users tap simultaneously — one insert wins, both get the same row back.

### `send_dm(p_conversation_id, p_sender_id, p_content)`

```sql
CREATE OR REPLACE FUNCTION public.send_dm(
  p_conversation_id UUID,
  p_sender_id       TEXT,
  p_content         TEXT
) RETURNS public.messages AS $$
DECLARE
  v_message public.messages;
BEGIN
  INSERT INTO public.messages (conversation_id, sender_id, content)
  VALUES (p_conversation_id, p_sender_id, p_content)
  RETURNING * INTO v_message;

  UPDATE public.conversations
  SET
    last_message_content   = p_content,
    last_message_at        = NOW(),
    last_message_sender_id = p_sender_id,
    -- Increment unread for the recipient only
    unread_count_a = CASE
      WHEN user_b_id = p_sender_id THEN unread_count_a + 1
      ELSE unread_count_a
    END,
    unread_count_b = CASE
      WHEN user_a_id = p_sender_id THEN unread_count_b + 1
      ELSE unread_count_b
    END,
    updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Single network round-trip: inserts the message and updates conversation metadata atomically. The recipient's unread count is incremented; the sender's is unchanged.

### `mark_conversation_read(p_conversation_id, p_user_id)`

```sql
CREATE OR REPLACE FUNCTION public.mark_conversation_read(
  p_conversation_id UUID,
  p_user_id         TEXT
) RETURNS void AS $$
BEGIN
  UPDATE public.conversations
  SET
    unread_count_a = CASE WHEN user_a_id = p_user_id THEN 0 ELSE unread_count_a END,
    unread_count_b = CASE WHEN user_b_id = p_user_id THEN 0 ELSE unread_count_b END,
    updated_at = NOW()
  WHERE id = p_conversation_id
    AND (user_a_id = p_user_id OR user_b_id = p_user_id);

  UPDATE public.messages
  SET is_read = TRUE
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Called on chat screen mount and on foreground resume. Zeros the unread count and marks individual message rows as read (for the double-checkmark read-receipt UI).

---

## Data Layer (`store/chat.ts`)

All functions are rewritten. Exports remain the same so screens don't break.

### `getConversations(userId: string): Promise<Conversation[]>`
Query `conversations` where `user_a_id = userId OR user_b_id = userId`, ordered by `last_message_at DESC NULLS LAST`. Batch-fetch the other participant's profile for each row. Extract `unreadCount` as `unread_count_a` when `userId === user_a_id`, else `unread_count_b`. Returns in one query + one batched profile fetch.

### `getOrCreateConversation(currentUser: UserInfo, otherUser: UserInfo): Promise<Conversation>`
Calls `supabase.rpc('get_or_create_conversation', { p_user_id_1, p_user_id_2 })`. Returns a `Conversation` with the real UUID. This UUID is the route param for the chat screen.

### `getMessages(conversationId: string, cursor: string | null): Promise<{ messages: Message[], nextCursor: string | null }>`
Fetches 30 rows: `WHERE conversation_id = id [AND created_at < cursor] ORDER BY created_at DESC LIMIT 30`. Returns messages in ascending order (reversed for FlatList). `nextCursor` is the `created_at` of the oldest returned message; `null` when fewer than 30 rows returned (no more pages).

### `sendMessage(conversationId: string, senderId: string, content: string): Promise<Message>`
Calls `supabase.rpc('send_dm', { p_conversation_id, p_sender_id, p_content })`. Returns the inserted message row. The screen handles optimistic state locally — this function is only concerned with the DB write.

### `markAsRead(conversationId: string, userId: string): Promise<void>`
Calls `supabase.rpc('mark_conversation_read', { p_conversation_id, p_user_id })`.

### `subscribeToConversations(userId: string, onUpdate: (conversation: Conversation) => void): () => void`
`postgres_changes` UPDATE on `conversations` filtered to `user_a_id=eq.${userId}` OR `user_b_id=eq.${userId}`. Fires when any conversation's last message or unread count changes. The callback receives the updated conversation row; the screen patches it in-place. Returns unsubscribe function.

### `subscribeToMessages(conversationId: string, onNewMessage: (message: Message) => void): () => void`
`postgres_changes` INSERT on `messages` filtered to `conversation_id=eq.${conversationId}`. Only fires for the open conversation. Returns unsubscribe function.

### `broadcastTyping(conversationId: string, userId: string, isTyping: boolean): void`
Publishes to Supabase Broadcast channel `typing:${conversationId}`. No DB interaction.

### `subscribeToTyping(conversationId: string, onTyping: (userId: string, isTyping: boolean) => void): () => void`
Subscribes to Broadcast channel `typing:${conversationId}`. Returns unsubscribe function.

---

## Realtime Architecture

At any point, a user has at most **two `postgres_changes` subscriptions** (database-level) plus one Broadcast channel when a chat is open:

| Subscription | Type | Filter | Event | Purpose |
|---|---|---|---|---|
| Conversation list | `postgres_changes` on `conversations` | `user_a_id = userId` OR `user_b_id = userId` | UPDATE | Patch list when message arrives in any conversation |
| Open chat | `postgres_changes` on `messages` | `conversation_id = id` | INSERT | Append incoming messages in real time |
| Typing | Supabase Broadcast `typing:{id}` | n/a | n/a | Show/hide typing indicator — no DB reads or writes |

Both DB subscriptions are unsubscribed on screen unmount. Supabase client handles reconnection automatically; on reconnect the app re-fetches the conversation list and current messages to catch any gap.

---

## Screen Changes

### `conversations.tsx`
- Mount: `getConversations(userId)` + `subscribeToConversations(userId, patch)`
- `patch(updatedConversation)`: replace matching item in state array by `id` — no full reload
- Navigate to chat: `router.push('/(tabs)/chat/[id]', { id: conversation.id })` — real UUID
- Unmount: unsubscribe

### `chat/[id].tsx`
- `id` param is conversation UUID
- Mount sequence:
  1. Load conversation row → extract other participant's userId → fetch their profile
  2. `getMessages(conversationId, null)` — last 30, reversed for display
  3. `markAsRead(conversationId, userId)`
  4. `subscribeToMessages(conversationId, append)`
  5. `subscribeToTyping(conversationId, setTyping)`
- **Optimistic send:** append local message with `status: 'sending'` → call `sendMessage()` → update to `'sent'` on success, `'failed'` on error
- **Retry:** `MessageBubble` `onRetry` prop re-calls `sendMessage` for the failed message
- **Pagination:** FlatList `onEndReached` (inverted list = scroll up) → `getMessages(conversationId, cursor)` → prepend, update cursor; disabled when `nextCursor` is null
- **Typing:** `ChatInput` `onTypingStart` → `broadcastTyping(id, userId, true)`, debounced `onTypingEnd` → `broadcastTyping(id, userId, false)`
- **Foreground resume:** `AppState` listener → `markAsRead(conversationId, userId)`
- Unmount: unsubscribe both subscriptions

### `social.tsx`
No changes. `handleMessage` already calls `getOrCreateConversation` and routes with `conversation.id`. After the redesign this returns the real UUID.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Send failure | Message marked `status: 'failed'`; tap to retry via `onRetry` |
| Realtime drop | Supabase client auto-reconnects; on reconnect re-fetch conversation list + current messages |
| Concurrent conversation create | `ON CONFLICT DO NOTHING` in RPC — one insert wins, both callers get the same row |
| Pagination end | `nextCursor = null` disables `onEndReached` handler |
| Profile fetch failure | Fall back to initials derived from userId — non-blocking |
| Mark-read failure | Silent — unread count may be stale until next mount; not critical |

---

## Efficiency Summary

| Operation | Before | After |
|---|---|---|
| Load conversation list | O(messages) scan | O(conversations) — single indexed query |
| Send a message | 1 insert | 1 RPC (insert + conversation update, atomic) |
| Load messages | All messages, unbounded | 30 rows, cursor-paginated |
| Mark as read | Scan + bulk update | 1 RPC (two targeted UPDATEs) |
| Realtime (per user) | 1 broad subscription | 2 narrow subscriptions |
| Typing indicators | Not implemented | 0 DB writes (Broadcast only) |
