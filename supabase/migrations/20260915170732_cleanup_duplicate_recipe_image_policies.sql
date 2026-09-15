-- =========================================================
-- CociHub
-- Cleanup duplicate recipe image Storage policies
-- =========================================================
--
-- The original recipe image policies were superseded by
-- the *_v2 policies created during the Storage hardening.
--
-- We keep:
--
--   recipe_images_admin_select_v2
--   recipe_images_admin_insert_v2
--   recipe_images_admin_update_v2
--   recipe_images_admin_delete_v2
--
-- and remove the obsolete duplicate policies.
-- =========================================================


drop policy if exists
  "Admins can read recipe images"
on storage.objects;


drop policy if exists
  "Admins can upload recipe images"
on storage.objects;


drop policy if exists
  "Admins can update recipe images"
on storage.objects;


drop policy if exists
  "Admins can delete recipe images"
on storage.objects;