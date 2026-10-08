-- =========================================================
-- CociHub
-- Enable custom profile avatars
-- =========================================================


-- =========================================================
-- 1. AVATAR BUCKET
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id)
do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;



-- =========================================================
-- 2. READ OWN AVATAR OBJECTS
-- =========================================================

drop policy if exists
  "Users can read own profile avatars"
on storage.objects;


create policy
  "Users can read own profile avatars"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-avatars'
  and name ~ (
    '^' ||
    (select auth.uid())::text ||
    '/avatar-[0-9]{13}\.(jpg|png|webp)$'
  )
);



-- =========================================================
-- 3. INSERT OWN AVATAR
-- =========================================================

drop policy if exists
  "Users can insert own profile avatars"
on storage.objects;


create policy
  "Users can insert own profile avatars"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and name ~ (
    '^' ||
    (select auth.uid())::text ||
    '/avatar-[0-9]{13}\.(jpg|png|webp)$'
  )
);



-- =========================================================
-- 4. UPDATE OWN AVATAR
-- =========================================================

drop policy if exists
  "Users can update own profile avatars"
on storage.objects;


create policy
  "Users can update own profile avatars"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-avatars'
  and name ~ (
    '^' ||
    (select auth.uid())::text ||
    '/avatar-[0-9]{13}\.(jpg|png|webp)$'
  )
)
with check (
  bucket_id = 'profile-avatars'
  and name ~ (
    '^' ||
    (select auth.uid())::text ||
    '/avatar-[0-9]{13}\.(jpg|png|webp)$'
  )
);



-- =========================================================
-- 5. DELETE OWN AVATAR
-- =========================================================

drop policy if exists
  "Users can delete own profile avatars"
on storage.objects;


create policy
  "Users can delete own profile avatars"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-avatars'
  and name ~ (
    '^' ||
    (select auth.uid())::text ||
    '/avatar-[0-9]{13}\.(jpg|png|webp)$'
  )
);



-- =========================================================
-- 6. SET MY AVATAR
-- =========================================================

create or replace function
public.set_my_avatar(
  p_avatar_path text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_avatar_path text;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Authentication required'
      using errcode = '42501';
  end if;


  v_avatar_path :=
    nullif(
      btrim(
        coalesce(
          p_avatar_path,
          ''
        )
      ),
      ''
    );


  if
    v_avatar_path is not null
    and v_avatar_path !~ (
      '^' ||
      v_user_id::text ||
      '/avatar-[0-9]{13}\.(jpg|png|webp)$'
    )
  then
    raise exception
      'Invalid avatar path'
      using errcode = '22023';
  end if;


  update public.profiles
  set
    avatar_url =
      v_avatar_path,

    updated_at =
      now()

  where id =
    v_user_id;


  if not found then
    raise exception
      'Profile not found'
      using errcode = 'P0002';
  end if;

end;
$$;


revoke all
on function
public.set_my_avatar(
  text
)
from public;


revoke all
on function
public.set_my_avatar(
  text
)
from anon;


grant execute
on function
public.set_my_avatar(
  text
)
to authenticated;
