-- =========================================================
-- CociHub
-- Add community recipe review metadata
-- =========================================================
--
-- These fields support the moderation workflow for recipes
-- submitted by community users.
--
-- draft
--   ↓
-- pending_review
--   ↓
-- published
--
-- A recipe can also be returned to draft with review notes.
-- =========================================================


alter table public.recipes
add column if not exists submitted_at timestamptz;


alter table public.recipes
add column if not exists reviewed_at timestamptz;


alter table public.recipes
add column if not exists reviewed_by uuid
references public.profiles(id)
on delete set null;


alter table public.recipes
add column if not exists review_notes text;
