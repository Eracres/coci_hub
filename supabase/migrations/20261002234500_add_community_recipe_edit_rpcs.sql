-- =========================================================
-- CociHub
-- Add controlled community recipe edit RPCs
-- =========================================================
--
-- Community users must not receive unrestricted UPDATE
-- access to public.recipes.
--
-- Instead, these RPC functions expose specific editing
-- operations for recipes that the current user is allowed
-- to edit.
--
-- Authorization is centralized through:
--
--   public.can_edit_recipe(recipe_id)
--
-- Therefore:
--
--   - administrators can edit existing recipes
--   - normal users can edit only their own draft recipes
--   - pending_review recipes are locked for their authors
--   - published recipes are locked for their authors
--   - recipes owned by other users cannot be edited
--
-- Administrative/system fields are intentionally excluded.
--
-- cooking_minutes is also intentionally excluded because
-- it will be derived automatically from the sum of
-- recipe_steps.duration_minutes.
-- =========================================================



-- =========================================================
-- UPDATE BASIC INFO
-- =========================================================

create or replace function public.update_my_recipe_basic_info(
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
  -- -------------------------------------------------------
  -- AUTHORIZATION
  -- -------------------------------------------------------

  if not public.can_edit_recipe(
    p_recipe_id
  ) then
    raise exception
      'Not authorized';
  end if;


  -- -------------------------------------------------------
  -- NORMALIZATION
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- VALIDATION
  -- -------------------------------------------------------

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


  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

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
-- UPDATE SERVINGS
-- =========================================================

create or replace function public.update_my_recipe_servings(
  p_recipe_id uuid,
  p_base_servings integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- -------------------------------------------------------
  -- AUTHORIZATION
  -- -------------------------------------------------------

  if not public.can_edit_recipe(
    p_recipe_id
  ) then
    raise exception
      'Not authorized';
  end if;


  -- -------------------------------------------------------
  -- VALIDATION
  -- -------------------------------------------------------

  if
    p_base_servings is not null
    and (
      p_base_servings < 1
      or p_base_servings > 100
    )
  then
    raise exception
      'Recipe servings must be between 1 and 100';
  end if;


  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

  update public.recipes
  set base_servings =
    p_base_servings
  where id =
    p_recipe_id;
end;
$$;



-- =========================================================
-- UPDATE MANUAL TIMES
-- =========================================================
--
-- preparation_minutes:
--   manually provided by the recipe author
--
-- cooking_minutes:
--   NOT accepted here
--   calculated automatically from recipe step durations
--
-- additional_minutes:
--   manually provided by the recipe author
-- =========================================================

create or replace function public.update_my_recipe_times(
  p_recipe_id uuid,
  p_preparation_minutes integer,
  p_additional_minutes integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- -------------------------------------------------------
  -- AUTHORIZATION
  -- -------------------------------------------------------

  if not public.can_edit_recipe(
    p_recipe_id
  ) then
    raise exception
      'Not authorized';
  end if;


  -- -------------------------------------------------------
  -- VALIDATION
  -- -------------------------------------------------------

  if
    p_preparation_minutes is not null
    and p_preparation_minutes < 0
  then
    raise exception
      'Preparation time cannot be negative';
  end if;


  if
    p_additional_minutes is not null
    and p_additional_minutes < 0
  then
    raise exception
      'Additional time cannot be negative';
  end if;


  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

  update public.recipes
  set
    preparation_minutes =
      p_preparation_minutes,

    additional_minutes =
      p_additional_minutes
  where id =
    p_recipe_id;
end;
$$;



-- =========================================================
-- UPDATE ADDITIONAL INFO
-- =========================================================

create or replace function public.update_my_recipe_additional_info(
  p_recipe_id uuid,
  p_tips text,
  p_substitutions text,
  p_storage text,
  p_freezing text,
  p_reheating text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tips text;
  v_substitutions text;
  v_storage text;
  v_freezing text;
  v_reheating text;
begin
  -- -------------------------------------------------------
  -- AUTHORIZATION
  -- -------------------------------------------------------

  if not public.can_edit_recipe(
    p_recipe_id
  ) then
    raise exception
      'Not authorized';
  end if;


  -- -------------------------------------------------------
  -- NORMALIZATION
  -- -------------------------------------------------------

  v_tips :=
    nullif(
      btrim(
        p_tips
      ),
      ''
    );


  v_substitutions :=
    nullif(
      btrim(
        p_substitutions
      ),
      ''
    );


  v_storage :=
    nullif(
      btrim(
        p_storage
      ),
      ''
    );


  v_freezing :=
    nullif(
      btrim(
        p_freezing
      ),
      ''
    );


  v_reheating :=
    nullif(
      btrim(
        p_reheating
      ),
      ''
    );


  -- -------------------------------------------------------
  -- VALIDATION
  -- -------------------------------------------------------

  if
    v_tips is not null
    and char_length(
      v_tips
    ) > 2500
  then
    raise exception
      'Recipe tips cannot exceed 2500 characters';
  end if;


  if
    v_substitutions is not null
    and char_length(
      v_substitutions
    ) > 2500
  then
    raise exception
      'Recipe substitutions cannot exceed 2500 characters';
  end if;


  if
    v_storage is not null
    and char_length(
      v_storage
    ) > 2500
  then
    raise exception
      'Recipe storage information cannot exceed 2500 characters';
  end if;


  if
    v_freezing is not null
    and char_length(
      v_freezing
    ) > 2500
  then
    raise exception
      'Recipe freezing information cannot exceed 2500 characters';
  end if;


  if
    v_reheating is not null
    and char_length(
      v_reheating
    ) > 2500
  then
    raise exception
      'Recipe reheating information cannot exceed 2500 characters';
  end if;


  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

  update public.recipes
  set
    tips =
      v_tips,

    substitutions =
      v_substitutions,

    storage =
      v_storage,

    freezing =
      v_freezing,

    reheating =
      v_reheating
  where id =
    p_recipe_id;
end;
$$;



-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.update_my_recipe_basic_info(
  uuid,
  text,
  text,
  text,
  text
)
from public;


revoke all
on function public.update_my_recipe_basic_info(
  uuid,
  text,
  text,
  text,
  text
)
from anon;


grant execute
on function public.update_my_recipe_basic_info(
  uuid,
  text,
  text,
  text,
  text
)
to authenticated;



revoke all
on function public.update_my_recipe_servings(
  uuid,
  integer
)
from public;


revoke all
on function public.update_my_recipe_servings(
  uuid,
  integer
)
from anon;


grant execute
on function public.update_my_recipe_servings(
  uuid,
  integer
)
to authenticated;



revoke all
on function public.update_my_recipe_times(
  uuid,
  integer,
  integer
)
from public;


revoke all
on function public.update_my_recipe_times(
  uuid,
  integer,
  integer
)
from anon;


grant execute
on function public.update_my_recipe_times(
  uuid,
  integer,
  integer
)
to authenticated;



revoke all
on function public.update_my_recipe_additional_info(
  uuid,
  text,
  text,
  text,
  text,
  text
)
from public;


revoke all
on function public.update_my_recipe_additional_info(
  uuid,
  text,
  text,
  text,
  text,
  text
)
from anon;


grant execute
on function public.update_my_recipe_additional_info(
  uuid,
  text,
  text,
  text,
  text,
  text
)
to authenticated;