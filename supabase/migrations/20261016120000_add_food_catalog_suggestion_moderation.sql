-- =========================================================
-- CociHub
-- Food catalog suggestion moderation
-- =========================================================
-- Adds explicit admin resolution for catalog suggestions:
--   - create a new canonical food
--   - resolve to an existing canonical food (adding alias)
--   - reject with moderation notes
-- =========================================================

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n
      on n.oid = t.typnamespace
    where n.nspname = 'public'
      and t.typname =
        'food_catalog_suggestion_resolution_type'
  ) then
    create type
      public.food_catalog_suggestion_resolution_type
    as enum (
      'created_food',
      'existing_food'
    );
  end if;
end
$$;


alter table public.food_catalog_suggestions
add column if not exists
  resolution_type
  public.food_catalog_suggestion_resolution_type;


alter table public.food_catalog_suggestions
add column if not exists
  resolved_food_item_id uuid
  references public.food_items(id)
  on delete set null;


create index if not exists
food_catalog_suggestions_resolved_food_item_idx
on public.food_catalog_suggestions(
  resolved_food_item_id
);


-- Existing approved suggestions that created a food keep their
-- original meaning while gaining the new generic resolution link.
update public.food_catalog_suggestions
set
  resolution_type =
    'created_food'
      ::public.food_catalog_suggestion_resolution_type,
  resolved_food_item_id =
    created_food_item_id
where status =
  'approved'
    ::public.food_catalog_suggestion_status
  and created_food_item_id is not null
  and resolution_type is null;



-- =========================================================
-- APPROVE AS NEW CANONICAL FOOD
-- =========================================================

create or replace function
public.admin_approve_food_catalog_suggestion_as_new(
  p_suggestion_id uuid,
  p_name text,
  p_slug text,
  p_aliases jsonb,
  p_allergen_ids uuid[],
  p_review_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_suggestion public.food_catalog_suggestions%rowtype;
  v_name text;
  v_aliases jsonb;
  v_food_item_id uuid;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;

  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;

  select *
  into v_suggestion
  from public.food_catalog_suggestions
  where id = p_suggestion_id
  for update;

  if not found then
    raise exception
      'Food catalog suggestion not found'
      using errcode = 'P0002';
  end if;

  if v_suggestion.status <>
    'pending'
      ::public.food_catalog_suggestion_status
  then
    raise exception
      'Food catalog suggestion is not pending'
      using errcode = '22023';
  end if;

  if p_review_notes is not null
    and char_length(p_review_notes) > 1500
  then
    raise exception
      'Review notes are too long'
      using errcode = '22023';
  end if;

  v_name :=
    coalesce(
      nullif(
        btrim(p_name),
        ''
      ),
      v_suggestion.proposed_name
    );

  v_aliases :=
    coalesce(
      p_aliases,
      '[]'::jsonb
    );

  if jsonb_typeof(v_aliases) <> 'array' then
    raise exception
      'Food aliases must be a JSON array'
      using errcode = '22023';
  end if;

  -- If the admin chooses a different canonical name, preserve
  -- the original community proposal as an exact alias.
  if public.normalize_food_term(v_name) <>
      v_suggestion.normalized_name
    and not exists (
      select 1
      from jsonb_array_elements_text(v_aliases)
        as alias_item(value)
      where public.normalize_food_term(alias_item.value) =
        v_suggestion.normalized_name
    )
  then
    v_aliases :=
      v_aliases ||
      jsonb_build_array(
        v_suggestion.proposed_name
      );
  end if;

  v_food_item_id :=
    public.admin_save_food_catalog_item(
      v_name,
      p_slug,
      v_aliases,
      p_allergen_ids,
      null,
      true,
      true
    );

  update public.food_catalog_suggestions
  set
    status =
      'approved'
        ::public.food_catalog_suggestion_status,
    reviewed_by =
      v_admin_id,
    reviewed_at =
      now(),
    review_notes =
      nullif(
        btrim(p_review_notes),
        ''
      ),
    created_food_item_id =
      v_food_item_id,
    resolved_food_item_id =
      v_food_item_id,
    resolution_type =
      'created_food'
        ::public.food_catalog_suggestion_resolution_type
  where id =
    p_suggestion_id;

  return v_food_item_id;
end;
$$;



-- =========================================================
-- APPROVE AGAINST EXISTING CANONICAL FOOD
-- =========================================================
-- The suggested term is added as an exact alias when needed.
-- =========================================================

create or replace function
public.admin_approve_food_catalog_suggestion_as_existing_food(
  p_suggestion_id uuid,
  p_food_item_id uuid,
  p_review_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_suggestion public.food_catalog_suggestions%rowtype;
  v_target_food public.food_items%rowtype;
  v_existing_food_id uuid;
  v_existing_alias_food_id uuid;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;

  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;

  select *
  into v_suggestion
  from public.food_catalog_suggestions
  where id = p_suggestion_id
  for update;

  if not found then
    raise exception
      'Food catalog suggestion not found'
      using errcode = 'P0002';
  end if;

  if v_suggestion.status <>
    'pending'
      ::public.food_catalog_suggestion_status
  then
    raise exception
      'Food catalog suggestion is not pending'
      using errcode = '22023';
  end if;

  if p_review_notes is not null
    and char_length(p_review_notes) > 1500
  then
    raise exception
      'Review notes are too long'
      using errcode = '22023';
  end if;

  select *
  into v_target_food
  from public.food_items
  where id = p_food_item_id
  for update;

  if not found then
    raise exception
      'Food item not found'
      using errcode = 'P0002';
  end if;

  if v_target_food.is_active <> true then
    raise exception
      'Food item must be active'
      using errcode = '22023';
  end if;

  select food.id
  into v_existing_food_id
  from public.food_items food
  where food.normalized_name =
    v_suggestion.normalized_name
  limit 1;

  if v_existing_food_id is not null
    and v_existing_food_id <> p_food_item_id
  then
    raise exception
      'Suggested food name already belongs to another canonical food'
      using errcode = '23505';
  end if;

  select food_alias.food_item_id
  into v_existing_alias_food_id
  from public.food_aliases food_alias
  where food_alias.normalized_alias =
    v_suggestion.normalized_name
  limit 1;

  if v_existing_alias_food_id is not null
    and v_existing_alias_food_id <> p_food_item_id
  then
    raise exception
      'Suggested food name already belongs to another food alias'
      using errcode = '23505';
  end if;

  if v_existing_food_id is null
    and v_existing_alias_food_id is null
  then
    insert into public.food_aliases (
      food_item_id,
      alias
    )
    values (
      p_food_item_id,
      v_suggestion.proposed_name
    );
  end if;

  update public.food_items
  set updated_at = now()
  where id = p_food_item_id;

  update public.food_catalog_suggestions
  set
    status =
      'approved'
        ::public.food_catalog_suggestion_status,
    reviewed_by =
      v_admin_id,
    reviewed_at =
      now(),
    review_notes =
      nullif(
        btrim(p_review_notes),
        ''
      ),
    created_food_item_id =
      null,
    resolved_food_item_id =
      p_food_item_id,
    resolution_type =
      'existing_food'
        ::public.food_catalog_suggestion_resolution_type
  where id =
    p_suggestion_id;

  perform
    public.admin_refresh_all_recipe_automatic_allergens();

  return p_food_item_id;
end;
$$;



-- =========================================================
-- REJECT
-- =========================================================

create or replace function
public.admin_reject_food_catalog_suggestion(
  p_suggestion_id uuid,
  p_review_notes text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_status public.food_catalog_suggestion_status;
  v_review_notes text;
begin
  v_admin_id := auth.uid();

  if v_admin_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;

  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;

  v_review_notes :=
    nullif(
      btrim(p_review_notes),
      ''
    );

  if v_review_notes is null then
    raise exception
      'Review notes are required when rejecting a suggestion'
      using errcode = '22023';
  end if;

  if char_length(v_review_notes) > 1500 then
    raise exception
      'Review notes are too long'
      using errcode = '22023';
  end if;

  select suggestion.status
  into v_status
  from public.food_catalog_suggestions suggestion
  where suggestion.id = p_suggestion_id
  for update;

  if not found then
    raise exception
      'Food catalog suggestion not found'
      using errcode = 'P0002';
  end if;

  if v_status <>
    'pending'
      ::public.food_catalog_suggestion_status
  then
    raise exception
      'Food catalog suggestion is not pending'
      using errcode = '22023';
  end if;

  update public.food_catalog_suggestions
  set
    status =
      'rejected'
        ::public.food_catalog_suggestion_status,
    reviewed_by =
      v_admin_id,
    reviewed_at =
      now(),
    review_notes =
      v_review_notes,
    created_food_item_id =
      null,
    resolved_food_item_id =
      null,
    resolution_type =
      null
  where id =
    p_suggestion_id;
end;
$$;



-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all on function
public.admin_approve_food_catalog_suggestion_as_new(
  uuid,
  text,
  text,
  jsonb,
  uuid[],
  text
)
from public;

revoke all on function
public.admin_approve_food_catalog_suggestion_as_new(
  uuid,
  text,
  text,
  jsonb,
  uuid[],
  text
)
from anon;

grant execute on function
public.admin_approve_food_catalog_suggestion_as_new(
  uuid,
  text,
  text,
  jsonb,
  uuid[],
  text
)
to authenticated;


revoke all on function
public.admin_approve_food_catalog_suggestion_as_existing_food(
  uuid,
  uuid,
  text
)
from public;

revoke all on function
public.admin_approve_food_catalog_suggestion_as_existing_food(
  uuid,
  uuid,
  text
)
from anon;

grant execute on function
public.admin_approve_food_catalog_suggestion_as_existing_food(
  uuid,
  uuid,
  text
)
to authenticated;


revoke all on function
public.admin_reject_food_catalog_suggestion(
  uuid,
  text
)
from public;

revoke all on function
public.admin_reject_food_catalog_suggestion(
  uuid,
  text
)
from anon;

grant execute on function
public.admin_reject_food_catalog_suggestion(
  uuid,
  text
)
to authenticated;


comment on column
public.food_catalog_suggestions.resolution_type
is
  'Administrative resolution type for an approved catalog suggestion.';


comment on column
public.food_catalog_suggestions.resolved_food_item_id
is
  'Canonical food that ultimately resolved an approved catalog suggestion.';
