-- Phase 1: nightly check-in (habits + mood) and private user settings.

CREATE TABLE public.user_settings (
  user_id           TEXT PRIMARY KEY DEFAULT (auth.uid())::text,
  day_rollover_hour SMALLINT NOT NULL DEFAULT 4 CHECK (day_rollover_hour BETWEEN 0 AND 6),
  trackers          JSONB NOT NULL DEFAULT '{"habits":true,"mood":true}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE public.habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL DEFAULT (auth.uid())::text,
  name        TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 40),
  position    SMALLINT NOT NULL CHECK (position BETWEEN 0 AND 2),
  link        TEXT CHECK (link IN ('workout', 'sleep')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX habits_active_slot ON public.habits (user_id, position) WHERE archived_at IS NULL;
CREATE TABLE public.habit_logs (
  habit_id   UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  date       DATE NOT NULL,
  done       BOOLEAN NOT NULL,
  source     TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'workout', 'health')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (habit_id, date)
);
CREATE TABLE public.checkins (
  user_id    TEXT NOT NULL DEFAULT (auth.uid())::text,
  date       DATE NOT NULL,
  mood       SMALLINT CHECK (mood BETWEEN 1 AND 5),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins      ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_owner ON public.user_settings FOR ALL
  USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY habits_owner ON public.habits FOR ALL
  USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY checkins_owner ON public.checkins FOR ALL
  USING ((auth.uid())::text = user_id) WITH CHECK ((auth.uid())::text = user_id);
CREATE POLICY habit_logs_owner ON public.habit_logs FOR ALL
  USING ((auth.uid())::text = user_id)
  WITH CHECK ((auth.uid())::text = user_id AND EXISTS (
    SELECT 1 FROM public.habits h WHERE h.id = habit_logs.habit_id AND h.user_id = (auth.uid())::text));

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habit_logs_updated_at BEFORE UPDATE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checkins_updated_at BEFORE UPDATE ON public.checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Account deletion must also remove the new per-user tables.
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
  DELETE FROM public.habit_logs    WHERE user_id = v_me;
  DELETE FROM public.habits        WHERE user_id = v_me;
  DELETE FROM public.checkins      WHERE user_id = v_me;
  DELETE FROM public.user_settings WHERE user_id = v_me;
  DELETE FROM public.profiles      WHERE user_id = v_me;
  DELETE FROM auth.users           WHERE id = auth.uid();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
