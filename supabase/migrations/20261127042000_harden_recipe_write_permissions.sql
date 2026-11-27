-- =========================================================
-- CociHub
-- AUD-135.2
-- Harden recipe write permissions
-- =========================================================


-- =========================================================
-- 1. RESTRICT TABLE-LEVEL WRITE PERMISSIONS
-- =========================================================

revoke insert, update, truncate
on table public.recipes
from public, anon, authenticated;


-- =========================================================
-- 2. REMOVE EXISTING COLUMN-LEVEL WRITE GRANTS
-- =========================================================

do $$
declare
  v_columns text;
begin

  select string_agg(
    quote_ident(attname),
    ', ' order by attnum
  )
  into v_columns
  from pg_attribute
  where attrelid = 'public.recipes'::regclass
    and attnum > 0
    and not attisdropped;

  execute format(
    'revoke insert (%1$s), update (%1$s)
     on table public.recipes
     from public, anon, authenticated',
    v_columns
  );

end;
$$;


-- =========================================================
-- 3. ALLOW REQUIRED INSERT COLUMNS
--
-- Required by the admin editor and AI draft importer.
-- Additional restrictions are enforced through RLS.
-- =========================================================

grant insert (
  author_id,
  recipe_type_id,
  title,
  slug,
  short_description,
  introduction,
  image_path,
  image_alt,
  status,
  difficulty,
  base_servings,
  preparation_minutes,
  featured,
  tips,
  substitutions,
  storage,
  freezing,
  reheating,
  source_type,
  source_title,
  source_author,
  source_page,
  source_url,
  source_notes,
  published_at
)
on table public.recipes
to authenticated;


-- =========================================================
-- 4. ALLOW REQUIRED UPDATE COLUMNS
--
-- Protected metadata must be modified through RPCs.
-- =========================================================

grant update (
  title,
  slug,
  short_description,
  introduction,
  image_path,
  base_servings,
  preparation_minutes,
  tips,
  substitutions,
  storage,
  freezing,
  reheating,
  source_type,
  source_title,
  source_author,
  source_page,
  source_url,
  source_notes
)
on table public.recipes
to authenticated;


-- =========================================================
-- 5. RESTRICT DIRECT RECIPE CREATION
-- =========================================================

alter policy "Admins can insert recipes"
on public.recipes
with check (
  (select public.is_admin())
  and author_id = (select auth.uid())
  and status = 'draft'
  and featured is false
  and published_at is null
);


-- =========================================================
-- 6. RESTRICT DIRECT RECIPE DELETION
--
-- Temporary compatibility with AI import rollback.
-- Administrators may only directly delete their own drafts.
-- =========================================================

alter policy "Admins can delete recipes"
on public.recipes
using (
  (select public.is_admin())
  and author_id = (select auth.uid())
  and status = 'draft'
);


-- =========================================================
-- 7. HARDEN THE ADMINISTRATIVE DELETE RPC
-- =========================================================

create or replace function public.delete_recipe(
  p_recipe_id uuid,
  p_confirmation_title text
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  recipe_row public.recipes%rowtype;
begin

  -- SECURITY

  if not coalesce(public.is_admin(), false) then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- LOCK AND VALIDATE RECIPE

  select *
  into recipe_row
  from public.recipes
  where id = p_recipe_id
  for update;

  if not found then
    raise exception 'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- PUBLISHED RECIPES CANNOT BE DELETED

  if recipe_row.status = 'published' then
    raise exception 'Published recipes cannot be deleted'
      using errcode = '55000';
  end if;


  -- EXPLICIT TITLE CONFIRMATION

  if trim(
    coalesce(p_confirmation_title, '')
  ) <> recipe_row.title then

    raise exception
      'Recipe title confirmation does not match'
      using errcode = '22023';

  end if;


  -- DELETE
  --
  -- Child records are removed through ON DELETE CASCADE.
  -- Storage cleanup remains in the application service.

  delete from public.recipes
  where id = p_recipe_id;

end;
$function$;


-- =========================================================
-- 8. RESTRICT RPC EXECUTION
-- =========================================================

revoke all
on function public.delete_recipe(uuid, text)
from public, anon, authenticated;

grant execute
on function public.delete_recipe(uuid, text)
to authenticated;