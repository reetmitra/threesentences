CREATE INDEX IF NOT EXISTS habit_logs_user_date ON public.habit_logs (user_id, date);

CREATE OR REPLACE FUNCTION public.get_patterns(p_from DATE, p_to DATE)
RETURNS TABLE (date DATE, has_entry BOOLEAN, mood SMALLINT, habit_answers JSONB)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  SELECT d::date,
         EXISTS (SELECT 1 FROM public.entries e
                 WHERE e.user_id = (auth.uid())::text AND e.date = d::date),
         (SELECT c.mood FROM public.checkins c
          WHERE c.user_id = (auth.uid())::text AND c.date = d::date),
         COALESCE((SELECT jsonb_object_agg(l.habit_id::text, l.done) FROM public.habit_logs l
                   WHERE l.user_id = (auth.uid())::text AND l.date = d::date), '{}'::jsonb)
  FROM generate_series(p_from, p_to, interval '1 day') AS d
  WHERE p_from <= p_to AND p_to - p_from <= 370
  ORDER BY 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_patterns(DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_patterns(DATE, DATE) TO authenticated;
