-- =========================================================
-- CociHub
-- Atomic update of recipe classification
-- =========================================================

create or replace function public.update_recipe_classification(
  p_recipe_id uuid,
  p_recipe_type_id uuid,
  p_difficulty public.recipe_difficulty,
  p_featured boolean,
  p_category_ids uuid[],
  p_tag_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin

  -- Solo administradores durante el MVP.
  if not public.is_admin() then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- Actualizamos los campos directos de recipes.
  update public.recipes
  set
    recipe_type_id = p_recipe_type_id,
    difficulty = p_difficulty,
    featured = p_featured
  where id = p_recipe_id;


  if not found then
    raise exception 'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- =====================================================
  -- CATEGORIES
  -- =====================================================

  delete from public.recipe_categories
  where recipe_id = p_recipe_id;

  insert into public.recipe_categories (
    recipe_id,
    category_id
  )
  select
    p_recipe_id,
    category_id
  from (
    select distinct unnest(
      coalesce(
        p_category_ids,
        '{}'::uuid[]
      )
    ) as category_id
  ) categories;


  -- =====================================================
  -- TAGS
  -- =====================================================

  delete from public.recipe_tags
  where recipe_id = p_recipe_id;

  insert into public.recipe_tags (
    recipe_id,
    tag_id
  )
  select
    p_recipe_id,
    tag_id
  from (
    select distinct unnest(
      coalesce(
        p_tag_ids,
        '{}'::uuid[]
      )
    ) as tag_id
  ) tags;

end;
$$;


revoke all
on function public.update_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  boolean,
  uuid[],
  uuid[]
)
from public;


grant execute
on function public.update_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  boolean,
  uuid[],
  uuid[]
)
to authenticated;