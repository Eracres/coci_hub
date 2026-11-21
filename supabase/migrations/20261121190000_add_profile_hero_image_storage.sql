-- =========================================================
-- COCIHUB
-- PRIVATE PROFILE DASHBOARD HERO STORAGE
-- =========================================================
--
-- Stores user-uploaded images used as the decorative hero
-- inside the authenticated user's "Mi CociHub" dashboard.
--
-- Images are:
--
--   - private
--   - owned by the authenticated user
--   - stored inside the user's own directory
--   - converted to WebP by the application
--   - limited to 1 MB in Storage
--
-- Expected object path:
--
--   <user-uuid>/hero-<13-digit-timestamp>.webp
--
-- Example:
--
--   550e8400-e29b-41d4-a716-446655440000/
--   hero-1795270196440.webp
--
-- =========================================================


-- =========================================================
-- 1. PRIVATE STORAGE BUCKET
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-hero-images',
  'profile-hero-images',
  false,
  1048576,
  array[
    'image/webp'
  ]
)
on conflict (id)
do update
set
  public =
    excluded.public,

  file_size_limit =
    excluded.file_size_limit,

  allowed_mime_types =
    excluded.allowed_mime_types;


-- =========================================================
-- 2. READ OWN HERO IMAGES
-- =========================================================

drop policy if exists
  "Users can read own profile hero images"
on storage.objects;


create policy
  "Users can read own profile hero images"
on storage.objects
for select
to authenticated
using (
  bucket_id =
    'profile-hero-images'

  and name ~ (
    '^' ||
    (
      select auth.uid()
    )::text ||
    '/hero-[0-9]{13}\.webp$'
  )
);


-- =========================================================
-- 3. INSERT OWN HERO IMAGES
-- =========================================================

drop policy if exists
  "Users can insert own profile hero images"
on storage.objects;


create policy
  "Users can insert own profile hero images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id =
    'profile-hero-images'

  and name ~ (
    '^' ||
    (
      select auth.uid()
    )::text ||
    '/hero-[0-9]{13}\.webp$'
  )
);


-- =========================================================
-- 4. UPDATE OWN HERO IMAGES
-- =========================================================

drop policy if exists
  "Users can update own profile hero images"
on storage.objects;


create policy
  "Users can update own profile hero images"
on storage.objects
for update
to authenticated
using (
  bucket_id =
    'profile-hero-images'

  and name ~ (
    '^' ||
    (
      select auth.uid()
    )::text ||
    '/hero-[0-9]{13}\.webp$'
  )
)
with check (
  bucket_id =
    'profile-hero-images'

  and name ~ (
    '^' ||
    (
      select auth.uid()
    )::text ||
    '/hero-[0-9]{13}\.webp$'
  )
);


-- =========================================================
-- 5. DELETE OWN HERO IMAGES
-- =========================================================

drop policy if exists
  "Users can delete own profile hero images"
on storage.objects;


create policy
  "Users can delete own profile hero images"
on storage.objects
for delete
to authenticated
using (
  bucket_id =
    'profile-hero-images'

  and name ~ (
    '^' ||
    (
      select auth.uid()
    )::text ||
    '/hero-[0-9]{13}\.webp$'
  )
);


-- =========================================================
-- 6. STRICT CUSTOM HERO PATH VALIDATION
-- =========================================================
--
-- The existing set_my_dashboard_hero() RPC already requires
-- custom hero paths to begin with the authenticated user's
-- UUID.
--
-- This additional database constraint also guarantees that
-- every stored custom path follows the exact object naming
-- convention used by the private bucket.
-- =========================================================

alter table public.profiles
drop constraint if exists
  profiles_dashboard_custom_hero_path_check;


alter table public.profiles
add constraint
  profiles_dashboard_custom_hero_path_check
check (
  dashboard_hero_type <>
    'custom'

  or (
    dashboard_hero_value is not null

    and dashboard_hero_value ~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/hero-[0-9]{13}\.webp$'
  )
);


-- =========================================================
-- DOCUMENTATION
-- =========================================================

comment on constraint
  profiles_dashboard_custom_hero_path_check
on public.profiles
is
  'Custom Mi CociHub hero images must use the private <user-uuid>/hero-<timestamp>.webp Storage path format.';
