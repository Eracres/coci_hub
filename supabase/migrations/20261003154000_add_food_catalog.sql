-- =========================================================
-- CociHub
-- Add deterministic food catalog foundation
-- =========================================================
--
-- This migration introduces the global food knowledge layer
-- used by CociHub.
--
-- IMPORTANT:
--
-- public.ingredients
--   represents an ingredient belonging to a specific recipe.
--
-- public.food_items
--   represents a canonical food known globally by CociHub.
--
-- Example:
--
--   recipe ingredient:
--     "Parmesano rallado"
--
--   canonical food:
--     "Queso parmesano"
--
--   allergen relation:
--     "Leche"
--
-- Community users cannot modify the catalog directly.
-- They can only submit suggestions for administrator review.
-- =========================================================



-- =========================================================
-- NORMALIZE FOOD TERM
-- =========================================================
--
-- First normalization version:
--
--   - trims surrounding whitespace
--   - converts text to lowercase
--   - collapses repeated whitespace
--
-- It intentionally DOES NOT perform fuzzy matching,
-- remove accents or make substring assumptions.
--
-- Example:
--
--   "  Queso   Parmesano "
--
-- becomes:
--
--   "queso parmesano"
--
-- Conservative matching is intentional because false
-- positives are especially undesirable for allergen data.
-- =========================================================

create or replace function public.normalize_food_term(
  p_value text
)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select regexp_replace(
    lower(
      btrim(
        p_value
      )
    ),
    '[[:space:]]+',
    ' ',
    'g'
  );
$$;


revoke all
on function public.normalize_food_term(
  text
)
from public;


revoke all
on function public.normalize_food_term(
  text
)
from anon;


grant execute
on function public.normalize_food_term(
  text
)
to authenticated;



-- =========================================================
-- FOOD ITEMS
-- =========================================================
--
-- Canonical foods known by CociHub.
--
-- Examples:
--
--   Queso parmesano
--   Huevo
--   Harina de trigo
--   Gamba
--
-- These records are global and are NOT tied to one recipe.
-- =========================================================

create table if not exists public.food_items (
  id uuid
    primary key
    default gen_random_uuid(),

  name varchar(120)
    not null,

  normalized_name text
    generated always as (
      public.normalize_food_term(
        name
      )
    )
    stored,

  slug varchar(140)
    not null,

  is_active boolean
    not null
    default true,

  created_at timestamptz
    not null
    default now(),

  constraint food_items_name_not_blank_check
    check (
      btrim(name) <> ''
    ),

  constraint food_items_slug_not_blank_check
    check (
      btrim(slug) <> ''
    )
);


create unique index if not exists
food_items_normalized_name_unique_idx
on public.food_items(
  normalized_name
);


create unique index if not exists
food_items_slug_unique_idx
on public.food_items(
  slug
);


create index if not exists
food_items_active_idx
on public.food_items(
  is_active
);



-- =========================================================
-- FOOD ALIASES
-- =========================================================
--
-- One canonical food can have several recognized names.
--
-- Example:
--
-- food item:
--   Queso parmesano
--
-- aliases:
--   parmesano
--   queso parmesano
--   parmigiano
--   parmigiano reggiano
--
-- normalized_alias is globally unique.
--
-- This means one exact normalized alias can point to only
-- one canonical food, preventing ambiguous automatic
-- allergen classifications.
-- =========================================================

create table if not exists public.food_aliases (
  id uuid
    primary key
    default gen_random_uuid(),

  food_item_id uuid
    not null
    references public.food_items(id)
    on delete cascade,

  alias varchar(160)
    not null,

  normalized_alias text
    generated always as (
      public.normalize_food_term(
        alias
      )
    )
    stored,

  created_at timestamptz
    not null
    default now(),

  constraint food_aliases_alias_not_blank_check
    check (
      btrim(alias) <> ''
    )
);


create unique index if not exists
food_aliases_normalized_alias_unique_idx
on public.food_aliases(
  normalized_alias
);


create index if not exists
food_aliases_food_item_id_idx
on public.food_aliases(
  food_item_id
);



-- =========================================================
-- FOOD ALLERGENS
-- =========================================================
--
-- Deterministic relation between a canonical food and an
-- allergen already present in public.allergens.
--
-- Example:
--
--   Queso parmesano
--          ↓
--        Leche
--
-- These relations mean that the food CONTAINS the allergen.
--
-- "possible" / traces are intentionally NOT represented
-- here because those normally depend on a specific product,
-- manufacturer or cross-contamination information.
-- =========================================================

create table if not exists public.food_allergens (
  food_item_id uuid
    not null
    references public.food_items(id)
    on delete cascade,

  allergen_id uuid
    not null
    references public.allergens(id)
    on delete cascade,

  created_at timestamptz
    not null
    default now(),

  primary key (
    food_item_id,
    allergen_id
  )
);


create index if not exists
food_allergens_allergen_id_idx
on public.food_allergens(
  allergen_id
);



-- =========================================================
-- FOOD CATALOG SUGGESTION STATUS
-- =========================================================

do $$
begin

  if not exists (
    select 1
    from pg_type as t
    join pg_namespace as n
      on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname =
        'food_catalog_suggestion_status'
  ) then

    create type
      public.food_catalog_suggestion_status
    as enum (
      'pending',
      'approved',
      'rejected'
    );

  end if;

end
$$;



-- =========================================================
-- FOOD CATALOG SUGGESTIONS
-- =========================================================
--
-- Community users do NOT modify food_items directly.
--
-- Instead they may propose an unknown food.
--
-- An administrator will later decide whether to:
--
--   - approve it
--   - reject it
--   - associate it with an existing food as an alias
--
-- proposed_by uses ON DELETE SET NULL so the suggestion
-- remains available even if the user account disappears.
-- =========================================================

create table if not exists
public.food_catalog_suggestions (
  id uuid
    primary key
    default gen_random_uuid(),

  proposed_by uuid
    references public.profiles(id)
    on delete set null,

  proposed_name varchar(120)
    not null,

  normalized_name text
    generated always as (
      public.normalize_food_term(
        proposed_name
      )
    )
    stored,

  notes text,

  status
    public.food_catalog_suggestion_status
    not null
    default 'pending',

  reviewed_by uuid
    references public.profiles(id)
    on delete set null,

  reviewed_at timestamptz,

  review_notes text,

  created_food_item_id uuid
    references public.food_items(id)
    on delete set null,

  created_at timestamptz
    not null
    default now(),

  constraint food_catalog_suggestions_name_not_blank_check
    check (
      btrim(proposed_name) <> ''
    ),

  constraint food_catalog_suggestions_notes_length_check
    check (
      notes is null
      or char_length(notes) <= 1000
    ),

  constraint food_catalog_suggestions_review_notes_length_check
    check (
      review_notes is null
      or char_length(review_notes) <= 1500
    )
);


create index if not exists
food_catalog_suggestions_proposed_by_idx
on public.food_catalog_suggestions(
  proposed_by
);


create index if not exists
food_catalog_suggestions_status_idx
on public.food_catalog_suggestions(
  status
);


create index if not exists
food_catalog_suggestions_normalized_name_idx
on public.food_catalog_suggestions(
  normalized_name
);



-- =========================================================
-- ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.food_items
enable row level security;


alter table public.food_aliases
enable row level security;


alter table public.food_allergens
enable row level security;


alter table public.food_catalog_suggestions
enable row level security;



-- =========================================================
-- TABLE PRIVILEGES
-- =========================================================
--
-- PostgreSQL table privileges are the first gate.
-- RLS policies are the second gate.
--
-- authenticated needs write privileges on catalog tables
-- because administrators also use the authenticated role.
--
-- RLS will decide whether the current authenticated user
-- is actually an administrator.
-- =========================================================

revoke all
on table public.food_items
from public;


revoke all
on table public.food_items
from anon;


revoke all
on table public.food_items
from authenticated;


grant
  select,
  insert,
  update,
  delete
on table public.food_items
to authenticated;



revoke all
on table public.food_aliases
from public;


revoke all
on table public.food_aliases
from anon;


revoke all
on table public.food_aliases
from authenticated;


grant
  select,
  insert,
  update,
  delete
on table public.food_aliases
to authenticated;



revoke all
on table public.food_allergens
from public;


revoke all
on table public.food_allergens
from anon;


revoke all
on table public.food_allergens
from authenticated;


grant
  select,
  insert,
  update,
  delete
on table public.food_allergens
to authenticated;



revoke all
on table public.food_catalog_suggestions
from public;


revoke all
on table public.food_catalog_suggestions
from anon;


revoke all
on table public.food_catalog_suggestions
from authenticated;


grant
  select,
  insert,
  update,
  delete
on table public.food_catalog_suggestions
to authenticated;



-- =========================================================
-- FOOD ITEMS RLS
-- =========================================================

drop policy if exists
  "Authenticated users can read food items"
on public.food_items;


create policy
  "Authenticated users can read food items"
on public.food_items
for select
to authenticated
using (
  true
);


drop policy if exists
  "Admins can insert food items"
on public.food_items;


create policy
  "Admins can insert food items"
on public.food_items
for insert
to authenticated
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can update food items"
on public.food_items;


create policy
  "Admins can update food items"
on public.food_items
for update
to authenticated
using (
  (
    select public.is_admin()
  )
)
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can delete food items"
on public.food_items;


create policy
  "Admins can delete food items"
on public.food_items
for delete
to authenticated
using (
  (
    select public.is_admin()
  )
);



-- =========================================================
-- FOOD ALIASES RLS
-- =========================================================

drop policy if exists
  "Authenticated users can read food aliases"
on public.food_aliases;


create policy
  "Authenticated users can read food aliases"
on public.food_aliases
for select
to authenticated
using (
  true
);


drop policy if exists
  "Admins can insert food aliases"
on public.food_aliases;


create policy
  "Admins can insert food aliases"
on public.food_aliases
for insert
to authenticated
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can update food aliases"
on public.food_aliases;


create policy
  "Admins can update food aliases"
on public.food_aliases
for update
to authenticated
using (
  (
    select public.is_admin()
  )
)
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can delete food aliases"
on public.food_aliases;


create policy
  "Admins can delete food aliases"
on public.food_aliases
for delete
to authenticated
using (
  (
    select public.is_admin()
  )
);



-- =========================================================
-- FOOD ALLERGENS RLS
-- =========================================================

drop policy if exists
  "Authenticated users can read food allergens"
on public.food_allergens;


create policy
  "Authenticated users can read food allergens"
on public.food_allergens
for select
to authenticated
using (
  true
);


drop policy if exists
  "Admins can insert food allergens"
on public.food_allergens;


create policy
  "Admins can insert food allergens"
on public.food_allergens
for insert
to authenticated
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can delete food allergens"
on public.food_allergens;


create policy
  "Admins can delete food allergens"
on public.food_allergens
for delete
to authenticated
using (
  (
    select public.is_admin()
  )
);



-- =========================================================
-- FOOD CATALOG SUGGESTIONS RLS
-- =========================================================
--
-- Users can see their own suggestions.
--
-- Administrators can see every suggestion.
--
-- Community insertion itself will be performed through a
-- controlled SECURITY DEFINER RPC created below.
-- =========================================================

drop policy if exists
  "Users can read own food catalog suggestions"
on public.food_catalog_suggestions;


create policy
  "Users can read own food catalog suggestions"
on public.food_catalog_suggestions
for select
to authenticated
using (
  proposed_by = (
    select auth.uid()
  )
  or (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can insert food catalog suggestions"
on public.food_catalog_suggestions;


create policy
  "Admins can insert food catalog suggestions"
on public.food_catalog_suggestions
for insert
to authenticated
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can update food catalog suggestions"
on public.food_catalog_suggestions;


create policy
  "Admins can update food catalog suggestions"
on public.food_catalog_suggestions
for update
to authenticated
using (
  (
    select public.is_admin()
  )
)
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can delete food catalog suggestions"
on public.food_catalog_suggestions;


create policy
  "Admins can delete food catalog suggestions"
on public.food_catalog_suggestions
for delete
to authenticated
using (
  (
    select public.is_admin()
  )
);



-- =========================================================
-- SUBMIT FOOD CATALOG SUGGESTION
-- =========================================================
--
-- Community users must not directly insert arbitrary rows
-- into food_catalog_suggestions.
--
-- This RPC controls:
--
--   - proposed_by
--   - status
--   - moderation metadata
--
-- The caller can only supply:
--
--   - proposed food name
--   - optional notes
-- =========================================================

create or replace function
public.submit_food_catalog_suggestion(
  p_proposed_name text,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_name text;
  v_normalized_name text;
  v_suggestion_id uuid;
begin

  -- -------------------------------------------------------
  -- AUTHENTICATION
  -- -------------------------------------------------------

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  -- -------------------------------------------------------
  -- NORMALIZE INPUT
  -- -------------------------------------------------------

  v_name :=
    nullif(
      btrim(
        p_proposed_name
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


  if p_notes is not null
    and char_length(
      p_notes
    ) > 1000 then
    raise exception
      'Suggestion notes are too long'
      using errcode = '22023';
  end if;


  v_normalized_name :=
    public.normalize_food_term(
      v_name
    );


  -- -------------------------------------------------------
  -- ALREADY KNOWN AS CANONICAL FOOD
  -- -------------------------------------------------------

  if exists (
    select 1
    from public.food_items as food
    where food.normalized_name =
      v_normalized_name
  ) then

    raise exception
      'Food already exists in catalog'
      using errcode = '23505';

  end if;


  -- -------------------------------------------------------
  -- ALREADY KNOWN AS ALIAS
  -- -------------------------------------------------------

  if exists (
    select 1
    from public.food_aliases as food_alias
    where food_alias.normalized_alias =
      v_normalized_name
  ) then

    raise exception
      'Food already exists as catalog alias'
      using errcode = '23505';

  end if;


  -- -------------------------------------------------------
  -- PENDING SUGGESTION ALREADY EXISTS
  -- -------------------------------------------------------

  if exists (
    select 1
    from public.food_catalog_suggestions
      as suggestion
    where suggestion.normalized_name =
      v_normalized_name
      and suggestion.status =
        'pending'
          ::public.food_catalog_suggestion_status
  ) then

    raise exception
      'Food suggestion is already pending'
      using errcode = '23505';

  end if;


  -- -------------------------------------------------------
  -- CREATE CONTROLLED SUGGESTION
  -- -------------------------------------------------------

  insert into public.food_catalog_suggestions (
    proposed_by,
    proposed_name,
    notes,
    status,
    reviewed_by,
    reviewed_at,
    review_notes,
    created_food_item_id
  )
  values (
    v_user_id,
    v_name,
    nullif(
      btrim(
        p_notes
      ),
      ''
    ),
    'pending'
      ::public.food_catalog_suggestion_status,
    null,
    null,
    null,
    null
  )
  returning id
  into v_suggestion_id;


  return
    v_suggestion_id;

end;
$$;



-- =========================================================
-- RPC PERMISSIONS
-- =========================================================

revoke all
on function
public.submit_food_catalog_suggestion(
  text,
  text
)
from public;


revoke all
on function
public.submit_food_catalog_suggestion(
  text,
  text
)
from anon;


grant execute
on function
public.submit_food_catalog_suggestion(
  text,
  text
)
to authenticated;
