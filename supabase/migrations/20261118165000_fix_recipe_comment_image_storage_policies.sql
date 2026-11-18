-- =========================================================
-- CociHub
-- Fix recipe comment image Storage policies
-- =========================================================
--
-- Problem:
--
-- Storage policies were querying public.recipe_comments and
-- public.recipes directly.
--
-- Those tables are intentionally not directly readable by
-- authenticated / anonymous roles because access is exposed
-- through controlled RPC functions.
--
-- As a consequence, Storage failed while evaluating the
-- policy with:
--
--   permission denied for table recipe_comments
--
-- Solution:
--
-- Move the required checks into SECURITY DEFINER helper
-- functions and keep the underlying tables private.
--
-- =========================================================


-- =========================================================
-- CAN UPLOAD COMMENT IMAGE
-- =========================================================

create or replace function
public.can_upload_recipe_comment_image(
  p_object_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null

    and split_part(
      p_object_name,
      '/',
      1
    ) =
      auth.uid()::text

    and exists (
      select 1

      from public.recipe_comments
        as recipe_comment

      join public.recipes
        as recipe
        on recipe.id =
          recipe_comment.recipe_id

      where recipe_comment.id::text =
        split_part(
          p_object_name,
          '/',
          2
        )

        and recipe_comment.user_id =
          auth.uid()

        and recipe_comment.is_hidden =
          false

        and recipe.status =
          'published'
            ::public.recipe_status
    );
$$;


-- =========================================================
-- CAN READ VISIBLE COMMENT IMAGE
-- =========================================================

create or replace function
public.can_read_visible_recipe_comment_image(
  p_object_name text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1

    from public.recipe_comments
      as recipe_comment

    join public.recipes
      as recipe
      on recipe.id =
        recipe_comment.recipe_id

    where p_object_name =
      any(
        recipe_comment.image_paths
      )

      and recipe_comment.is_hidden =
        false

      and recipe.status =
        'published'
          ::public.recipe_status
  );
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.can_upload_recipe_comment_image(text)
from public;


revoke all
on function
public.can_upload_recipe_comment_image(text)
from anon;


grant execute
on function
public.can_upload_recipe_comment_image(text)
to authenticated;



revoke all
on function
public.can_read_visible_recipe_comment_image(text)
from public;


grant execute
on function
public.can_read_visible_recipe_comment_image(text)
to anon;


grant execute
on function
public.can_read_visible_recipe_comment_image(text)
to authenticated;


-- =========================================================
-- UPLOAD POLICY
-- =========================================================

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

  and public.can_upload_recipe_comment_image(
    name
  )
);


-- =========================================================
-- PUBLIC READ POLICY
-- =========================================================

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

  and public.can_read_visible_recipe_comment_image(
    name
  )
);


-- =========================================================
-- COMMENTS
-- =========================================================

comment on function
public.can_upload_recipe_comment_image(text)
is
  'Checks whether the authenticated user may upload an image into a recipe comment Storage path without exposing recipe_comments directly.';


comment on function
public.can_read_visible_recipe_comment_image(text)
is
  'Checks whether a recipe comment image belongs to a visible comment on a published recipe without exposing recipe_comments directly.';
