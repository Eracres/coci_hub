-- =========================================================
-- CociHub
-- Add soy sauce to deterministic food allergen catalog
-- =========================================================
--
-- The allergen resolver intentionally performs exact
-- normalized matching.
--
-- We therefore expand the controlled catalog instead of
-- introducing fuzzy or substring matching.
--
-- Generic soy sauce is deterministically associated with:
--
--   Soy
--
-- Gluten is NOT inferred automatically here because the
-- presence of wheat/gluten depends on the specific product.
-- That information can be added manually when the product
-- label confirms it.
-- =========================================================


-- =========================================================
-- FOOD ITEM
-- =========================================================

insert into public.food_items (
  name,
  slug,
  is_active
)

select
  'Salsa de soja',
  'soy-sauce',
  true

where not exists (

  select 1

  from public.food_items
    as food

  where
    food.slug =
      'soy-sauce'

    or food.normalized_name =
      public.normalize_food_term(
        'Salsa de soja'
      )
);


-- =========================================================
-- ALIASES
-- =========================================================

with soy_sauce as (

  select
    food.id

  from public.food_items
    as food

  where
    food.slug =
      'soy-sauce'

    or food.normalized_name =
      public.normalize_food_term(
        'Salsa de soja'
      )

  order by
    case
      when food.slug =
        'soy-sauce'
      then 0
      else 1
    end

  limit 1

),

alias_seed (
  alias
) as (

  values

    (
      'salsa soja'
    ),

    (
      'salsa de soya'
    ),

    (
      'salsa soya'
    ),

    (
      'soy sauce'
    ),

    (
      'light soy sauce'
    ),

    (
      'dark soy sauce'
    ),

    (
      'salsa de soja ligera'
    ),

    (
      'salsa de soja oscura'
    )

)

insert into public.food_aliases (
  food_item_id,
  alias
)

select
  soy_sauce.id,
  alias_seed.alias

from soy_sauce

cross join alias_seed

on conflict do nothing;


-- =========================================================
-- FOOD -> ALLERGEN
-- =========================================================

insert into public.food_allergens (
  food_item_id,
  allergen_id
)

select
  food.id,
  allergen.id

from public.food_items
  as food

join public.allergens
  as allergen
  on allergen.slug =
    'soy'

where
  food.slug =
    'soy-sauce'

on conflict do nothing;


-- =========================================================
-- REFRESH EXISTING RECIPES
-- =========================================================
--
-- Existing recipes may already contain "Salsa de soja".
--
-- We add the newly discovered automatic evidence without
-- touching any existing manual allergen evidence.
-- =========================================================

insert into public.recipe_allergens (
  recipe_id,
  allergen_id,
  presence,
  manual_presence,
  detected_present
)

select distinct
  ingredient_group.recipe_id,

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

join public.food_items
  as food
  on food.id =
    resolution.food_item_id

where
  resolution.resolution_status =
    'matched'

  and food.slug =
    'soy-sauce'

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
