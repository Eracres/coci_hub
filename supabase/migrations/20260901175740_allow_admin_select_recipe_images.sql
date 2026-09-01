-- =========================================================
-- CociHub
-- Allow admins to read recipe image metadata
-- =========================================================

create policy "Admins can read recipe images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'recipe-images'
  and (select public.is_admin())
);