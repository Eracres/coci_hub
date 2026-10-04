-- =========================================================
-- CociHub
-- Add deterministic food allergen resolver
-- =========================================================
--
-- This migration adds the deterministic resolution layer
-- between recipe ingredient names and the CociHub food
-- allergen catalog.
--
-- No artificial intelligence is involved.
--
-- Resolution flow:
--
--   ingredient text
--       ↓
--   normalize_food_term()
--       ↓
--   food_items / food_aliases
--       ↓
--   food_allergens
--       ↓
--   allergens
--
-- Important safety rule:
--
--   UNKNOWN FOOD ≠ FOOD WITHOUT ALLERGENS
--
-- An ingredient that cannot be resolved is reported as
-- unknown instead of being silently treated as allergen-free.
--
-- Possible resolution states:
--
--   matched
--   unknown
--   ambiguous
--   invalid
--
-- =========================================================



-- =========================================================
-- RESOLVE FOOD CATALOG ITEM
-- =========================================================
--
-- Resolves one textual food name against:
--
--   1. canonical food names
--   2. aliases
--
-- Matching is exact AFTER normalize_food_term().
--
-- The function deliberately avoids fuzzy matching.
--
-- Example:
--
--   "  PARMIGIANO  "
--
-- becomes:
--
--   "parmigiano"
--
-- and can resolve through food_aliases to:
--
--   "Queso parmesano"
--
-- If no catalog item matches:
--
--   resolution_status = 'unknown'
--
-- If more than one different canonical food somehow matches:
--
--   resolution_status = 'ambiguous'
--
-- The ambiguous state is defensive. Current unique indexes
-- prevent duplicates inside each catalog table, but a future
-- administration error could theoretically create a
-- cross-table ambiguity between a canonical name and an
-- alias belonging to another food.
-- =========================================================

create or replace function
public.resolve_food_catalog_item(
  p_value text
)
returns table (
  input_value text,
  normalized_value text,
  resolution_status text,
  food_item_id uuid,
  food_name varchar,
  matched_by text
)
language sql
stable
security invoker
set search_path = ''
as $$

  with normalized_input as (
    select
      case
        when nullif(
          btrim(
            p_value
          ),
          ''
        ) is null
        then null

        else
          public.normalize_food_term(
            p_value
          )
      end
        as normalized_value
  ),


  candidates as (

    -- -----------------------------------------------------
    -- CANONICAL NAME MATCH
    -- -----------------------------------------------------

    select
      food.id
        as food_item_id,

      food.name
        as food_name,

      'canonical'::text
        as match_source

    from normalized_input
      as input

    join public.food_items
      as food

      on food.normalized_name =
        input.normalized_value

    where
      input.normalized_value
        is not null

      and food.is_active = true


    union all


    -- -----------------------------------------------------
    -- ALIAS MATCH
    -- -----------------------------------------------------

    select
      food.id
        as food_item_id,

      food.name
        as food_name,

      'alias'::text
        as match_source

    from normalized_input
      as input

    join public.food_aliases
      as food_alias

      on food_alias.normalized_alias =
        input.normalized_value

    join public.food_items
      as food

      on food.id =
        food_alias.food_item_id

    where
      input.normalized_value
        is not null

      and food.is_active = true

  ),


  grouped_candidates as (
    select
      candidate.food_item_id,
      candidate.food_name,

      bool_or(
        candidate.match_source =
          'canonical'
      )
        as matched_canonical,

      bool_or(
        candidate.match_source =
          'alias'
      )
        as matched_alias

    from candidates
      as candidate

    group by
      candidate.food_item_id,
      candidate.food_name
  ),


  resolution_summary as (
    select
      count(*)::integer
        as match_count

    from grouped_candidates
  ),


  single_match as (
    select
      candidate.food_item_id,
      candidate.food_name,
      candidate.matched_canonical,
      candidate.matched_alias

    from grouped_candidates
      as candidate

    where (
      select
        summary.match_count

      from resolution_summary
        as summary
    ) = 1
  )


  select
    p_value
      as input_value,

    input.normalized_value,

    case

      when input.normalized_value
        is null
      then
        'invalid'


      when summary.match_count = 0
      then
        'unknown'


      when summary.match_count = 1
      then
        'matched'


      else
        'ambiguous'

    end
      as resolution_status,


    match.food_item_id,

    match.food_name,


    case

      when summary.match_count <> 1
      then
        null


      when
        match.matched_canonical
        and match.matched_alias
      then
        'canonical+alias'


      when match.matched_canonical
      then
        'canonical'


      when match.matched_alias
      then
        'alias'


      else
        null

    end
      as matched_by


  from normalized_input
    as input

  cross join resolution_summary
    as summary

  left join single_match
    as match
    on true;

$$;



-- =========================================================
-- RESOLVER PERMISSIONS
-- =========================================================

revoke all
on function
public.resolve_food_catalog_item(
  text
)
from public;


revoke all
on function
public.resolve_food_catalog_item(
  text
)
from anon;


grant execute
on function
public.resolve_food_catalog_item(
  text
)
to authenticated;



-- =========================================================
-- GET FOOD CATALOG ALLERGENS
-- =========================================================
--
-- Given one canonical food item ID, returns the allergens
-- that CociHub knows are PRESENT in that food.
--
-- food_allergens only represents deterministic containment.
--
-- Example:
--
--   Queso parmesano
--       ↓
--   Leche / present
--
-- "possible" is intentionally not inferred here because
-- traces and cross-contamination normally depend on the
-- specific commercial product or manufacturing process.
-- =========================================================

create or replace function
public.get_food_catalog_allergens(
  p_food_item_id uuid
)
returns table (
  allergen_id uuid,
  allergen_name varchar,
  allergen_slug varchar,
  presence public.allergen_presence
)
language sql
stable
security invoker
set search_path = ''
as $$

  select
    allergen.id
      as allergen_id,

    allergen.name
      as allergen_name,

    allergen.slug
      as allergen_slug,

    'present'
      ::public.allergen_presence
      as presence

  from public.food_items
    as food

  join public.food_allergens
    as food_allergen

    on food_allergen.food_item_id =
      food.id

  join public.allergens
    as allergen

    on allergen.id =
      food_allergen.allergen_id

  where
    food.id =
      p_food_item_id

    and food.is_active = true

  order by
    allergen.position,
    allergen.name;

$$;



-- =========================================================
-- FOOD ALLERGEN PERMISSIONS
-- =========================================================

revoke all
on function
public.get_food_catalog_allergens(
  uuid
)
from public;


revoke all
on function
public.get_food_catalog_allergens(
  uuid
)
from anon;


grant execute
on function
public.get_food_catalog_allergens(
  uuid
)
to authenticated;



-- =========================================================
-- ANALYZE RECIPE INGREDIENT ALLERGENS
-- =========================================================
--
-- Receives a JSON array containing ingredient names.
--
-- Example input:
--
-- [
--   "harina de trigo",
--   "huevo",
--   "mantequilla",
--   "manzana"
-- ]
--
-- Every ingredient is independently resolved.
--
-- A matched ingredient can produce:
--
--   one allergen
--   several allergens
--   zero known allergens
--
-- An unknown ingredient remains in the result with:
--
--   resolution_status = 'unknown'
--
-- and NULL allergen fields.
--
-- This is important because:
--
--   UNKNOWN ≠ ALLERGEN-FREE
--
-- =========================================================

create or replace function
public.analyze_recipe_ingredient_allergens(
  p_ingredient_names jsonb
)
returns table (
  ingredient_index integer,
  ingredient_name text,
  normalized_name text,
  resolution_status text,
  food_item_id uuid,
  food_name varchar,
  matched_by text,
  allergen_id uuid,
  allergen_name varchar,
  allergen_slug varchar,
  presence public.allergen_presence
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_ingredient_names jsonb;
begin

  -- -------------------------------------------------------
  -- NORMALIZE NULL INPUT
  -- -------------------------------------------------------

  v_ingredient_names :=
    coalesce(
      p_ingredient_names,
      '[]'::jsonb
    );


  -- -------------------------------------------------------
  -- VALIDATE JSON STRUCTURE
  -- -------------------------------------------------------

  if jsonb_typeof(
    v_ingredient_names
  ) <> 'array' then

    raise exception
      'Ingredient names must be a JSON array'
      using errcode = '22023';

  end if;


  -- -------------------------------------------------------
  -- ARRAY ITEMS MUST BE STRINGS
  -- -------------------------------------------------------

  if exists (
    select 1

    from jsonb_array_elements(
      v_ingredient_names
    ) as element

    where jsonb_typeof(
      element.value
    ) <> 'string'
  ) then

    raise exception
      'Every ingredient name must be a string'
      using errcode = '22023';

  end if;


  -- -------------------------------------------------------
  -- ANALYZE INGREDIENTS
  -- -------------------------------------------------------

  return query

  select
    (
      ingredient.ordinality - 1
    )::integer
      as ingredient_index,

    ingredient.name
      as ingredient_name,

    resolution.normalized_value
      as normalized_name,

    resolution.resolution_status,

    resolution.food_item_id,

    resolution.food_name,

    resolution.matched_by,

    allergen.allergen_id,

    allergen.allergen_name,

    allergen.allergen_slug,

    allergen.presence


  from jsonb_array_elements_text(
    v_ingredient_names
  )
  with ordinality
    as ingredient(
      name,
      ordinality
    )


  cross join lateral
    public.resolve_food_catalog_item(
      ingredient.name
    )
      as resolution


  left join lateral
    public.get_food_catalog_allergens(
      resolution.food_item_id
    )
      as allergen

    on resolution.resolution_status =
      'matched'


  order by
    ingredient.ordinality,
    allergen.allergen_name
      nulls last;

end;
$$;



-- =========================================================
-- RECIPE ANALYZER PERMISSIONS
-- =========================================================

revoke all
on function
public.analyze_recipe_ingredient_allergens(
  jsonb
)
from public;


revoke all
on function
public.analyze_recipe_ingredient_allergens(
  jsonb
)
from anon;


grant execute
on function
public.analyze_recipe_ingredient_allergens(
  jsonb
)
to authenticated;
