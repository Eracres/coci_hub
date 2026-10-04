-- =========================================================
-- CociHub
-- Fix automatic allergen manual_presence enum cast
-- =========================================================
--
-- sync_recipe_automatic_allergens() inserts automatically
-- detected allergens into recipe_allergens.
--
-- manual_presence must remain NULL for purely automatic
-- evidence.
--
-- Because the INSERT source uses SELECT DISTINCT,
-- PostgreSQL resolves an untyped NULL expression as text.
--
-- recipe_allergens.manual_presence is instead typed as:
--
--   public.allergen_presence
--
-- The NULL therefore needs an explicit enum cast:
--
--   null::public.allergen_presence
--
-- No behavior changes beyond correcting that type mismatch.
-- =========================================================


create or replace function
public.sync_recipe_automatic_allergens(
  p_recipe_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin

  -- =======================================================
  -- AUTHORIZATION
  -- =======================================================

  if not public.can_edit_recipe(
    p_recipe_id
  ) then

    raise exception
      'Not authorized'
      using errcode = '42501';

  end if;


  -- =======================================================
  -- RECIPE EXISTS
  -- =======================================================

  perform 1
  from public.recipes
  where id =
    p_recipe_id;


  if not found then

    raise exception
      'Recipe not found'
      using errcode = 'P0002';

  end if;


  -- =======================================================
  -- ADD / REFRESH AUTOMATIC ALLERGENS
  -- =======================================================
  --
  -- Every ingredient is resolved against the deterministic
  -- CociHub food catalog.
  --
  -- A matched food may point to one or more allergens.
  --
  -- Automatic deterministic evidence always means:
  --
  --   presence = present
  --   detected_present = true
  --
  -- manual_presence remains NULL unless a user has also
  -- supplied manual evidence for the same allergen.
  -- =======================================================

  insert into public.recipe_allergens (
    recipe_id,
    allergen_id,
    presence,
    manual_presence,
    detected_present
  )

  select distinct
    p_recipe_id,

    food_allergen.allergen_id,

    'present'
      ::public.allergen_presence,

    null
      ::public.allergen_presence,

    true

  from public.ingredient_groups
    as ingredient_group

  join public.ingredients
    as ingredient
    on ingredient.ingredient_group_id =
      ingredient_group.id

  cross join lateral
    public.resolve_food_catalog_item(
      ingredient.name
    )
    as resolution

  join public.food_allergens
    as food_allergen
    on food_allergen.food_item_id =
      resolution.food_item_id

  where ingredient_group.recipe_id =
    p_recipe_id

    and resolution.resolution_status =
      'matched'

  on conflict (
    recipe_id,
    allergen_id
  )

  do update
  set
    detected_present =
      true,

    presence =
      'present'
        ::public.allergen_presence;


  -- =======================================================
  -- REMOVE AUTOMATIC EVIDENCE WHEN INGREDIENT DISAPPEARS
  -- =======================================================
  --
  -- If the allergen also has manual information, that
  -- information must survive.
  --
  -- Example:
  --
  -- Before:
  --
  --   manual_presence  = possible
  --   detected_present = true
  --   presence         = present
  --
  -- Ingredient disappears:
  --
  --   manual_presence  = possible
  --   detected_present = false
  --   presence         = possible
  -- =======================================================

  update public.recipe_allergens
    as recipe_allergen

  set
    detected_present =
      false,

    presence =
      recipe_allergen.manual_presence

  where recipe_allergen.recipe_id =
    p_recipe_id

    and recipe_allergen.detected_present =
      true

    and recipe_allergen.manual_presence
      is not null

    and not exists (

      select 1

      from public.ingredient_groups
        as ingredient_group

      join public.ingredients
        as ingredient
        on ingredient.ingredient_group_id =
          ingredient_group.id

      cross join lateral
        public.resolve_food_catalog_item(
          ingredient.name
        )
        as resolution

      join public.food_allergens
        as food_allergen
        on food_allergen.food_item_id =
          resolution.food_item_id

      where ingredient_group.recipe_id =
        p_recipe_id

        and resolution.resolution_status =
          'matched'

        and food_allergen.allergen_id =
          recipe_allergen.allergen_id
    );


  -- =======================================================
  -- DELETE OBSOLETE PURELY AUTOMATIC ROWS
  -- =======================================================
  --
  -- If an allergen existed only because of automatic
  -- detection and no ingredient currently provides that
  -- evidence anymore, the relation can disappear entirely.
  -- =======================================================

  delete from public.recipe_allergens
    as recipe_allergen

  where recipe_allergen.recipe_id =
    p_recipe_id

    and recipe_allergen.detected_present =
      true

    and recipe_allergen.manual_presence
      is null

    and not exists (

      select 1

      from public.ingredient_groups
        as ingredient_group

      join public.ingredients
        as ingredient
        on ingredient.ingredient_group_id =
          ingredient_group.id

      cross join lateral
        public.resolve_food_catalog_item(
          ingredient.name
        )
        as resolution

      join public.food_allergens
        as food_allergen
        on food_allergen.food_item_id =
          resolution.food_item_id

      where ingredient_group.recipe_id =
        p_recipe_id

        and resolution.resolution_status =
          'matched'

        and food_allergen.allergen_id =
          recipe_allergen.allergen_id
    );

end;
$$;



-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.sync_recipe_automatic_allergens(
  uuid
)
from public;


revoke all
on function
public.sync_recipe_automatic_allergens(
  uuid
)
from anon;


grant execute
on function
public.sync_recipe_automatic_allergens(
  uuid
)
to authenticated;
