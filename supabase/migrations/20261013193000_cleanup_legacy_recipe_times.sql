-- =========================================================
-- CociHub
-- Remove legacy recipe time model
-- =========================================================
--
-- Final model:
--
--   preparation_minutes
--     Entered manually.
--
--   elaboration_minutes
--     Derived from recipe_steps.duration_minutes.
--
-- Historical migrations remain untouched.
-- =========================================================



-- =========================================================
-- DROP LEGACY TRIGGER
-- =========================================================

drop trigger if exists
  recipe_steps_sync_cooking_minutes_trigger
on public.recipe_steps;



-- =========================================================
-- DROP LEGACY FUNCTIONS / RPC
-- =========================================================

drop function if exists
public.handle_recipe_steps_cooking_time_sync();


drop function if exists
public.sync_recipe_cooking_minutes(
  uuid
);


drop function if exists
public.update_my_recipe_times(
  uuid,
  integer,
  integer
);



-- =========================================================
-- DROP LEGACY COLUMNS
-- =========================================================
--
-- The transition migration already preserved legacy values
-- inside elaboration_minutes. We intentionally do not run a
-- global recalculation here because older recipes may still
-- contain waiting time that has not yet been represented by
-- explicit recipe steps.
-- =========================================================

alter table public.recipes
  drop column if exists
    cooking_minutes,

  drop column if exists
    additional_minutes;



-- =========================================================
-- COLUMN DOCUMENTATION
-- =========================================================

comment on column
public.recipes.preparation_minutes
is
  'Manual preparation time in minutes before recipe elaboration.';


comment on column
public.recipes.elaboration_minutes
is
  'Total elaboration time in minutes, derived automatically from recipe_steps.duration_minutes.';



-- =========================================================
-- FINAL PUBLICATION READINESS
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


  if recipe_row.base_servings
      is null
    or recipe_row.base_servings <= 0
  then

    raise exception
      'Base servings are required'
      using errcode = '22023';

  end if;


  if recipe_row.preparation_minutes
      is null
    or recipe_row.preparation_minutes <= 0
  then

    raise exception
      'Preparation time must be greater than zero'
      using errcode = '22023';

  end if;


  if recipe_row.elaboration_minutes
    is null then

    raise exception
      'Elaboration time must be calculated'
      using errcode = '22023';

  end if;


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
-- INTERNAL READINESS PERMISSIONS
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
-- FINAL STATE
-- =========================================================
--
-- Preserved:
--
--   recipes.preparation_minutes
--   recipes.elaboration_minutes
--   sync_recipe_elaboration_minutes(uuid)
--   handle_recipe_steps_elaboration_time_sync()
--   recipe_steps_sync_elaboration_minutes_trigger
--   update_my_recipe_preparation_time(uuid, integer)
--
-- Removed:
--
--   recipes.cooking_minutes
--   recipes.additional_minutes
--   sync_recipe_cooking_minutes(uuid)
--   handle_recipe_steps_cooking_time_sync()
--   recipe_steps_sync_cooking_minutes_trigger
--   update_my_recipe_times(uuid, integer, integer)
-- =========================================================
