-- =========================================================
-- CociHub
-- Fix recipe image Storage policies
-- =========================================================

-- ---------------------------------------------------------
-- SELECT
-- Needed by some Storage operations, including upsert flows.
-- ---------------------------------------------------------

drop policy if exists
  "recipe_images_admin_select_v2"
on storage.objects;


create policy
  "recipe_images_admin_select_v2"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_admin()
);


-- ---------------------------------------------------------
-- INSERT
-- ---------------------------------------------------------

drop policy if exists
  "recipe_images_admin_insert_v2"
on storage.objects;


create policy
  "recipe_images_admin_insert_v2"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and public.is_admin()
);


-- ---------------------------------------------------------
-- UPDATE
--
-- Required when upload(..., { upsert: true }) overwrites
-- an existing object.
-- ---------------------------------------------------------

drop policy if exists
  "recipe_images_admin_update_v2"
on storage.objects;


create policy
  "recipe_images_admin_update_v2"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_admin()
)
with check (
  bucket_id = 'recipe-images'
  and public.is_admin()
);


-- ---------------------------------------------------------
-- DELETE
-- ---------------------------------------------------------

drop policy if exists
  "recipe_images_admin_delete_v2"
on storage.objects;


create policy
  "recipe_images_admin_delete_v2"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_admin()
);