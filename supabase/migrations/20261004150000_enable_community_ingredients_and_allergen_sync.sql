-- =========================================================
-- CociHub
-- Community recipe ingredients and automatic allergen sync
-- =========================================================
--
-- This migration connects several previously independent
-- parts of the CociHub data model:
--
--   recipes
--       ↓
--   ingredient_groups
--       ↓
--   ingredients
--       ↓
--   food catalog resolver
--       ↓
--   food_allergens
--       ↓
--   recipe_allergens
--
-- The automatic allergen system is deterministic.
--
-- It does NOT:
--
--   - use AI
--   - use fuzzy matching
--   - infer allergens from unknown foods
--   - interpret UNKNOWN as allergen-free
--
-- Manual allergen information is preserved independently
-- from deterministic automatic detection.
-- =========================================================



-- =========================================================
-- RECIPE ALLERGEN EVIDENCE
-- =========================================================
--
-- Existing recipe_allergens rows were created manually.
--
-- We now distinguish:
--
--   manual_presence
--
--     Explicit information entered by a user/admin.
--
--   detected_present
--
--     TRUE when CociHub deterministically detects that the
--     current recipe ingredients contain the allergen.
--
-- presence remains the effective value used by the current
-- application and public recipe pages.
--
-- This keeps the migration backwards-compatible with the
-- existing application.
-- =========================================================

alter table public.recipe_allergens
add column if not exists
  manual_presence
  public.allergen_presence;


alter table public.recipe_allergens
add column if not exists
  detected_present boolean
  not null
  default false;



-- =========================================================
-- BACKFILL EXISTING ALLERGEN DATA
-- =========================================================
--
-- Existing recipe_allergens rows predate the automatic
-- detector.
--
-- They must therefore be interpreted as manual information.
-- =========================================================

update public.recipe_allergens
set manual_presence =
  presence
where manual_presence is null
  and detected_present = false;



-- =========================================================
-- ALLERGEN EVIDENCE CONSTRAINT
-- =========================================================
--
-- A recipe_allergens row must have at least one reason to
-- exist:
--
--   - automatic detection
--   - manual information
-- =========================================================

alter table public.recipe_allergens
drop constraint if exists
  recipe_allergens_evidence_check;


alter table public.recipe_allergens
add constraint
  recipe_allergens_evidence_check
check (
  detected_present
  or manual_presence is not null
);



-- =========================================================
-- EFFECTIVE PRESENCE CONSISTENCY
-- =========================================================
--
-- Automatic deterministic detection always wins:
--
-- detected_present = TRUE
--     → presence = present
--
-- Otherwise:
--
--     presence = manual_presence
-- =========================================================

alter table public.recipe_allergens
drop constraint if exists
  recipe_allergens_presence_consistency_check;


alter table public.recipe_allergens
add constraint
  recipe_allergens_presence_consistency_check
check (
  (
    detected_present = true
    and presence =
      'present'
        ::public.allergen_presence
  )
  or
  (
    detected_present = false
    and manual_presence is not null
    and presence =
      manual_presence
  )
);



-- =========================================================
-- SYNCHRONIZE AUTOMATIC RECIPE ALLERGENS
-- =========================================================
--
-- Recalculates deterministic allergens from the recipe's
-- current ingredient names.
--
-- Known ingredient:
--
--   ingredient name
--       ↓
--   resolve_food_catalog_item()
--       ↓
--   food_item
--       ↓
--   food_allergens
--       ↓
--   recipe_allergens
--
-- Unknown ingredients are intentionally ignored here.
--
-- They remain UNKNOWN and can later be proposed to the food
-- catalog through the controlled suggestion workflow.
--
-- Manual allergen information is NEVER discarded.
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

    null,

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
  --
  -- Rows which still contain manual information survive.
  -- Their effective presence returns to manual_presence.
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
-- REPLACE RECIPE INGREDIENTS
-- =========================================================
--
-- This replaces the old admin-only implementation.
--
-- New behavior:
--
--   - admins can edit any recipe
--   - users can edit only their own draft
--   - pending_review is locked
--   - published recipes are locked for normal users
--
-- SECURITY DEFINER allows the controlled function to modify
-- ingredient tables without granting users unrestricted
-- direct table access.
--
-- Ingredient and group positions come from JSON array order
-- rather than trusting client-provided positions.
--
-- After replacing the ingredients, automatic allergens are
-- synchronized.
-- =========================================================

create or replace function
public.replace_recipe_ingredients(
  p_recipe_id uuid,
  p_groups jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_groups jsonb;

  group_item jsonb;
  group_position integer;
  group_name text;

  ingredient_items jsonb;
  ingredient_item jsonb;
  ingredient_position integer;

  ingredient_name text;

  new_group_id uuid;
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
  -- NORMALIZE GROUP CONTAINER
  -- =======================================================

  v_groups :=
    coalesce(
      p_groups,
      '[]'::jsonb
    );


  if jsonb_typeof(
    v_groups
  ) <> 'array' then

    raise exception
      'Recipe ingredient groups must be a JSON array'
      using errcode = '22023';

  end if;


  -- =======================================================
  -- REMOVE PREVIOUS GROUPS
  --
  -- Ingredients disappear automatically through
  -- ON DELETE CASCADE.
  -- =======================================================

  delete from public.ingredient_groups
  where recipe_id =
    p_recipe_id;


  -- =======================================================
  -- CREATE GROUPS
  -- =======================================================

  for
    group_item,
    group_position
  in

    select
      item.value,
      (
        item.ordinality - 1
      )::integer

    from jsonb_array_elements(
      v_groups
    )
    with ordinality
      as item(
        value,
        ordinality
      )

  loop

    -- -----------------------------------------------------
    -- GROUP MUST BE AN OBJECT
    -- -----------------------------------------------------

    if jsonb_typeof(
      group_item
    ) <> 'object' then

      raise exception
        'Each ingredient group must be a JSON object'
        using errcode = '22023';

    end if;


    -- -----------------------------------------------------
    -- GROUP NAME
    -- -----------------------------------------------------

    group_name :=
      btrim(
        coalesce(
          group_item ->> 'name',
          ''
        )
      );


    if
      char_length(
        group_name
      ) < 1

      or char_length(
        group_name
      ) > 100
    then

      raise exception
        'Ingredient group name must contain between 1 and 100 characters'
        using errcode = '22023';

    end if;


    -- -----------------------------------------------------
    -- INGREDIENT ARRAY
    -- -----------------------------------------------------

    ingredient_items :=
      coalesce(
        group_item
          -> 'ingredients',
        '[]'::jsonb
      );


    if jsonb_typeof(
      ingredient_items
    ) <> 'array' then

      raise exception
        'Ingredients must be a JSON array'
        using errcode = '22023';

    end if;


    -- -----------------------------------------------------
    -- INSERT GROUP
    -- -----------------------------------------------------

    insert into public.ingredient_groups (
      recipe_id,
      name,
      position
    )
    values (
      p_recipe_id,
      group_name,
      group_position
    )
    returning id
    into new_group_id;


    -- =====================================================
    -- CREATE INGREDIENTS
    -- =====================================================

    for
      ingredient_item,
      ingredient_position
    in

      select
        item.value,
        (
          item.ordinality - 1
        )::integer

      from jsonb_array_elements(
        ingredient_items
      )
      with ordinality
        as item(
          value,
          ordinality
        )

    loop

      -- ---------------------------------------------------
      -- INGREDIENT MUST BE AN OBJECT
      -- ---------------------------------------------------

      if jsonb_typeof(
        ingredient_item
      ) <> 'object' then

        raise exception
          'Each ingredient must be a JSON object'
          using errcode = '22023';

      end if;


      -- ---------------------------------------------------
      -- INGREDIENT NAME
      -- ---------------------------------------------------

      ingredient_name :=
        btrim(
          coalesce(
            ingredient_item ->> 'name',
            ''
          )
        );


      if
        char_length(
          ingredient_name
        ) < 1

        or char_length(
          ingredient_name
        ) > 120
      then

        raise exception
          'Ingredient name must contain between 1 and 120 characters'
          using errcode = '22023';

      end if;


      -- ---------------------------------------------------
      -- INSERT INGREDIENT
      -- ---------------------------------------------------

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

        ingredient_name,

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
          btrim(
            coalesce(
              ingredient_item
                ->> 'unit',
              ''
            )
          ),
          ''
        ),

        nullif(
          btrim(
            coalesce(
              ingredient_item
                ->> 'notes',
              ''
            )
          ),
          ''
        ),

        coalesce(
          (
            ingredient_item
              ->> 'scalable'
          )::boolean,
          true
        ),

        ingredient_position
      );

    end loop;

  end loop;


  -- =======================================================
  -- AUTOMATIC ALLERGEN SYNCHRONIZATION
  -- =======================================================

  perform
    public.sync_recipe_automatic_allergens(
      p_recipe_id
    );

end;
$$;



-- =========================================================
-- REPLACE MANUAL RECIPE ALLERGENS
-- =========================================================
--
-- Manual information and automatic information are now two
-- independent evidence layers.
--
-- Replacing manual allergens therefore must NOT delete
-- automatically detected allergens.
--
-- Automatically detected "present" always wins over manual
-- "possible".
-- =========================================================

create or replace function
public.replace_recipe_allergens(
  p_recipe_id uuid,
  p_allergens jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_allergens jsonb;

  allergen_item jsonb;

  v_allergen_id uuid;
  v_presence
    public.allergen_presence;
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
  -- NORMALIZE CONTAINER
  -- =======================================================

  v_allergens :=
    coalesce(
      p_allergens,
      '[]'::jsonb
    );


  if jsonb_typeof(
    v_allergens
  ) <> 'array' then

    raise exception
      'Recipe allergens must be a JSON array'
      using errcode = '22023';

  end if;


  -- =======================================================
  -- REMOVE PREVIOUS PURELY MANUAL ROWS
  -- =======================================================

  delete from public.recipe_allergens
  where recipe_id =
    p_recipe_id

    and detected_present =
      false;


  -- =======================================================
  -- CLEAR MANUAL EVIDENCE FROM AUTOMATIC ROWS
  --
  -- Automatic evidence survives.
  -- =======================================================

  update public.recipe_allergens
  set manual_presence =
    null
  where recipe_id =
    p_recipe_id

    and detected_present =
      true;


  -- =======================================================
  -- APPLY CURRENT MANUAL INFORMATION
  -- =======================================================

  for allergen_item in

    select value
    from jsonb_array_elements(
      v_allergens
    )

  loop

    if jsonb_typeof(
      allergen_item
    ) <> 'object' then

      raise exception
        'Each recipe allergen must be a JSON object'
        using errcode = '22023';

    end if;


    v_allergen_id :=
      (
        allergen_item
          ->> 'allergenId'
      )::uuid;


    v_presence :=
      (
        allergen_item
          ->> 'presence'
      )::public.allergen_presence;


    insert into public.recipe_allergens (
      recipe_id,
      allergen_id,
      presence,
      manual_presence,
      detected_present
    )
    values (
      p_recipe_id,
      v_allergen_id,
      v_presence,
      v_presence,
      false
    )

    on conflict (
      recipe_id,
      allergen_id
    )

    do update
    set
      manual_presence =
        excluded.manual_presence,

      presence =
        case

          when
            public.recipe_allergens
              .detected_present =
              true

          then
            'present'
              ::public.allergen_presence

          else
            excluded.manual_presence

        end;

  end loop;

end;
$$;



-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================


-- ---------------------------------------------------------
-- AUTOMATIC ALLERGEN SYNC
-- ---------------------------------------------------------

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



-- ---------------------------------------------------------
-- REPLACE INGREDIENTS
-- ---------------------------------------------------------

revoke all
on function
public.replace_recipe_ingredients(
  uuid,
  jsonb
)
from public;


revoke all
on function
public.replace_recipe_ingredients(
  uuid,
  jsonb
)
from anon;


grant execute
on function
public.replace_recipe_ingredients(
  uuid,
  jsonb
)
to authenticated;



-- ---------------------------------------------------------
-- REPLACE MANUAL ALLERGENS
-- ---------------------------------------------------------

revoke all
on function
public.replace_recipe_allergens(
  uuid,
  jsonb
)
from public;


revoke all
on function
public.replace_recipe_allergens(
  uuid,
  jsonb
)
from anon;


grant execute
on function
public.replace_recipe_allergens(
  uuid,
  jsonb
)
to authenticated;
