-- =========================================================
-- CociHub
-- Replace recipe allergens atomically
-- =========================================================

create or replace function public.replace_recipe_allergens(
  p_recipe_id uuid,
  p_allergens jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  allergen_item jsonb;
begin

  -- =======================================================
  -- SECURITY
  -- =======================================================

  if not public.is_admin() then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- RECIPE EXISTS
  -- =======================================================

  perform 1
  from public.recipes
  where id = p_recipe_id;

  if not found then
    raise exception 'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- =======================================================
  -- REMOVE CURRENT RELATIONS
  -- =======================================================

  delete from public.recipe_allergens
  where recipe_id = p_recipe_id;


  -- =======================================================
  -- CREATE CURRENT RELATIONS
  -- =======================================================

  for allergen_item in
    select value
    from jsonb_array_elements(
      coalesce(
        p_allergens,
        '[]'::jsonb
      )
    )
  loop

    insert into public.recipe_allergens (
      recipe_id,
      allergen_id,
      presence
    )
    values (
      p_recipe_id,

      (
        allergen_item
        ->> 'allergenId'
      )::uuid,

      (
        allergen_item
        ->> 'presence'
      )::public.allergen_presence
    );

  end loop;

end;
$$;


revoke all
on function public.replace_recipe_allergens(
  uuid,
  jsonb
)
from public;


grant execute
on function public.replace_recipe_allergens(
  uuid,
  jsonb
)
to authenticated;