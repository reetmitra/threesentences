-- Three™ Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN (interests);

-- Friends table for connections
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);

-- Groups table for group chats (only connected users)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  image_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);

-- Group members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- Messages table (now supports both direct and group messaging)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT, -- NULL for group messages
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE, -- NULL for direct messages
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Either receiver_id OR group_id must be set, but not both
  CONSTRAINT message_target CHECK (
    (receiver_id IS NOT NULL AND group_id IS NULL) OR 
    (receiver_id IS NULL AND group_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_group ON public.messages(group_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Entries table for journal entries (encrypted content stored)
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  encrypted_content TEXT NOT NULL, -- E2E encrypted
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.entries(user_id, date DESC);

-- Reflections table for AI reflections
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_entry_id ON public.reflections(entry_id);

-- ============================================
-- Row Level Security Policies
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read any profile, but only update their own
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.jwt() ->> 'sub' = user_id);

-- Friends: Users can see their own friend connections
CREATE POLICY "Users can view their friendships" 
  ON public.friends FOR SELECT 
  USING (auth.jwt() ->> 'sub' = user_id OR auth.jwt() ->> 'sub' = friend_id);

CREATE POLICY "Users can create friend requests" 
  ON public.friends FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their friendships" 
  ON public.friends FOR UPDATE 
  USING (auth.jwt() ->> 'sub' = user_id OR auth.jwt() ->> 'sub' = friend_id);

CREATE POLICY "Users can delete their friendships" 
  ON public.friends FOR DELETE 
  USING (auth.jwt() ->> 'sub' = user_id);

-- Groups: Users can view groups they're a member of
CREATE POLICY "Users can view their groups" 
  ON public.groups FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = id AND gm.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can create groups" 
  ON public.groups FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = created_by);

CREATE POLICY "Group admins can update groups" 
  ON public.groups FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = id 
        AND gm.user_id = auth.jwt() ->> 'sub' 
        AND gm.role = 'admin'
    )
  );

CREATE POLICY "Group admins can delete groups" 
  ON public.groups FOR DELETE 
  USING (created_by = auth.jwt() ->> 'sub');

-- Group Members: Users can view members of their groups
CREATE POLICY "Users can view group members" 
  ON public.group_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members self 
      WHERE self.group_id = group_id AND self.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Only add members who are connected (friends)
CREATE POLICY "Admins can add connected members" 
  ON public.group_members FOR INSERT 
  WITH CHECK (
    -- Must be admin of the group
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_id 
        AND gm.user_id = auth.jwt() ->> 'sub' 
        AND gm.role = 'admin'
    )
    -- And the new member must be a friend
    AND EXISTS (
      SELECT 1 FROM public.friends f 
      WHERE f.status = 'accepted'
        AND (
          (f.user_id = auth.jwt() ->> 'sub' AND f.friend_id = user_id) OR
          (f.friend_id = auth.jwt() ->> 'sub' AND f.user_id = user_id)
        )
    )
  );

CREATE POLICY "Admins can remove members" 
  ON public.group_members FOR DELETE 
  USING (
    -- User can leave themselves
    user_id = auth.jwt() ->> 'sub'
    OR
    -- Admins can remove members
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_id 
        AND gm.user_id = auth.jwt() ->> 'sub' 
        AND gm.role = 'admin'
    )
  );

-- Messages: Direct messages visible to sender/receiver, group messages to members
CREATE POLICY "Users can view their messages" 
  ON public.messages FOR SELECT 
  USING (
    -- Direct messages
    (auth.jwt() ->> 'sub' = sender_id OR auth.jwt() ->> 'sub' = receiver_id)
    OR
    -- Group messages
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = group_id AND gm.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.jwt() ->> 'sub' = sender_id
    AND (
      -- Direct message to a friend
      (receiver_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.friends f 
        WHERE f.status = 'accepted'
          AND (
            (f.user_id = sender_id AND f.friend_id = receiver_id) OR
            (f.friend_id = sender_id AND f.user_id = receiver_id)
          )
      ))
      OR
      -- Group message to a group they're a member of
      (group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.group_members gm 
        WHERE gm.group_id = group_id AND gm.user_id = sender_id
      ))
    )
  );

CREATE POLICY "Users can update their received messages (mark as read)" 
  ON public.messages FOR UPDATE 
  USING (auth.jwt() ->> 'sub' = receiver_id);

-- Entries: Users can only access their own entries
CREATE POLICY "Users can view their own entries" 
  ON public.entries FOR SELECT 
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own entries" 
  ON public.entries FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own entries" 
  ON public.entries FOR UPDATE 
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own entries" 
  ON public.entries FOR DELETE 
  USING (auth.jwt() ->> 'sub' = user_id);

-- Reflections: Users can only access their own reflections
CREATE POLICY "Users can view their own reflections" 
  ON public.reflections FOR SELECT 
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own reflections" 
  ON public.reflections FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own reflections" 
  ON public.reflections FOR DELETE 
  USING (auth.jwt() ->> 'sub' = user_id);

-- ============================================
-- Triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON public.friends
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-add creator as admin when group is created
CREATE OR REPLACE FUNCTION add_group_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_group_admin
  AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_admin();

-- Enable realtime for messages, friends, and group_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- ============================================
-- Test Users (for development/testing only)
-- Remove or comment out for production
-- ============================================
-- Note: These are sample profiles. In production, users will be created via Clerk auth.
-- The user_ids here should match Clerk user IDs when testing.

-- INSERT INTO public.profiles (user_id, name, username, age, bio, interests, is_complete)
-- VALUES 
--   ('test_user_1', 'Alex Chen', 'alexchen', 28, 'Serial entrepreneur. 2x founder. Passionate about startups and fitness.', 
--    ARRAY['marathon', 'venture-capital', 'entrepreneurship', 'crossfit', 'meditation'], true),
--   ('test_user_2', 'Sarah Williams', 'sarahw', 32, 'Private equity professional. Tennis lover. Fine wine enthusiast.', 
--    ARRAY['private-equity', 'tennis', 'wine-spirits', 'yoga', 'reading'], true),
--   ('test_user_3', 'Marcus Johnson', 'marcusj', 35, 'Hedge fund manager. Ironman athlete. Crypto believer.', 
--    ARRAY['ironman', 'hedge-funds', 'crypto-web3', 'cold-plunge', 'sailing'], true);

-- -- Create test friendships (uncomment to use)
-- INSERT INTO public.friends (user_id, friend_id, status)
-- VALUES 
--   ('test_user_1', 'test_user_2', 'accepted'),
--   ('test_user_2', 'test_user_1', 'accepted'),
--   ('test_user_1', 'test_user_3', 'accepted'),
--   ('test_user_3', 'test_user_1', 'accepted');
