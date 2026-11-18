-- =========================================================
-- CociHub
-- Recipe comment images
-- =========================================================
--
-- Rules:
--
--   - up to 3 images per comment
--   - maximum 5 MB per image
--   - JPEG, PNG and WebP only
--   - images are stored in a private Storage bucket
--   - users upload only inside their own comment folder
--   - public access is limited to visible comments attached
--     to published recipes
--   - owners and administrators retain controlled access
--
-- Storage path:
--
--   {user_id}/{comment_id}/{file_name}
--
-- =========================================================


-- =========================================================
-- COMMENT IMAGE PATHS
-- =========================================================

alter table public.recipe_comments
add column image_paths text[]
not null
default '{}'::text[];


alter table public.recipe_comments
add constraint recipe_comments_image_paths_count_check
check (
  cardinality(image_paths)
  between 0 and 3
);


alter table public.recipe_comments
add constraint recipe_comments_image_paths_not_empty_check
check (
  array_position(
    image_paths,
    ''
  ) is null
);


alter table public.recipe_comments
add constraint recipe_comments_image_paths_not_null_check
check (
  array_position(
    image_paths,
    null
  ) is null
);


-- =========================================================
-- PRIVATE STORAGE BUCKET
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'recipe-comment-images',
  'recipe-comment-images',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
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
-- STORAGE POLICIES
-- =========================================================


-- ---------------------------------------------------------
-- AUTHENTICATED USER UPLOAD
-- ---------------------------------------------------------

drop policy if exists
"Users can upload own recipe comment images"
on storage.objects;


create policy
"Users can upload own recipe comment images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id =
    'recipe-comment-images'

  and
  (
    storage.foldername(name)
  )[1] =
    (
      select auth.uid()
    )::text

  and exists (
    select 1
    from public.recipe_comments
      as recipe_comment

    join public.recipes
      as recipe
      on recipe.id =
        recipe_comment.recipe_id

    where recipe_comment.id::text =
      (
        storage.foldername(
          storage.objects.name
        )
      )[2]

      and recipe_comment.user_id =
        (
          select auth.uid()
        )

      and recipe_comment.is_hidden =
        false

      and recipe.status =
        'published'
          ::public.recipe_status
  )
);


-- ---------------------------------------------------------
-- OWNER READ
-- ---------------------------------------------------------

drop policy if exists
"Users can read own recipe comment images"
on storage.objects;


create policy
"Users can read own recipe comment images"
on storage.objects
for select
to authenticated
using (
  bucket_id =
    'recipe-comment-images'

  and owner_id =
    (
      select auth.uid()
    )::text
);


-- ---------------------------------------------------------
-- PUBLIC READ FOR VISIBLE COMMENTS
-- ---------------------------------------------------------

drop policy if exists
"Public can read visible recipe comment images"
on storage.objects;


create policy
"Public can read visible recipe comment images"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id =
    'recipe-comment-images'

  and exists (
    select 1
    from public.recipe_comments
      as recipe_comment

    join public.recipes
      as recipe
      on recipe.id =
        recipe_comment.recipe_id

    where storage.objects.name =
      any(
        recipe_comment.image_paths
      )

      and recipe_comment.is_hidden =
        false

      and recipe.status =
        'published'
          ::public.recipe_status
  )
);


-- ---------------------------------------------------------
-- ADMIN READ
-- ---------------------------------------------------------

drop policy if exists
"Admins can read recipe comment images"
on storage.objects;


create policy
"Admins can read recipe comment images"
on storage.objects
for select
to authenticated
using (
  bucket_id =
    'recipe-comment-images'

  and public.is_admin()
);


-- ---------------------------------------------------------
-- OWNER DELETE
-- ---------------------------------------------------------

drop policy if exists
"Users can delete own recipe comment images"
on storage.objects;


create policy
"Users can delete own recipe comment images"
on storage.objects
for delete
to authenticated
using (
  bucket_id =
    'recipe-comment-images'

  and owner_id =
    (
      select auth.uid()
    )::text
);


-- ---------------------------------------------------------
-- ADMIN DELETE
-- ---------------------------------------------------------

drop policy if exists
"Admins can delete recipe comment images"
on storage.objects;


create policy
"Admins can delete recipe comment images"
on storage.objects
for delete
to authenticated
using (
  bucket_id =
    'recipe-comment-images'

  and public.is_admin()
);


-- =========================================================
-- SET COMMENT IMAGES
-- =========================================================

create function
public.set_recipe_comment_images(
  p_comment_id uuid,
  p_image_paths text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_image_paths text[];
  v_image_path text;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  v_image_paths :=
    coalesce(
      p_image_paths,
      '{}'::text[]
    );


  if cardinality(
    v_image_paths
  ) > 3 then
    raise exception
      'Too many comment images'
      using errcode = '22023';
  end if;


  if exists (
    select 1
    from unnest(
      v_image_paths
    )
      as image_path

    where image_path is null
      or trim(
        image_path
      ) = ''
  ) then
    raise exception
      'Invalid comment image path'
      using errcode = '22023';
  end if;


  if exists (
    select
      image_path

    from unnest(
      v_image_paths
    )
      as image_path

    group by
      image_path

    having count(*) > 1
  ) then
    raise exception
      'Duplicate comment image path'
      using errcode = '22023';
  end if;


  foreach v_image_path
    in array
      v_image_paths
  loop

    if v_image_path
      not like
        (
          v_user_id::text
          || '/'
          || p_comment_id::text
          || '/%'
        )
    then
      raise exception
        'Invalid comment image ownership'
        using errcode = '42501';
    end if;

  end loop;


  update public.recipe_comments
  set
    image_paths =
      v_image_paths,

    updated_at =
      now()

  where id =
    p_comment_id

    and user_id =
      v_user_id

    and is_hidden =
      false;


  if not found then
    raise exception
      'Comment not found or not authorized'
      using errcode = '42501';
  end if;

end;
$$;


-- =========================================================
-- PUBLIC COMMENT RPC
-- =========================================================

drop function if exists
public.get_recipe_comments(uuid);


create function
public.get_recipe_comments(
  p_recipe_id uuid
)
returns table (
  comment_id uuid,
  author_id uuid,
  author_display_name text,
  author_avatar_url text,
  body text,
  image_paths text[],
  created_at timestamptz,
  updated_at timestamptz,
  is_own boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    recipe_comment.id
      as comment_id,

    recipe_comment.user_id
      as author_id,

    (
      coalesce(
        nullif(
          trim(
            profile.display_name
          ),
          ''
        ),
        'Usuario'
      )
    )::text
      as author_display_name,

    profile.avatar_url
      as author_avatar_url,

    recipe_comment.body,

    recipe_comment.image_paths,

    recipe_comment.created_at,

    recipe_comment.updated_at,

    (
      recipe_comment.user_id =
      auth.uid()
    )
      as is_own

  from public.recipe_comments
    as recipe_comment

  join public.profiles
    as profile
    on profile.id =
      recipe_comment.user_id

  join public.recipes
    as recipe
    on recipe.id =
      recipe_comment.recipe_id

  where recipe_comment.recipe_id =
    p_recipe_id

    and recipe.status =
      'published'
        ::public.recipe_status

    and recipe_comment.is_hidden =
      false

  order by
    recipe_comment.created_at desc;
$$;


-- =========================================================
-- ADMIN COMMENT RPC
-- =========================================================

drop function if exists
public.get_admin_recipe_comments();


create function
public.get_admin_recipe_comments()
returns table (
  comment_id uuid,
  recipe_id uuid,
  recipe_title text,
  recipe_slug text,
  author_id uuid,
  author_display_name text,
  author_avatar_url text,
  body text,
  image_paths text[],
  is_hidden boolean,
  hidden_at timestamptz,
  hidden_by uuid,
  hidden_by_display_name text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin

  if auth.uid() is null
    or not public.is_admin()
  then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  return query

  select
    recipe_comment.id
      as comment_id,

    recipe_comment.recipe_id,

    recipe.title::text
      as recipe_title,

    recipe.slug::text
      as recipe_slug,

    recipe_comment.user_id
      as author_id,

    (
      coalesce(
        nullif(
          trim(
            author_profile.display_name
          ),
          ''
        ),
        'Usuario'
      )
    )::text
      as author_display_name,

    author_profile.avatar_url
      as author_avatar_url,

    recipe_comment.body,

    recipe_comment.image_paths,

    recipe_comment.is_hidden,

    recipe_comment.hidden_at,

    recipe_comment.hidden_by,

    (
      case
        when recipe_comment.hidden_by
          is null
        then null

        else
          coalesce(
            nullif(
              trim(
                moderator_profile.display_name
              ),
              ''
            ),
            'Administrador'
          )
      end
    )::text
      as hidden_by_display_name,

    recipe_comment.created_at,

    recipe_comment.updated_at

  from public.recipe_comments
    as recipe_comment

  join public.recipes
    as recipe
    on recipe.id =
      recipe_comment.recipe_id

  join public.profiles
    as author_profile
    on author_profile.id =
      recipe_comment.user_id

  left join public.profiles
    as moderator_profile
    on moderator_profile.id =
      recipe_comment.hidden_by

  order by
    recipe_comment.created_at desc;

end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.set_recipe_comment_images(
  uuid,
  text[]
)
from public;


revoke all
on function
public.set_recipe_comment_images(
  uuid,
  text[]
)
from anon;


grant execute
on function
public.set_recipe_comment_images(
  uuid,
  text[]
)
to authenticated;



revoke all
on function
public.get_recipe_comments(uuid)
from public;


grant execute
on function
public.get_recipe_comments(uuid)
to anon;


grant execute
on function
public.get_recipe_comments(uuid)
to authenticated;



revoke all
on function
public.get_admin_recipe_comments()
from public;


revoke all
on function
public.get_admin_recipe_comments()
from anon;


grant execute
on function
public.get_admin_recipe_comments()
to authenticated;


-- =========================================================
-- COMMENTS
-- =========================================================

comment on column
public.recipe_comments.image_paths
is
  'Private Storage paths for up to three images attached to the comment.';


comment on function
public.set_recipe_comment_images(uuid, text[])
is
  'Replaces the image paths owned by the authenticated user for one recipe comment.';
