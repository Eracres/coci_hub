-- =========================================================
-- CociHub
-- Backfill username for existing community user
-- =========================================================
--
-- The first username migration attempted to backfill the
-- existing user using an outdated display_name value.
--
-- The real existing display name is:
--
--   shark2150388
--
-- This migration records the correction in the database
-- history so a fresh database reconstruction produces the
-- same final state as the current remote database.
-- =========================================================


update public.profiles
set username = 'eracres'
where display_name = 'shark2150388'
  and role = 'user'
  and username is null;
