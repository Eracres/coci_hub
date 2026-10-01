-- =========================================================
-- CociHub
-- Add pending review recipe status
-- =========================================================
--
-- Community recipes introduce a moderation workflow:
--
-- draft
--   ↓
-- pending_review
--   ↓
-- published
--
-- Only the new enum value is introduced in this migration.
-- Permissions and workflow rules will be added separately.
-- =========================================================


alter type public.recipe_status
add value if not exists
  'pending_review'
after
  'draft';
