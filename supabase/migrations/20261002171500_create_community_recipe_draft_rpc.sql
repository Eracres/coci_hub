-- =========================================================
-- CociHub
-- Create community recipe draft RPC
-- =========================================================
--
-- Authenticated users must not receive unrestricted INSERT
-- access to the recipes table.
--
-- Instead, this RPC exposes one controlled operation:
--
--   "Create a draft recipe owned by the current user."
--
-- The caller only provides:
--
--   - title
--   - slug
--
-- PostgreSQL controls:
--
--   - author_id
--   - status
--   - featured
--
-- Publication and moderation metadata are intentionally not
-- exposed as parameters.
-- =========================================================


create or replace function public.create_recipe_draft(
  p_title text,
  p_slug text
)
returns table (
  id uuid,
  title varchar,
  slug varchar,
  status public.recipe_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  -- -------------------------------------------------------
  -- IDENTIFY CURRENT USER
  -- -------------------------------------------------------

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated';
  end if;


  -- -------------------------------------------------------
  -- VALIDATE REQUIRED DATA
  -- -------------------------------------------------------

  if nullif(
    btrim(p_title),
    ''
  ) is null then
    raise exception
      'Recipe title is required';
  end if;


  if nullif(
    btrim(p_slug),
    ''
  ) is null then
    raise exception
      'Recipe slug is required';
  end if;


  -- -------------------------------------------------------
  -- CREATE CONTROLLED DRAFT
  -- -------------------------------------------------------

  return query

  insert into public.recipes as recipe (
    author_id,
    title,
    slug,
    status,
    featured
  )
  values (
    v_user_id,
    btrim(p_title),
    btrim(p_slug),
    'draft'::public.recipe_status,
    false
  )
  returning
    recipe.id,
    recipe.title,
    recipe.slug,
    recipe.status;
end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.create_recipe_draft(
  text,
  text
)
from public;


revoke all
on function public.create_recipe_draft(
  text,
  text
)
from anon;


grant execute
on function public.create_recipe_draft(
  text,
  text
)
to authenticated;
