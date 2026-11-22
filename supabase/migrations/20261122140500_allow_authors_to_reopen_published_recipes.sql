-- =========================================================
-- CociHub
-- Allow authors to reopen published recipes for editing
-- =========================================================
--
-- Published community recipes must never be edited directly.
--
-- Instead, their author can explicitly reopen the recipe:
--
--   published
--      ↓
--   draft
--
-- The recipe temporarily disappears from the public catalog
-- while it is being edited.
--
-- Once the author finishes the changes, the normal community
-- moderation flow applies again:
--
--   draft
--      ↓
--   pending_review
--      ↓
--   published
--
-- Pending-review recipes remain locked.
--
-- This operation is restricted to the recipe owner.
-- =========================================================


create or replace function
public.reopen_my_published_recipe_for_editing(
  p_recipe_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id
    uuid;

  v_author_id
    uuid;

  v_status
    public.recipe_status;
begin

  -- =======================================================
  -- AUTHENTICATION
  -- =======================================================

  v_user_id :=
    auth.uid();


  if
    v_user_id is null
  then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- LOAD RECIPE
  -- =======================================================

  select
    recipe.author_id,
    recipe.status

  into
    v_author_id,
    v_status

  from public.recipes
    as recipe

  where recipe.id =
    p_recipe_id;


  if not found then
    raise exception
      'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- =======================================================
  -- OWNERSHIP
  -- =======================================================

  if
    v_author_id <>
    v_user_id
  then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- VALID SOURCE STATE
  -- =======================================================

  if
    v_status <>
    'published'
      ::public.recipe_status
  then
    raise exception
      'Only published recipes can be reopened for editing'
      using errcode = '22023';
  end if;


  -- =======================================================
  -- REOPEN AS DRAFT
  -- =======================================================

  update public.recipes
  set
    status =
      'draft'
        ::public.recipe_status,

    published_at =
      null,

    submitted_at =
      null,

    reviewed_at =
      null,

    reviewed_by =
      null,

    review_notes =
      null

  where id =
    p_recipe_id;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function
public.reopen_my_published_recipe_for_editing(
  uuid
)
from public;


revoke all
on function
public.reopen_my_published_recipe_for_editing(
  uuid
)
from anon;


grant execute
on function
public.reopen_my_published_recipe_for_editing(
  uuid
)
to authenticated;
