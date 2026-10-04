-- =========================================================
-- CociHub
-- Community recipe review workflow
-- =========================================================
--
-- This migration introduces the moderation state machine
-- used by community recipes.
--
-- Community workflow:
--
--   draft
--     ↓
--   pending_review
--     ↓
--   published
--
-- A moderator can also return:
--
--   pending_review
--     ↓
--   draft
--
-- Important security principle:
--
-- Community users never choose a recipe status directly.
--
-- They execute business operations:
--
--   submit_my_recipe_for_review(...)
--
-- Administrators execute:
--
--   approve_recipe_review(...)
--   return_recipe_review(...)
--
-- The generic set_recipe_status(...) function remains
-- restricted to administrators.
-- =========================================================



-- =========================================================
-- SHARED RECIPE READINESS VALIDATION
-- =========================================================
--
-- This function contains the database definition of a
-- recipe that is complete enough to be published.
--
-- It is intentionally INTERNAL.
--
-- Community users do not receive EXECUTE permission.
--
-- It will be reused by:
--
--   - submit_my_recipe_for_review
--   - approve_recipe_review
--   - set_recipe_status
--
-- This prevents different workflows from having different
-- definitions of what "complete recipe" means.
-- =========================================================

create or replace function
public.assert_recipe_is_ready_for_publication(
  p_recipe_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipe_row
    public.recipes%rowtype;
begin

  -- -------------------------------------------------------
  -- RECIPE EXISTS
  -- -------------------------------------------------------

  select *
  into recipe_row
  from public.recipes
  where id =
    p_recipe_id;


  if not found then
    raise exception
      'Recipe not found'
      using errcode = 'P0002';
  end if;



  -- -------------------------------------------------------
  -- BASIC INFORMATION
  -- -------------------------------------------------------

  if btrim(
    coalesce(
      recipe_row.title,
      ''
    )
  ) = '' then

    raise exception
      'Recipe title is required'
      using errcode = '22023';

  end if;


  if btrim(
    coalesce(
      recipe_row.slug,
      ''
    )
  ) = '' then

    raise exception
      'Recipe slug is required'
      using errcode = '22023';

  end if;


  if btrim(
    coalesce(
      recipe_row.short_description,
      ''
    )
  ) = '' then

    raise exception
      'Short description is required'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- MAIN IMAGE
  -- -------------------------------------------------------

  if btrim(
    coalesce(
      recipe_row.image_path,
      ''
    )
  ) = '' then

    raise exception
      'Main image is required'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- CLASSIFICATION
  -- -------------------------------------------------------

  if recipe_row.recipe_type_id
    is null then

    raise exception
      'Recipe type is required'
      using errcode = '22023';

  end if;


  if recipe_row.difficulty
    is null then

    raise exception
      'Difficulty is required'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- SERVINGS
  -- -------------------------------------------------------

  if recipe_row.base_servings
      is null
    or recipe_row.base_servings <= 0
  then

    raise exception
      'Base servings are required'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- PREPARATION TIME
  -- -------------------------------------------------------
  --
  -- cooking_minutes is intentionally NOT validated here.
  --
  -- CociHub now derives cooking_minutes automatically from
  -- the durations of the recipe steps.
  --
  -- additional_minutes is optional.
  -- -------------------------------------------------------

  if recipe_row.preparation_minutes
      is null
    or recipe_row.preparation_minutes <= 0
  then

    raise exception
      'Preparation time must be greater than zero'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- CATEGORIES
  -- -------------------------------------------------------

  if not exists (
    select 1
    from public.recipe_categories
    where recipe_id =
      p_recipe_id
  ) then

    raise exception
      'At least one category is required'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- INGREDIENTS
  -- -------------------------------------------------------

  if not exists (
    select 1

    from public.ingredient_groups
      as ingredient_group

    join public.ingredients
      as ingredient
      on ingredient.ingredient_group_id =
        ingredient_group.id

    where ingredient_group.recipe_id =
      p_recipe_id
  ) then

    raise exception
      'At least one ingredient is required'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- RECIPE STEPS
  -- -------------------------------------------------------

  if not exists (
    select 1
    from public.recipe_steps
    where recipe_id =
      p_recipe_id
  ) then

    raise exception
      'At least one recipe step is required'
      using errcode = '22023';

  end if;

end;
$$;



-- =========================================================
-- INTERNAL READINESS FUNCTION PERMISSIONS
-- =========================================================
--
-- This function is infrastructure.
--
-- Normal application users must not invoke it directly.
-- =========================================================

revoke all
on function
public.assert_recipe_is_ready_for_publication(
  uuid
)
from public;


revoke all
on function
public.assert_recipe_is_ready_for_publication(
  uuid
)
from anon;


revoke all
on function
public.assert_recipe_is_ready_for_publication(
  uuid
)
from authenticated;



-- =========================================================
-- ADMIN RECIPE STATUS MANAGEMENT
-- =========================================================
--
-- This replaces the existing set_recipe_status function.
--
-- Main differences:
--
--   1. Publication validation is centralized.
--
--   2. pending_review is still NOT exposed as a generic
--      destination.
--
--   3. Publishing a pending_review recipe records its
--      moderation metadata automatically.
--
--   4. Returning a pending_review recipe to draft must use
--      return_recipe_review(), because a moderation note is
--      required.
--
--   5. Archiving a pending_review recipe is also blocked.
--
-- SECURITY DEFINER is safe here because the very first
-- authorization rule requires the caller to be an admin.
-- =========================================================

create or replace function
public.set_recipe_status(
  p_recipe_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipe_row
    public.recipes%rowtype;

  v_admin_id uuid;
begin

  -- -------------------------------------------------------
  -- AUTHENTICATION + ADMINISTRATION
  -- -------------------------------------------------------

  v_admin_id :=
    auth.uid();


  if v_admin_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;



  -- -------------------------------------------------------
  -- VALID GENERIC STATUS
  -- -------------------------------------------------------
  --
  -- pending_review is intentionally absent.
  --
  -- Community authors reach pending_review only through:
  --
  --   submit_my_recipe_for_review(...)
  -- -------------------------------------------------------

  if p_status not in (
    'draft',
    'published',
    'archived'
  ) then

    raise exception
      'Invalid recipe status'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- LOAD RECIPE
  -- -------------------------------------------------------

  select *
  into recipe_row
  from public.recipes
  where id =
    p_recipe_id;


  if not found then
    raise exception
      'Recipe not found'
      using errcode = 'P0002';
  end if;



  -- -------------------------------------------------------
  -- PUBLISH
  -- -------------------------------------------------------

  if p_status =
    'published' then

    perform
      public.assert_recipe_is_ready_for_publication(
        p_recipe_id
      );


    update public.recipes
    set
      status =
        'published'
          ::public.recipe_status,

      published_at =
        now(),

      reviewed_at =
        case
          when recipe_row.status =
            'pending_review'
              ::public.recipe_status
          then now()

          else reviewed_at
        end,

      reviewed_by =
        case
          when recipe_row.status =
            'pending_review'
              ::public.recipe_status
          then v_admin_id

          else reviewed_by
        end,

      review_notes =
        case
          when recipe_row.status =
            'pending_review'
              ::public.recipe_status
          then null

          else review_notes
        end

    where id =
      p_recipe_id;


    return;

  end if;



  -- -------------------------------------------------------
  -- RETURN TO DRAFT
  -- -------------------------------------------------------
  --
  -- A pending review cannot be silently returned to draft.
  --
  -- The moderator must use return_recipe_review(), which
  -- requires review notes.
  -- -------------------------------------------------------

  if p_status =
    'draft' then

    if recipe_row.status =
      'pending_review'
        ::public.recipe_status then

      raise exception
        'Pending review recipes must be returned through the review workflow'
        using errcode = '22023';

    end if;


    update public.recipes
    set
      status =
        'draft'
          ::public.recipe_status,

      published_at =
        null

    where id =
      p_recipe_id;


    return;

  end if;



  -- -------------------------------------------------------
  -- ARCHIVE
  -- -------------------------------------------------------

  if p_status =
    'archived' then

    if recipe_row.status =
      'pending_review'
        ::public.recipe_status then

      raise exception
        'Pending review recipes must be reviewed before archiving'
        using errcode = '22023';

    end if;


    update public.recipes
    set
      status =
        'archived'
          ::public.recipe_status

    where id =
      p_recipe_id;


    return;

  end if;

end;
$$;



-- =========================================================
-- SET STATUS PERMISSIONS
-- =========================================================

revoke all
on function
public.set_recipe_status(
  uuid,
  text
)
from public;


revoke all
on function
public.set_recipe_status(
  uuid,
  text
)
from anon;


grant execute
on function
public.set_recipe_status(
  uuid,
  text
)
to authenticated;



-- =========================================================
-- COMMUNITY: SUBMIT OWN RECIPE FOR REVIEW
-- =========================================================
--
-- A community author can submit ONLY:
--
--   - their own recipe
--   - currently in draft
--   - complete according to database rules
--
-- The caller cannot choose the destination status.
-- =========================================================

create or replace function
public.submit_my_recipe_for_review(
  p_recipe_id uuid
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

  -- -------------------------------------------------------
  -- AUTHENTICATION
  -- -------------------------------------------------------

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;



  -- -------------------------------------------------------
  -- LOAD OWNERSHIP + STATUS
  -- -------------------------------------------------------

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



  -- -------------------------------------------------------
  -- OWNERSHIP
  -- -------------------------------------------------------

  if v_author_id <>
    v_user_id then

    raise exception
      'Not authorized'
      using errcode = '42501';

  end if;



  -- -------------------------------------------------------
  -- VALID SOURCE STATE
  -- -------------------------------------------------------

  if v_status <>
    'draft'
      ::public.recipe_status then

    raise exception
      'Only draft recipes can be submitted for review'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- COMPLETE RECIPE VALIDATION
  -- -------------------------------------------------------

  perform
    public.assert_recipe_is_ready_for_publication(
      p_recipe_id
    );



  -- -------------------------------------------------------
  -- SUBMIT
  -- -------------------------------------------------------

  update public.recipes
  set
    status =
      'pending_review'
        ::public.recipe_status,

    submitted_at =
      now(),

    reviewed_at =
      null,

    reviewed_by =
      null,

    review_notes =
      null,

    published_at =
      null

  where id =
    p_recipe_id;

end;
$$;



-- =========================================================
-- SUBMIT PERMISSIONS
-- =========================================================

revoke all
on function
public.submit_my_recipe_for_review(
  uuid
)
from public;


revoke all
on function
public.submit_my_recipe_for_review(
  uuid
)
from anon;


grant execute
on function
public.submit_my_recipe_for_review(
  uuid
)
to authenticated;



-- =========================================================
-- ADMIN: APPROVE RECIPE REVIEW
-- =========================================================
--
-- Only pending_review recipes can be approved.
--
-- Publication itself is delegated to set_recipe_status(),
-- which performs the shared readiness validation and records
-- review metadata.
-- =========================================================

create or replace function
public.approve_recipe_review(
  p_recipe_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;

  v_status
    public.recipe_status;
begin

  -- -------------------------------------------------------
  -- ADMINISTRATION
  -- -------------------------------------------------------

  v_admin_id :=
    auth.uid();


  if v_admin_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;



  -- -------------------------------------------------------
  -- LOAD STATUS
  -- -------------------------------------------------------

  select
    recipe.status

  into
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



  -- -------------------------------------------------------
  -- STATE MACHINE
  -- -------------------------------------------------------

  if v_status <>
    'pending_review'
      ::public.recipe_status then

    raise exception
      'Only pending review recipes can be approved'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- APPROVE + PUBLISH
  -- -------------------------------------------------------

  perform
    public.set_recipe_status(
      p_recipe_id,
      'published'
    );

end;
$$;



-- =========================================================
-- APPROVE PERMISSIONS
-- =========================================================

revoke all
on function
public.approve_recipe_review(
  uuid
)
from public;


revoke all
on function
public.approve_recipe_review(
  uuid
)
from anon;


grant execute
on function
public.approve_recipe_review(
  uuid
)
to authenticated;



-- =========================================================
-- ADMIN: RETURN RECIPE FOR CHANGES
-- =========================================================
--
-- A moderator can return a pending recipe to draft.
--
-- Review notes are mandatory because the author must know
-- what needs to be corrected.
-- =========================================================

create or replace function
public.return_recipe_review(
  p_recipe_id uuid,
  p_review_notes text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;

  v_status
    public.recipe_status;

  v_review_notes text;
begin

  -- -------------------------------------------------------
  -- ADMINISTRATION
  -- -------------------------------------------------------

  v_admin_id :=
    auth.uid();


  if v_admin_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;



  -- -------------------------------------------------------
  -- REVIEW NOTES
  -- -------------------------------------------------------

  v_review_notes :=
    nullif(
      btrim(
        p_review_notes
      ),
      ''
    );


  if v_review_notes is null then
    raise exception
      'Review notes are required'
      using errcode = '22023';
  end if;


  if char_length(
    v_review_notes
  ) > 1500 then

    raise exception
      'Review notes are too long'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- LOAD STATUS
  -- -------------------------------------------------------

  select
    recipe.status

  into
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



  -- -------------------------------------------------------
  -- STATE MACHINE
  -- -------------------------------------------------------

  if v_status <>
    'pending_review'
      ::public.recipe_status then

    raise exception
      'Only pending review recipes can be returned'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- RETURN TO AUTHOR
  -- -------------------------------------------------------

  update public.recipes
  set
    status =
      'draft'
        ::public.recipe_status,

    reviewed_at =
      now(),

    reviewed_by =
      v_admin_id,

    review_notes =
      v_review_notes,

    published_at =
      null

  where id =
    p_recipe_id;

end;
$$;



-- =========================================================
-- RETURN PERMISSIONS
-- =========================================================

revoke all
on function
public.return_recipe_review(
  uuid,
  text
)
from public;


revoke all
on function
public.return_recipe_review(
  uuid,
  text
)
from anon;


grant execute
on function
public.return_recipe_review(
  uuid,
  text
)
to authenticated;
