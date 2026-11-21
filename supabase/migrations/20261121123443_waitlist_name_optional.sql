-- APPLIED to the live project on 2026-11-21 (version 20261121123443) with the owner's OK.
-- The landing form collects only an email, but public.waitlist.name was NOT NULL, so every sign-up failed
-- ("Something went wrong"). The last successful row was from 26 May. The length check stays and passes for NULL.
--
-- Verified after applying: an email-only insert with the anon key -> 201; the same email again -> 409 (23505,
-- which the form turns into "already on the waitlist"). The test row was removed; the waitlist has its 10 real rows.

alter table public.waitlist alter column name drop not null;
