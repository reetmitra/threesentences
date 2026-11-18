-- Launch safety fixes (2026-11-17)
-- 1. Blocks + reports (App Store guideline 1.2)
-- 2. DM RPCs: caller must be the participant they claim to be; blocked pairs can't talk
-- 3. Per-user daily AI reflection cap (stops Anthropic bill abuse)
-- 4. delete_my_account() (App Store guideline 5.1.1(v))

-- ============ Blocks ============
CREATE TABLE IF NOT EXISTS public.blocks (
  blocker_id TEXT NOT NULL DEFAULT (auth.uid())::text,
  blocked_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY blocks_select ON public.blocks FOR SELECT USING ((auth.uid())::text = blocker_id);
CREATE POLICY blocks_insert ON public.blocks FOR INSERT WITH CHECK ((auth.uid())::text = blocker_id);
CREATE POLICY blocks_delete ON public.blocks FOR DELETE USING ((auth.uid())::text = blocker_id);

-- True when the caller and p_other have blocked each other in either direction.
CREATE OR REPLACE FUNCTION public.is_blocked_with(p_other TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = (auth.uid())::text AND blocked_id = p_other)
       OR (blocker_id = p_other AND blocked_id = (auth.uid())::text)
  );
$$;

-- Blocked users can't send friend requests either.
DROP POLICY IF EXISTS "friends_insert" ON public.friends;
CREATE POLICY "friends_insert" ON public.friends FOR INSERT
  WITH CHECK ((auth.uid())::text = user_id AND NOT public.is_blocked_with(friend_id));

-- ============ Reports ============
-- Insert-only for users; the owner reviews rows in the Supabase dashboard.
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id TEXT NOT NULL DEFAULT (auth.uid())::text,
  reported_user_id TEXT NOT NULL,
  conversation_id UUID,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_insert ON public.reports FOR INSERT WITH CHECK ((auth.uid())::text = reporter_id);

-- ============ DM RPCs: verify the caller ============
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_user_id_1 TEXT, p_user_id_2 TEXT)
RETURNS public.conversations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me TEXT := (auth.uid())::text;
  v_user_a TEXT;
  v_user_b TEXT;
  v_conversation public.conversations;
BEGIN
  IF v_me IS NULL OR v_me NOT IN (p_user_id_1, p_user_id_2) THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;
  IF public.is_blocked_with(CASE WHEN v_me = p_user_id_1 THEN p_user_id_2 ELSE p_user_id_1 END) THEN
    RAISE EXCEPTION 'blocked' USING ERRCODE = '42501';
  END IF;

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
$$;

CREATE OR REPLACE FUNCTION public.send_dm(p_conversation_id UUID, p_sender_id TEXT, p_content TEXT)
RETURNS public.messages
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_message public.messages;
  v_receiver_id TEXT;
BEGIN
  IF (auth.uid())::text IS DISTINCT FROM p_sender_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  SELECT CASE WHEN user_a_id = p_sender_id THEN user_b_id ELSE user_a_id END
    INTO v_receiver_id
  FROM public.conversations
  WHERE id = p_conversation_id
    AND (user_a_id = p_sender_id OR user_b_id = p_sender_id);

  IF v_receiver_id IS NULL THEN
    RAISE EXCEPTION 'Sender % is not a participant of conversation %', p_sender_id, p_conversation_id;
  END IF;
  IF public.is_blocked_with(v_receiver_id) THEN
    RAISE EXCEPTION 'blocked' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, receiver_id, content)
  VALUES (p_conversation_id, p_sender_id, v_receiver_id, p_content)
  RETURNING * INTO v_message;

  UPDATE public.conversations
  SET
    last_message_content   = p_content,
    last_message_at        = NOW(),
    last_message_sender_id = p_sender_id,
    unread_count_a = CASE WHEN user_b_id = p_sender_id THEN unread_count_a + 1 ELSE unread_count_a END,
    unread_count_b = CASE WHEN user_a_id = p_sender_id THEN unread_count_b + 1 ELSE unread_count_b END,
    updated_at = NOW()
  WHERE id = p_conversation_id;

  RETURN v_message;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id UUID, p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (auth.uid())::text IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

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
$$;

-- ============ AI usage cap ============
-- No policies: only bump_ai_usage() (security definer) touches it.
CREATE TABLE IF NOT EXISTS public.ai_usage (
  user_id TEXT NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Increments and returns the caller's reflection count for today (UTC).
CREATE OR REPLACE FUNCTION public.bump_ai_usage()
RETURNS INTEGER
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  INSERT INTO public.ai_usage (user_id, day, count)
  VALUES ((auth.uid())::text, CURRENT_DATE, 1)
  ON CONFLICT (user_id, day) DO UPDATE SET count = public.ai_usage.count + 1
  RETURNING count;
$$;

-- ============ Account deletion ============
-- user_id columns have no FK to auth.users, so delete app rows explicitly.
-- Reports filed AGAINST this user are kept for moderation.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me TEXT := (auth.uid())::text;
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'not signed in' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.entries       WHERE user_id = v_me;
  DELETE FROM public.reflections   WHERE user_id = v_me;
  DELETE FROM public.friends       WHERE v_me IN (user_id, friend_id);
  DELETE FROM public.blocks        WHERE v_me IN (blocker_id, blocked_id);
  DELETE FROM public.reports       WHERE reporter_id = v_me;
  DELETE FROM public.messages      WHERE v_me IN (sender_id, receiver_id);
  DELETE FROM public.conversations WHERE v_me IN (user_a_id, user_b_id);
  DELETE FROM public.group_members WHERE user_id = v_me;
  DELETE FROM public.groups        WHERE created_by = v_me;
  DELETE FROM public.ai_usage      WHERE user_id = v_me;
  DELETE FROM public.profiles      WHERE user_id = v_me;
  DELETE FROM auth.users           WHERE id = auth.uid();
END;
$$;

-- ============ Grants: signed-in users only ============
REVOKE EXECUTE ON FUNCTION public.get_or_create_conversation(TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.send_dm(UUID, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.mark_conversation_read(UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_blocked_with(TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bump_ai_usage() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_dm(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_blocked_with(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bump_ai_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
