-- =========================================================
-- CociHub
-- Food catalog administration foundation
-- =========================================================
--
-- This migration prepares the existing deterministic food
-- catalog for safe administration from the CociHub backoffice.
--
-- Existing model:
--
--   food_items
--       ↓
--   food_aliases
--       ↓
--   food_allergens
--       ↓
--   recipe_allergens
--
-- Main goals:
--
--   1. Distinguish a catalog item whose allergen mapping has
--      been explicitly reviewed from one that still needs
--      review.
--
--   2. Provide one atomic admin operation for creating or
--      editing a canonical food, its aliases and its
--      deterministic allergens.
--
--   3. Recalculate automatic recipe allergens after catalog
--      changes so existing recipes never require manual
--      re-saving merely to receive updated catalog knowledge.
--
-- Safety rule:
--
--   zero food_allergens rows does NOT automatically mean
--   "unreviewed".
--
--   An administrator can explicitly mark a food as reviewed
--   with zero deterministic regulated allergens.
-- =========================================================


alter table public.food_items
add column if not exists
  updated_at timestamptz
  not null
  default now();


alter table public.food_items
add column if not exists
  allergen_reviewed_at timestamptz;


alter table public.food_items
add column if not exists
  allergen_reviewed_by uuid
  references public.profiles(id)
  on delete set null;


create index if not exists
food_items_allergen_review_pending_idx
on public.food_items(
  allergen_reviewed_at
)
where allergen_reviewed_at is null;


update public.food_items
  as food
set allergen_reviewed_at = now()
where food.allergen_reviewed_at is null
  and exists (
    select 1
    from public.food_allergens
      as food_allergen
    where food_allergen.food_item_id =
      food.id
  );


create or replace function
public.admin_refresh_all_recipe_automatic_allergens()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipe_row record;
  refreshed_count integer := 0;
begin
  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;

  for recipe_row in
    select recipe.id
    from public.recipes
      as recipe
    order by recipe.id
  loop
    perform
      public.sync_recipe_automatic_allergens(
        recipe_row.id
      );

    refreshed_count :=
      refreshed_count + 1;
  end loop;

  return
    refreshed_count;
end;
$$;


create or replace function
public.admin_save_food_catalog_item(
  p_name text,
  p_slug text,
  p_aliases jsonb,
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
  v_user_id uuid;
  v_food_item_id uuid;
  v_name text;
  v_slug text;
  v_normalized_name text;
  v_aliases jsonb;
  v_allergen_ids uuid[];
  v_alias_count integer;
  v_distinct_alias_count integer;
begin
  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;

  v_name :=
    nullif(
      btrim(
        p_name
      ),
      ''
    );

  if v_name is null then
    raise exception
      'Food name is required'
      using errcode = '22023';
  end if;

  if char_length(
    v_name
  ) > 120 then
    raise exception
      'Food name is too long'
      using errcode = '22023';
  end if;

  v_slug :=
    nullif(
      btrim(
        p_slug
      ),
      ''
    );

  if v_slug is null then
    raise exception
      'Food slug is required'
      using errcode = '22023';
  end if;

  if char_length(
    v_slug
  ) > 140 then
    raise exception
      'Food slug is too long'
      using errcode = '22023';
  end if;

  v_normalized_name :=
    public.normalize_food_term(
      v_name
    );

  v_aliases :=
    coalesce(
      p_aliases,
      '[]'::jsonb
    );

  v_allergen_ids :=
    coalesce(
      p_allergen_ids,
      array[]::uuid[]
    );

  if jsonb_typeof(
    v_aliases
  ) <> 'array' then
    raise exception
      'Food aliases must be a JSON array'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(
      v_aliases
    ) as alias_item
    where jsonb_typeof(
      alias_item.value
    ) <> 'string'
  ) then
    raise exception
      'Every food alias must be a string'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(
      v_aliases
    ) as alias_item(
      value
    )
    where nullif(
      btrim(
        alias_item.value
      ),
      ''
    ) is null
      or char_length(
        btrim(
          alias_item.value
        )
      ) > 160
  ) then
    raise exception
      'Food aliases must contain between 1 and 160 characters'
      using errcode = '22023';
  end if;

  select
    count(*),
    count(
      distinct
      public.normalize_food_term(
        alias_item.value
      )
    )
  into
    v_alias_count,
    v_distinct_alias_count
  from jsonb_array_elements_text(
    v_aliases
  ) as alias_item(
    value
  );

  if v_alias_count <>
    v_distinct_alias_count
  then
    raise exception
      'Food aliases contain duplicates'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(
      v_aliases
    ) as alias_item(
      value
    )
    where public.normalize_food_term(
      alias_item.value
    ) =
      v_normalized_name
  ) then
    raise exception
      'A food alias cannot duplicate its canonical name'
      using errcode = '23505';
  end if;

  if p_food_item_id is not null then
    perform 1
    from public.food_items
      as food
    where food.id =
      p_food_item_id;

    if not found then
      raise exception
        'Food item not found'
        using errcode = 'P0002';
    end if;
  end if;

  if exists (
    select 1
    from public.food_items
      as food
    where food.normalized_name =
      v_normalized_name
      and (
        p_food_item_id is null
        or food.id <>
          p_food_item_id
      )
  ) then
    raise exception
      'Food canonical name already exists'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.food_items
      as food
    where food.slug =
      v_slug
      and (
        p_food_item_id is null
        or food.id <>
          p_food_item_id
      )
  ) then
    raise exception
      'Food slug already exists'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from public.food_aliases
      as food_alias
    where food_alias.normalized_alias =
      v_normalized_name
      and (
        p_food_item_id is null
        or food_alias.food_item_id <>
          p_food_item_id
      )
  ) then
    raise exception
      'Food canonical name conflicts with an existing alias'
      using errcode = '23505';
  end if;

  if p_food_item_id is null then
    insert into public.food_items (
      name,
      slug,
      is_active,
      updated_at,
      allergen_reviewed_at,
      allergen_reviewed_by
    )
    values (
      v_name,
      v_slug,
      coalesce(
        p_is_active,
        true
      ),
      now(),
      case
        when p_mark_allergens_reviewed
          then now()
        else null
      end,
      case
        when p_mark_allergens_reviewed
          then v_user_id
        else null
      end
    )
    returning id
    into v_food_item_id;
  else
    update public.food_items
      as food
    set
      name =
        v_name,
      slug =
        v_slug,
      is_active =
        coalesce(
          p_is_active,
          true
        ),
      updated_at =
        now(),
      allergen_reviewed_at =
        case
          when p_mark_allergens_reviewed
            then now()
          else null
        end,
      allergen_reviewed_by =
        case
          when p_mark_allergens_reviewed
            then v_user_id
          else null
        end
    where food.id =
      p_food_item_id
    returning food.id
    into v_food_item_id;
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(
      v_aliases
    ) as alias_item(
      value
    )
    join public.food_items
      as food
      on food.normalized_name =
        public.normalize_food_term(
          alias_item.value
        )
    where food.id <>
      v_food_item_id
  ) then
    raise exception
      'Food alias conflicts with another canonical food'
      using errcode = '23505';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(
      v_aliases
    ) as alias_item(
      value
    )
    join public.food_aliases
      as food_alias
      on food_alias.normalized_alias =
        public.normalize_food_term(
          alias_item.value
        )
    where food_alias.food_item_id <>
      v_food_item_id
  ) then
    raise exception
      'Food alias already belongs to another food'
      using errcode = '23505';
  end if;

  delete from public.food_aliases
  where food_item_id =
    v_food_item_id;

  insert into public.food_aliases (
    food_item_id,
    alias
  )
  select
    v_food_item_id,
    btrim(
      alias_item.value
    )
  from jsonb_array_elements_text(
    v_aliases
  ) as alias_item(
    value
  );

  if exists (
    select 1
    from unnest(
      v_allergen_ids
    ) as requested(
      allergen_id
    )
    left join public.allergens
      as allergen
      on allergen.id =
        requested.allergen_id
    where allergen.id
      is null
  ) then
    raise exception
      'One or more allergens do not exist'
      using errcode = '22023';
  end if;

  delete from public.food_allergens
  where food_item_id =
    v_food_item_id;

  insert into public.food_allergens (
    food_item_id,
    allergen_id
  )
  select
    v_food_item_id,
    requested.allergen_id
  from (
    select distinct
      allergen_row.allergen_id
    from unnest(
      v_allergen_ids
    ) as allergen_row(
      allergen_id
    )
  ) as requested;

  perform
    public.admin_refresh_all_recipe_automatic_allergens();

  return
    v_food_item_id;
end;
$$;


revoke all
on function
public.admin_refresh_all_recipe_automatic_allergens()
from public;

revoke all
on function
public.admin_refresh_all_recipe_automatic_allergens()
from anon;

grant execute
on function
public.admin_refresh_all_recipe_automatic_allergens()
to authenticated;


revoke all
on function
public.admin_save_food_catalog_item(
  text,
  text,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from public;

revoke all
on function
public.admin_save_food_catalog_item(
  text,
  text,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
from anon;

grant execute
on function
public.admin_save_food_catalog_item(
  text,
  text,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
to authenticated;


comment on column
public.food_items.allergen_reviewed_at
is
  'Timestamp of the latest explicit administrative review of this canonical food deterministic allergen mapping. NULL means review is pending.';


comment on column
public.food_items.allergen_reviewed_by
is
  'Administrator profile that last explicitly reviewed this canonical food deterministic allergen mapping.';


comment on function
public.admin_refresh_all_recipe_automatic_allergens()
is
  'Admin-only full refresh of deterministic automatic recipe allergens after food catalog changes.';


comment on function
public.admin_save_food_catalog_item(
  text,
  text,
  jsonb,
  uuid[],
  uuid,
  boolean,
  boolean
)
is
  'Admin-only atomic create/update of a canonical food, aliases, deterministic allergens and review state, followed by recipe allergen resynchronization.';
