-- =========================================================
-- CociHub
-- Normalize community basic-info authorization errors
-- =========================================================
--
-- update_my_recipe_basic_info already protects recipe
-- editing through public.can_edit_recipe().
--
-- The authorization itself was working correctly, but the
-- RPC raised a generic PostgreSQL exception:
--
--   P0001 = raise_exception
--
-- Other protected CociHub RPCs use:
--
--   42501 = insufficient_privilege
--
-- This migration keeps the existing authorization model
-- unchanged and only standardizes the SQLSTATE returned
-- when editing is not permitted.
-- =========================================================


create or replace function
public.update_my_recipe_basic_info(
  p_recipe_id uuid,
  p_title text,
  p_slug text,
  p_short_description text,
  p_introduction text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_title text;
  v_slug text;
  v_short_description text;
  v_introduction text;
begin

  -- =======================================================
  -- AUTHORIZATION
  -- =======================================================

  if not public.can_edit_recipe(
    p_recipe_id
  ) then

    raise exception
      'Not authorized'
      using errcode = '42501';

  end if;


  -- =======================================================
  -- NORMALIZATION
  -- =======================================================

  v_title :=
    btrim(
      p_title
    );


  v_slug :=
    btrim(
      p_slug
    );


  v_short_description :=
    nullif(
      btrim(
        p_short_description
      ),
      ''
    );


  v_introduction :=
    nullif(
      btrim(
        p_introduction
      ),
      ''
    );


  -- =======================================================
  -- VALIDATION
  -- =======================================================

  if
    v_title is null
    or char_length(
      v_title
    ) < 3
    or char_length(
      v_title
    ) > 120
  then

    raise exception
      'Recipe title must contain between 3 and 120 characters';

  end if;


  if
    v_slug is null
    or char_length(
      v_slug
    ) < 3
    or char_length(
      v_slug
    ) > 140
  then

    raise exception
      'Recipe slug must contain between 3 and 140 characters';

  end if;


  if v_slug !~
    '^[a-z0-9]+(-[a-z0-9]+)*$'
  then

    raise exception
      'Recipe slug has an invalid format';

  end if;


  if
    v_short_description is not null
    and char_length(
      v_short_description
    ) > 180
  then

    raise exception
      'Recipe short description cannot exceed 180 characters';

  end if;


  if
    v_introduction is not null
    and char_length(
      v_introduction
    ) > 1500
  then

    raise exception
      'Recipe introduction cannot exceed 1500 characters';

  end if;


  -- =======================================================
  -- UPDATE
  -- =======================================================

  update public.recipes
  set
    title =
      v_title,

    slug =
      v_slug,

    short_description =
      v_short_description,

    introduction =
      v_introduction

  where id =
    p_recipe_id;

end;
$$;



-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.update_my_recipe_basic_info(
  uuid,
  text,
  text,
  text,
  text
)
from public;


revoke all
on function
public.update_my_recipe_basic_info(
  uuid,
  text,
  text,
  text,
  text
)
from anon;


grant execute
on function
public.update_my_recipe_basic_info(
  uuid,
  text,
  text,
  text,
  text
)
to authenticated;
