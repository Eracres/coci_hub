-- =========================================================
-- CociHub
-- Allow authenticated users to read their own recipes
-- =========================================================
--
-- Existing behavior:
--
--   - anonymous users can read published recipes
--   - authenticated users can read published recipes
--   - administrators can read every recipe
--
-- Community behavior introduced here:
--
--   - an authenticated user can also read every recipe
--     authored by that same user, regardless of its status
--
-- This migration intentionally grants READ access only.
--
-- Community INSERT, UPDATE and DELETE permissions will be
-- introduced separately through controlled workflows.
-- =========================================================


drop policy if exists
  "Users can read own recipes"
on public.recipes;


create policy
  "Users can read own recipes"
on public.recipes
for select
to authenticated
using (
  author_id = (
    select auth.uid()
  )
);
