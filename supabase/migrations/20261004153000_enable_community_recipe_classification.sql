-- =========================================================
-- CociHub
-- Enable controlled community recipe classification
-- =========================================================
--
-- Community recipe authors need to classify their own
-- draft recipes without receiving unrestricted write
-- access to:
--
--   - recipes
--   - recipe_categories
--   - recipe_tags
--
-- This migration introduces:
--
--   1. READ policies for categories/tags belonging to
--      recipes owned by the authenticated user.
--
--   2. A controlled SECURITY DEFINER RPC that allows the
--      owner of a DRAFT recipe to modify:
--
--        - recipe type
--        - difficulty
--        - categories
--        - tags
--
-- IMPORTANT:
--
--   featured is intentionally NOT exposed.
--
-- A community user cannot make their recipe featured
-- through this operation.
--
-- Publication state is also intentionally untouched.
-- =========================================================



-- =========================================================
-- READ OWN RECIPE CATEGORIES
-- =========================================================

drop policy if exists
  "Users can read categories of own recipes"
on public.recipe_categories;


create policy
  "Users can read categories of own recipes"
on public.recipe_categories
for select
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where public.recipes.id =
      public.recipe_categories.recipe_id
      and public.recipes.author_id = (
        select auth.uid()
      )
  )
);



-- =========================================================
-- READ OWN RECIPE TAGS
-- =========================================================

drop policy if exists
  "Users can read tags of own recipes"
on public.recipe_tags;


create policy
  "Users can read tags of own recipes"
on public.recipe_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.recipes
    where public.recipes.id =
      public.recipe_tags.recipe_id
      and public.recipes.author_id = (
        select auth.uid()
      )
  )
);



-- =========================================================
-- UPDATE MY RECIPE CLASSIFICATION
-- =========================================================
--
-- Only the owner of a recipe can call this operation
-- successfully.
--
-- The recipe must still be in DRAFT state.
--
-- This prevents editing while:
--
--   - pending review
--   - published
--   - archived
--
-- The function is SECURITY DEFINER because community users
-- intentionally do not receive direct write policies over
-- recipe_categories or recipe_tags.
--
-- Every permission check is therefore performed explicitly
-- before any modification.
-- =========================================================

create or replace function
public.update_my_recipe_classification(
  p_recipe_id uuid,
  p_recipe_type_id uuid,
  p_difficulty public.recipe_difficulty,
  p_category_ids uuid[],
  p_tag_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;

  v_author_id uuid;

  v_status
    public.recipe_status;
begin

  -- =======================================================
  -- AUTHENTICATION
  -- =======================================================

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;



  -- =======================================================
  -- LOAD RECIPE OWNERSHIP AND STATUS
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

  if v_author_id <>
    v_user_id then

    raise exception
      'Not authorized'
      using errcode = '42501';

  end if;



  -- =======================================================
  -- EDITABLE STATE
  -- =======================================================
  --
  -- Community authors can only modify recipes while they
  -- remain drafts.
  --
  -- pending_review recipes are intentionally locked.
  -- =======================================================

  if v_status <>
    'draft'
      ::public.recipe_status then

    raise exception
      'Recipe is not editable'
      using errcode = '42501';

  end if;



  -- =======================================================
  -- TAG LIMIT
  -- =======================================================
  --
  -- The application currently allows a maximum of ten
  -- tags.
  --
  -- We enforce the same invariant here instead of trusting
  -- frontend validation alone.
  -- =======================================================

  if coalesce(
    cardinality(
      p_tag_ids
    ),
    0
  ) > 10 then

    raise exception
      'A recipe cannot have more than 10 tags'
      using errcode = '22023';

  end if;



  -- =======================================================
  -- UPDATE DIRECT RECIPE CLASSIFICATION
  -- =======================================================
  --
  -- Notice what is deliberately absent:
  --
  --   featured
  --
  -- This operation does not reset it to false and does not
  -- accept a value for it.
  --
  -- It simply does not own that field.
  -- =======================================================

  update public.recipes
  set
    recipe_type_id =
      p_recipe_type_id,

    difficulty =
      p_difficulty

  where id =
    p_recipe_id;



  -- =======================================================
  -- REPLACE CATEGORIES
  -- =======================================================

  delete from
    public.recipe_categories
  where recipe_id =
    p_recipe_id;


  insert into
    public.recipe_categories (
      recipe_id,
      category_id
    )

  select
    p_recipe_id,
    category_id

  from (
    select distinct
      unnest(
        coalesce(
          p_category_ids,
          '{}'::uuid[]
        )
      )
        as category_id
  )
    as categories;



  -- =======================================================
  -- REPLACE TAGS
  -- =======================================================

  delete from
    public.recipe_tags
  where recipe_id =
    p_recipe_id;


  insert into
    public.recipe_tags (
      recipe_id,
      tag_id
    )

  select
    p_recipe_id,
    tag_id

  from (
    select distinct
      unnest(
        coalesce(
          p_tag_ids,
          '{}'::uuid[]
        )
      )
        as tag_id
  )
    as tags;

end;
$$;



-- =========================================================
-- RPC PERMISSIONS
-- =========================================================

revoke all
on function
public.update_my_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  uuid[],
  uuid[]
)
from public;


revoke all
on function
public.update_my_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  uuid[],
  uuid[]
)
from anon;


grant execute
on function
public.update_my_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  uuid[],
  uuid[]
)
to authenticated;
