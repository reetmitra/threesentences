-- APPLIED to the live project on 2026-11-21 (version 20261121123217) with the owner's OK.
-- Project: three (imgwxjauygnzrekgprkm). Written 2026-11-21 from the live advisor + grants audit.
--
-- What the audit found
--   1. add_group_creator_as_admin() and update_updated_at_column() have a mutable search_path (advisor WARN).
--   2. `anon` (the public key every install and the landing page carries) holds ALL privileges on every
--      public table, including TRUNCATE/REFERENCES/TRIGGER, which row-level security does not police. RLS is
--      on for all 16 tables and the policies are sound, so nothing is exposed today; this is least privilege.
--      The only thing `anon` legitimately does is INSERT into public.waitlist (landing page).
--      New tables inherit these grants from the default ACL (owner postgres), so step 2 also resets that default.
--      Defaults set for the supabase_admin owner are left alone (the dashboard creates tables as postgres).
--   3. `authenticated` also holds TRUNCATE/REFERENCES/TRIGGER, which the app never needs.
--
-- Not changed here (intentional): the six SECURITY DEFINER RPCs callable by signed-in users (send_dm,
-- get_or_create_conversation, mark_conversation_read, is_blocked_with, bump_ai_usage, delete_my_account). They
-- check auth.uid() inside; anon EXECUTE was already revoked in 20261117000000_launch_safety.sql.
-- Not changed: ai_usage has RLS on and no policy on purpose (written only by bump_ai_usage()).

-- 1) pin search_path
alter function public.add_group_creator_as_admin() set search_path = public;
alter function public.update_updated_at_column() set search_path = public;

-- 2) anon: nothing except the waitlist insert
revoke all on all tables in schema public from anon;
grant insert on public.waitlist to anon;
alter default privileges in schema public revoke all on tables from anon;

-- 3) authenticated: keep CRUD, drop the table-level powers the app never uses
revoke truncate, references, trigger on all tables in schema public from authenticated;
alter default privileges in schema public revoke truncate, references, trigger on tables from authenticated;

-- Result: 15/15 privilege checks passed; anon GET on profiles/entries/waitlist/messages -> 401 permission denied;
-- anon INSERT into waitlist -> 201 (with a name); advisors dropped the 16 anon-GraphQL and 2 search_path warnings.
--
-- ── Test after applying (all must pass) ─────────────────────────────────────────────────────────────
--   a) Landing page: Request access with a throwaway email still says "You're on the list" (then delete that row).
--   b) With the anon key: GET /rest/v1/profiles?select=id  -> permission denied (was: [] under RLS).
--   c) On a device or simulator: sign in, write a sentence, open Patterns, open The Circle, send a DM.
--   d) Supabase advisors: the two search_path warnings and the 16 "anon can SELECT" warnings are gone.
--
-- ── Rollback ────────────────────────────────────────────────────────────────────────────────────────
--   grant select, insert, update, delete on all tables in schema public to anon;
--   grant truncate, references, trigger on all tables in schema public to authenticated;
