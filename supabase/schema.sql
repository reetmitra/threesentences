-- Three™ Database Schema
-- Complete schema with DROP + CREATE to ensure clean slate

-- ============================================
-- STEP 1: Drop existing objects
-- ============================================
DROP TABLE IF EXISTS public.reflections CASCADE;
DROP TABLE IF EXISTS public.entries CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.group_members CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.waitlist CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS add_group_creator_as_admin() CASCADE;

-- ============================================
-- STEP 2: Create tables
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  age INTEGER CHECK (age >= 18 AND age <= 99),
  bio TEXT CHECK (char_length(bio) <= 150),
  profile_image TEXT,
  interests TEXT[] DEFAULT '{}',
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  image_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT message_target CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL) OR 
    (receiver_id IS NULL AND group_id IS NOT NULL)
  )
);

CREATE TABLE public.entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  encrypted_content TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  time_range INTEGER NOT NULL CHECK (time_range IN (7, 30, 90)),
  entries_analyzed INTEGER NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  has_crisis_indicators BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 3: Create indexes
-- ============================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_friends_user_id ON public.friends(user_id);
CREATE INDEX idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX idx_groups_created_by ON public.groups(created_by);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_group ON public.messages(group_id);
CREATE INDEX idx_entries_user_id ON public.entries(user_id);
CREATE INDEX idx_entries_date ON public.entries(date DESC);
CREATE INDEX idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- ============================================
-- STEP 4: Enable RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Create policies
-- ============================================

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid()::text = user_id);

-- Friends
CREATE POLICY "friends_select" ON public.friends FOR SELECT USING (auth.uid()::text IN (user_id, friend_id));
CREATE POLICY "friends_insert" ON public.friends FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "friends_update" ON public.friends FOR UPDATE USING (auth.uid()::text IN (user_id, friend_id));
CREATE POLICY "friends_delete" ON public.friends FOR DELETE USING (auth.uid()::text = user_id);

-- Groups
CREATE POLICY "groups_select" ON public.groups FOR SELECT USING (true);
CREATE POLICY "groups_insert" ON public.groups FOR INSERT WITH CHECK (auth.uid()::text = created_by);
CREATE POLICY "groups_update" ON public.groups FOR UPDATE USING (auth.uid()::text = created_by);
CREATE POLICY "groups_delete" ON public.groups FOR DELETE USING (auth.uid()::text = created_by);

-- Group Members
CREATE POLICY "group_members_select" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "group_members_insert" ON public.group_members FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "group_members_delete" ON public.group_members FOR DELETE USING (
    auth.uid()::text = user_id
    OR EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()::text
        AND gm.role = 'admin'
    )
);

-- Messages
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
    auth.uid()::text IN (sender_id, receiver_id)
    OR (
        group_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = messages.group_id
            AND group_members.user_id = auth.uid()::text
        )
    )
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid()::text = sender_id);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (
    auth.uid()::text = receiver_id
    OR (
        group_id IS NOT NULL
        AND auth.uid()::text != sender_id
        AND EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = messages.group_id
            AND group_members.user_id = auth.uid()::text
        )
    )
);

-- Entries
CREATE POLICY "entries_select" ON public.entries FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "entries_insert" ON public.entries FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "entries_update" ON public.entries FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "entries_delete" ON public.entries FOR DELETE USING (auth.uid()::text = user_id);

-- Reflections
CREATE POLICY "reflections_select" ON public.reflections FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "reflections_insert" ON public.reflections FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "reflections_delete" ON public.reflections FOR DELETE USING (auth.uid()::text = user_id);

-- Waitlist (public insert, no read access for privacy)
CREATE POLICY "waitlist_insert" ON public.waitlist FOR INSERT WITH CHECK (true);

-- ============================================
-- STEP 6: Create triggers
-- ============================================
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-add group creator as admin
CREATE FUNCTION add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_group_admin AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_admin();

-- ============================================
-- STEP 7: Enable realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;

-- ============================================
-- STEP 8: DM conversations (applied live 2026-05-28, captured 2026-07-02)
-- ============================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id TEXT NOT NULL,
  user_b_id TEXT NOT NULL,
  last_message_content TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id TEXT,
  unread_count_a INTEGER NOT NULL DEFAULT 0,
  unread_count_b INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id)
);

CREATE INDEX conversations_user_a ON public.conversations (user_a_id);
CREATE INDEX conversations_user_b ON public.conversations (user_b_id);

ALTER TABLE public.messages ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
CREATE INDEX messages_conversation_at ON public.messages (conversation_id, created_at DESC);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select ON public.conversations FOR SELECT
  USING (user_a_id = (auth.uid())::text OR user_b_id = (auth.uid())::text);
CREATE POLICY conversations_insert ON public.conversations FOR INSERT
  WITH CHECK (user_a_id = (auth.uid())::text OR user_b_id = (auth.uid())::text);
CREATE POLICY conversations_update ON public.conversations FOR UPDATE
  USING (user_a_id = (auth.uid())::text OR user_b_id = (auth.uid())::text);

CREATE POLICY messages_select_dm ON public.messages FOR SELECT
  USING (
    conversation_id IS NOT NULL AND conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_a_id = (auth.uid())::text OR user_b_id = (auth.uid())::text
    )
  );
CREATE POLICY messages_insert_dm ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = (auth.uid())::text AND conversation_id IS NOT NULL AND conversation_id IN (
      SELECT id FROM public.conversations
      WHERE user_a_id = (auth.uid())::text OR user_b_id = (auth.uid())::text
    )
  );

-- Get or create the canonical conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_user_id_1 TEXT, p_user_id_2 TEXT)
RETURNS public.conversations
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_a TEXT;
  v_user_b TEXT;
  v_conversation public.conversations;
BEGIN
  -- Canonical ordering: smaller string = user_a
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

-- Atomically insert a DM and update the conversation summary.
-- Sets receiver_id from the conversation so the legacy message_target
-- CHECK (receiver_id XOR group_id) is satisfied.
CREATE OR REPLACE FUNCTION public.send_dm(p_conversation_id UUID, p_sender_id TEXT, p_content TEXT)
RETURNS public.messages
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message public.messages;
  v_receiver_id TEXT;
BEGIN
  SELECT CASE WHEN user_a_id = p_sender_id THEN user_b_id ELSE user_a_id END
    INTO v_receiver_id
  FROM public.conversations
  WHERE id = p_conversation_id
    AND (user_a_id = p_sender_id OR user_b_id = p_sender_id);

  IF v_receiver_id IS NULL THEN
    RAISE EXCEPTION 'Sender % is not a participant of conversation %', p_sender_id, p_conversation_id;
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, receiver_id, content)
  VALUES (p_conversation_id, p_sender_id, v_receiver_id, p_content)
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
$$;

-- Reset the caller's unread counter and mark incoming messages read
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id UUID, p_user_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

SELECT 'Schema created successfully!' as status;
