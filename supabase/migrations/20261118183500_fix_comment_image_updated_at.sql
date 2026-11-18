-- =========================================================
-- CociHub
-- Fix recipe comment image updated_at behavior
-- =========================================================
--
-- Associating images with a newly created comment is part
-- of the initial publication flow and must not make the
-- comment appear as edited.
--
-- Text edits continue updating updated_at through the
-- existing update_recipe_comment function.
--
-- =========================================================


create or replace function
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


  -- =======================================================
  -- AUTHENTICATION
  -- =======================================================

  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- NORMALIZE INPUT
  -- =======================================================

  v_image_paths :=
    coalesce(
      p_image_paths,
      '{}'::text[]
    );


  -- =======================================================
  -- MAXIMUM IMAGE COUNT
  -- =======================================================

  if cardinality(
    v_image_paths
  ) > 3 then
    raise exception
      'Too many comment images'
      using errcode = '22023';
  end if;


  -- =======================================================
  -- EMPTY / NULL PATHS
  -- =======================================================

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


  -- =======================================================
  -- DUPLICATE PATHS
  -- =======================================================

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


  -- =======================================================
  -- PATH OWNERSHIP
  -- =======================================================

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


  -- =======================================================
  -- UPDATE IMAGE PATHS
  -- =======================================================
  --
  -- Do not modify updated_at here.
  --
  -- Images attached during initial publication are part of
  -- the original comment and must not trigger the "Edited"
  -- label.
  --
  -- Normal comment editing already updates updated_at
  -- through update_recipe_comment.
  -- =======================================================

  update public.recipe_comments

  set image_paths =
    v_image_paths

  where id =
    p_comment_id

    and user_id =
      v_user_id

    and is_hidden =
      false;


  if not found then
    raise exception
      'Comment not found'
      using errcode = 'P0002';
  end if;

end;
$$;


-- =========================================================
-- COMMENT
-- =========================================================

comment on function
public.set_recipe_comment_images(
  uuid,
  text[]
)
is
  'Replaces image paths owned by the authenticated user without changing the comment updated_at timestamp.';
