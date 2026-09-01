-- =========================================================
-- CociHub
-- Storage policies for recipe images
-- =========================================================


-- =========================================================
-- 1. BUCKET
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'recipe-images',
  'recipe-images',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;



-- =========================================================
-- 2. ADMIN INSERT
-- =========================================================

create policy "Admins can upload recipe images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and (select public.is_admin())
);



-- =========================================================
-- 3. ADMIN UPDATE
-- =========================================================

create policy "Admins can update recipe images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recipe-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'recipe-images'
  and (select public.is_admin())
);



-- =========================================================
-- 4. ADMIN DELETE
-- =========================================================

create policy "Admins can delete recipe images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and (select public.is_admin())
);