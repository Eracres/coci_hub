-- =========================================================
-- CociHub
-- Replace recipe ingredient groups atomically
-- =========================================================

create or replace function public.replace_recipe_ingredients(
  p_recipe_id uuid,
  p_groups jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  group_item jsonb;
  ingredient_item jsonb;

  new_group_id uuid;
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
  -- REMOVE PREVIOUS GROUPS
  --
  -- Ingredients are deleted automatically through
  -- ON DELETE CASCADE.
  -- =======================================================

  delete from public.ingredient_groups
  where recipe_id = p_recipe_id;


  -- =======================================================
  -- CREATE GROUPS
  -- =======================================================

  for group_item in
    select value
    from jsonb_array_elements(
      coalesce(
        p_groups,
        '[]'::jsonb
      )
    )
  loop

    insert into public.ingredient_groups (
      recipe_id,
      name,
      position
    )
    values (
      p_recipe_id,

      group_item ->> 'name',

      coalesce(
        (
          group_item
          ->> 'position'
        )::integer,
        0
      )
    )
    returning id
    into new_group_id;


    -- =====================================================
    -- CREATE INGREDIENTS
    -- =====================================================

    for ingredient_item in
      select value
      from jsonb_array_elements(
        coalesce(
          group_item
          -> 'ingredients',
          '[]'::jsonb
        )
      )
    loop

      insert into public.ingredients (
        ingredient_group_id,
        name,
        quantity,
        unit,
        notes,
        scalable,
        position
      )
      values (
        new_group_id,

        ingredient_item
        ->> 'name',

        case
          when
            ingredient_item
            -> 'quantity'
            is null
            or jsonb_typeof(
              ingredient_item
              -> 'quantity'
            ) = 'null'
          then null

          else (
            ingredient_item
            ->> 'quantity'
          )::numeric
        end,

        nullif(
          ingredient_item
          ->> 'unit',
          ''
        ),

        nullif(
          ingredient_item
          ->> 'notes',
          ''
        ),

        coalesce(
          (
            ingredient_item
            ->> 'scalable'
          )::boolean,
          true
        ),

        coalesce(
          (
            ingredient_item
            ->> 'position'
          )::integer,
          0
        )
      );

    end loop;

  end loop;

end;
$$;


revoke all
on function public.replace_recipe_ingredients(
  uuid,
  jsonb
)
from public;


grant execute
on function public.replace_recipe_ingredients(
  uuid,
  jsonb
)
to authenticated;