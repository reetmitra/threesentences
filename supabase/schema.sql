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

-- Messages table for direct messaging
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);

-- Entries table for journal entries
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  sentences TEXT[] NOT NULL DEFAULT '{}',
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(date DESC);

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

-- Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
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

-- Messages: Users can only see messages they sent or received
CREATE POLICY "Users can view their messages" 
  ON public.messages FOR SELECT 
  USING (auth.jwt() ->> 'sub' = sender_id OR auth.jwt() ->> 'sub' = receiver_id);

CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.jwt() ->> 'sub' = sender_id);

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

-- Updated_at trigger function
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

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages (for live chat)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
