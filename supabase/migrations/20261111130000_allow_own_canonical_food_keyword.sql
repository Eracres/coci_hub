-- =========================================================
-- CociHub
-- Allow own canonical name as a safe food keyword
-- =========================================================
--
-- The previous admin RPC rejects a keyword when it matches
-- the canonical name of the same food.
--
-- That prevents valid deterministic cases such as:
--
--   canonical: Mascarpone
--   keyword:   mascarpone
--
-- Exact matching still resolves "Mascarpone" first.
-- The keyword is needed for longer ingredient descriptions
-- such as "queso mascarpone para tiramisú".
--
-- We preserve the existing implementation as an internal
-- core function and expose a wrapper with the original RPC
-- name/signature.
-- =========================================================


-- =========================================================
-- RENAME CURRENT IMPLEMENTATION
-- =========================================================

alter function
public.admin_save_food_catalog_item_with_keywords(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
rename to
admin_save_food_catalog_item_with_keywords_core;



-- =========================================================
-- INTERNAL CORE PERMISSIONS
-- =========================================================

revoke all
on function
public.admin_save_food_catalog_item_with_keywords_core(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from public;


revoke all
on function
public.admin_save_food_catalog_item_with_keywords_core(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from anon;


revoke all
on function
public.admin_save_food_catalog_item_with_keywords_core(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from authenticated;



-- =========================================================
-- PUBLIC ADMIN WRAPPER
-- =========================================================

create function
public.admin_save_food_catalog_item_with_keywords(
  p_name text,
  p_slug text,
  p_aliases jsonb,
  p_keywords jsonb,
  p_allergen_ids uuid[],
  p_food_item_id uuid default null,
  p_is_active boolean default true,
  p_mark_allergens_reviewed boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_food_item_id uuid;

  v_keywords jsonb;

  v_filtered_keywords jsonb;

  v_canonical_keyword_count integer;

  v_canonical_keyword text;
begin

  -- =======================================================
  -- PRESERVE ORIGINAL VALIDATION FOR INVALID JSON
  -- =======================================================

  if p_keywords is not null
    and jsonb_typeof(
      p_keywords
    ) <> 'array'
  then
    return
      public.admin_save_food_catalog_item_with_keywords_core(
        p_name,
        p_slug,
        p_aliases,
        p_keywords,
        p_allergen_ids,
        p_food_item_id,
        p_is_active,
        p_mark_allergens_reviewed
      );
  end if;


  v_keywords :=
    coalesce(
      p_keywords,
      '[]'::jsonb
    );


  -- =======================================================
  -- COUNT OWN CANONICAL KEYWORD
  -- =======================================================

  select
    count(*),

    min(
      btrim(
        keyword_item.value #>> '{}'
      )
    )

  into
    v_canonical_keyword_count,
    v_canonical_keyword

  from jsonb_array_elements(
    v_keywords
  ) as keyword_item(
    value
  )

  where jsonb_typeof(
    keyword_item.value
  ) = 'string'

    and public.normalize_food_term(
      keyword_item.value #>> '{}'
    ) =
      public.normalize_food_term(
        p_name
      );


  -- =======================================================
  -- DO NOT BYPASS DUPLICATE VALIDATION
  -- =======================================================

  if v_canonical_keyword_count > 1 then
    raise exception
      'Food keywords contain duplicates'
      using errcode = '23505';
  end if;


  -- =======================================================
  -- REMOVE ONLY OWN CANONICAL KEYWORD BEFORE CORE VALIDATION
  -- =======================================================

  select
    coalesce(
      jsonb_agg(
        keyword_item.value
      ),
      '[]'::jsonb
    )

  into
    v_filtered_keywords

  from jsonb_array_elements(
    v_keywords
  ) as keyword_item(
    value
  )

  where jsonb_typeof(
    keyword_item.value
  ) <> 'string'

    or public.normalize_food_term(
      keyword_item.value #>> '{}'
    ) <>
      public.normalize_food_term(
        p_name
      );


  -- =======================================================
  -- RUN EXISTING ADMIN LOGIC
  -- =======================================================

  v_food_item_id :=
    public.admin_save_food_catalog_item_with_keywords_core(
      p_name,
      p_slug,
      p_aliases,
      v_filtered_keywords,
      p_allergen_ids,
      p_food_item_id,
      p_is_active,
      p_mark_allergens_reviewed
    );


  -- =======================================================
  -- RESTORE OWN CANONICAL KEYWORD
  -- =======================================================

  if v_canonical_keyword_count = 1 then

    insert into public.food_keywords (
      food_item_id,
      keyword
    )
    values (
      v_food_item_id,
      v_canonical_keyword
    );


    -- The core refresh occurs before this keyword is restored,
    -- so refresh once more when this special case is used.

    perform
      public.admin_refresh_all_recipe_automatic_allergens();

  end if;


  return
    v_food_item_id;

end;
$$;



-- =========================================================
-- PUBLIC RPC PERMISSIONS
-- =========================================================

revoke all
on function
public.admin_save_food_catalog_item_with_keywords(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from public;


revoke all
on function
public.admin_save_food_catalog_item_with_keywords(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from anon;


grant execute
on function
public.admin_save_food_catalog_item_with_keywords(
  text,
  text,
  jsonb,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
to authenticated;
