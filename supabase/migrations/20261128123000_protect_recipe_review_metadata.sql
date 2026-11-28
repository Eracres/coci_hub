-- =========================================================
-- CociHub
-- AUD-136
-- Protect private recipe review metadata
-- =========================================================


-- =========================================================
-- 1. AUTHORIZED RECIPE REVIEW INFORMATION
-- =========================================================

create function public.get_recipe_review_info(
  p_recipe_id uuid
)
returns table (
  id uuid,
  status public.recipe_status,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  review_notes text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
  v_is_admin boolean;
begin

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;

  v_is_admin :=
    coalesce(public.is_admin(), false);


  return query

  select
    recipe.id,
    recipe.status,
    recipe.submitted_at,
    recipe.reviewed_at,

    case
      when v_is_admin then recipe.reviewed_by
      else null::uuid
    end,

    recipe.review_notes

  from public.recipes as recipe

  where recipe.id = p_recipe_id

    and (
      v_is_admin
      or recipe.author_id = v_user_id
    );

end;
$function$;


-- =========================================================
-- 2. PERSONAL DASHBOARD RECIPES
-- =========================================================

create function public.get_my_dashboard_recipes()
returns table (
  id uuid,
  title varchar,
  slug varchar,
  status public.recipe_status,
  image_path text,
  image_alt varchar,
  updated_at timestamptz,
  submitted_at timestamptz,
  published_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
begin

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;


  return query

  select
    recipe.id,
    recipe.title,
    recipe.slug,
    recipe.status,
    recipe.image_path,
    recipe.image_alt,
    recipe.updated_at,
    recipe.submitted_at,
    recipe.published_at

  from public.recipes as recipe

  where recipe.author_id = v_user_id

  order by recipe.updated_at desc;

end;
$function$;


-- =========================================================
-- 3. FUNCTION OWNERSHIP
-- =========================================================

alter function public.get_recipe_review_info(uuid)
owner to postgres;

alter function public.get_my_dashboard_recipes()
owner to postgres;


-- =========================================================
-- 4. FUNCTION EXECUTION PERMISSIONS
-- =========================================================

revoke all
on function public.get_recipe_review_info(uuid)
from public, anon, authenticated;

grant execute
on function public.get_recipe_review_info(uuid)
to authenticated;


revoke all
on function public.get_my_dashboard_recipes()
from public, anon, authenticated;

grant execute
on function public.get_my_dashboard_recipes()
to authenticated;


-- =========================================================
-- 5. REMOVE TABLE-LEVEL SELECT PERMISSION
-- =========================================================

revoke select
on table public.recipes
from public, anon, authenticated;


-- =========================================================
-- 6. REMOVE EXISTING COLUMN-LEVEL SELECT GRANTS
-- =========================================================

do $migration$
declare
  v_columns text;
begin

  select string_agg(
    quote_ident(attname),
    ', ' order by attnum
  )
  into v_columns

  from pg_attribute

  where attrelid = 'public.recipes'::regclass
    and attnum > 0
    and not attisdropped;

  execute format(
    'revoke select (%s)
     on table public.recipes
     from public, anon, authenticated',
    v_columns
  );

end;
$migration$;


-- =========================================================
-- 7. EXPLICIT PUBLIC COLUMN ALLOWLIST
-- =========================================================

grant select (
  id,
  author_id,
  recipe_type_id,
  title,
  slug,
  short_description,
  introduction,
  image_path,
  image_alt,
  status,
  difficulty,
  base_servings,
  preparation_minutes,
  featured,
  tips,
  substitutions,
  storage,
  freezing,
  reheating,
  source_type,
  source_title,
  source_author,
  source_page,
  source_url,
  source_notes,
  created_at,
  updated_at,
  published_at,
  elaboration_minutes
)
on table public.recipes
to anon, authenticated;


-- =========================================================
-- PRIVATE FIELDS:
--
-- submitted_at
-- reviewed_at
-- reviewed_by
-- review_notes
--
-- Accessible only through authorized RPCs.
-- Existing RLS policies remain unchanged.
-- =========================================================