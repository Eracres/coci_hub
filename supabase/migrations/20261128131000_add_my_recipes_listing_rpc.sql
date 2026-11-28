-- =========================================================
-- CociHub
-- AUD-136.1
-- Secure personal recipe listing
-- =========================================================


-- =========================================================
-- 1. GET OWN RECIPES
-- =========================================================

create function public.get_my_recipes()
returns table (
  id uuid,
  title varchar,
  slug varchar,
  status public.recipe_status,
  short_description varchar,
  image_path text,
  image_alt varchar,
  created_at timestamptz,
  updated_at timestamptz,
  submitted_at timestamptz,
  published_at timestamptz,
  review_notes text
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid;
begin

  -- AUTHENTICATION

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Not authenticated'
      using errcode = '42501';
  end if;


  -- LOAD OWN RECIPES

  return query

  select
    recipe.id,
    recipe.title,
    recipe.slug,
    recipe.status,
    recipe.short_description,
    recipe.image_path,
    recipe.image_alt,
    recipe.created_at,
    recipe.updated_at,
    recipe.submitted_at,
    recipe.published_at,
    recipe.review_notes

  from public.recipes as recipe

  where recipe.author_id = v_user_id

  order by recipe.updated_at desc;

end;
$function$;


-- =========================================================
-- 2. FUNCTION OWNERSHIP
-- =========================================================

alter function public.get_my_recipes()
owner to postgres;


-- =========================================================
-- 3. EXECUTION PERMISSIONS
-- =========================================================

revoke all
on function public.get_my_recipes()
from public, anon, authenticated;


grant execute
on function public.get_my_recipes()
to authenticated;


-- =========================================================
-- 4. DOCUMENTATION
-- =========================================================

comment on function public.get_my_recipes()
is
  'Returns only recipes owned by the authenticated user,
   including private review notes and submission dates.';