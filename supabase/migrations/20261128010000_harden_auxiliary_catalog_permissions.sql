-- =========================================================
-- CociHub
-- AUD-135.4
-- Harden auxiliary catalog permissions
-- =========================================================


-- =========================================================
-- 1. CREATE CATEGORY RPC
-- =========================================================

create function public.admin_create_category(
  p_name text,
  p_slug text,
  p_description text
)
returns table (
  id uuid,
  name varchar,
  slug varchar,
  description text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_name text;
  v_slug text;
  v_description text;
begin

  -- AUTHORIZATION

  if not coalesce(public.is_admin(), false) then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- NORMALIZATION

  v_name := btrim(coalesce(p_name, ''));

  v_slug := btrim(coalesce(p_slug, ''));

  v_description := nullif(
    btrim(coalesce(p_description, '')),
    ''
  );


  -- VALIDATION

  if char_length(v_name) not between 2 and 80 then
    raise exception 'Invalid category name'
      using errcode = '22023';
  end if;

  if char_length(v_slug) not between 1 and 120
    or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  then
    raise exception 'Invalid category slug'
      using errcode = '22023';
  end if;

  if char_length(v_description) > 500 then
    raise exception 'Category description is too long'
      using errcode = '22023';
  end if;


  -- CREATE CATEGORY

  return query

  insert into public.categories as category (
    name,
    slug,
    description
  )
  values (
    v_name,
    v_slug,
    v_description
  )
  returning
    category.id,
    category.name,
    category.slug,
    category.description,
    category.created_at,
    category.updated_at;

end;
$function$;


-- =========================================================
-- 2. SAFE CATEGORY DELETION RPC
-- =========================================================

create function public.admin_delete_category(
  p_category_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin

  -- AUTHORIZATION

  if not coalesce(public.is_admin(), false) then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- LOCK CATEGORY

  perform 1
  from public.categories
  where id = p_category_id
  for update;

  if not found then
    raise exception 'Category not found'
      using errcode = 'P0002';
  end if;


  -- PROTECT EXISTING RECIPE ASSOCIATIONS

  if exists (
    select 1
    from public.recipe_categories
    where category_id = p_category_id
  ) then

    raise exception
      'Category is assigned to one or more recipes'
      using errcode = '55000';

  end if;


  -- DELETE CATEGORY

  delete from public.categories
  where id = p_category_id;

end;
$function$;


-- =========================================================
-- 3. FUNCTION OWNERSHIP
-- =========================================================

alter function public.admin_create_category(
  text,
  text,
  text
)
owner to postgres;

alter function public.admin_delete_category(
  uuid
)
owner to postgres;


-- =========================================================
-- 4. FUNCTION EXECUTION PERMISSIONS
-- =========================================================

revoke all
on function public.admin_create_category(text, text, text)
from public, anon, authenticated;

grant execute
on function public.admin_create_category(text, text, text)
to authenticated;


revoke all
on function public.admin_delete_category(uuid)
from public, anon, authenticated;

grant execute
on function public.admin_delete_category(uuid)
to authenticated;


-- =========================================================
-- 5. REVOKE DIRECT TABLE WRITES
-- =========================================================

revoke insert, update, delete, truncate
on table
  public.categories,
  public.tags,
  public.recipe_types,
  public.allergens
from public, anon, authenticated;


-- =========================================================
-- 6. REMOVE POSSIBLE COLUMN-LEVEL WRITE GRANTS
-- =========================================================

do $migration$
declare
  v_table text;
  v_columns text;
begin

  foreach v_table in array array[
    'categories',
    'tags',
    'recipe_types',
    'allergens'
  ]
  loop

    select string_agg(
      quote_ident(attname),
      ', ' order by attnum
    )
    into v_columns
    from pg_attribute
    where attrelid =
      format('public.%I', v_table)::regclass
      and attnum > 0
      and not attisdropped;

    execute format(
      'revoke insert (%1$s), update (%1$s)
       on table public.%2$I
       from public, anon, authenticated',
      v_columns,
      v_table
    );

  end loop;

end;
$migration$;