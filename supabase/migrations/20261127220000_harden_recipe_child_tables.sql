-- =========================================================
-- CociHub
-- AUD-135.3 / AUD-144
-- Harden recipe child tables and internal time functions
-- =========================================================


-- =========================================================
-- 1. RESTRICT DIRECT WRITE PERMISSIONS
-- =========================================================

revoke update, delete, truncate
on table
  public.ingredient_groups,
  public.ingredients,
  public.recipe_steps,
  public.recipe_allergens,
  public.recipe_categories,
  public.recipe_tags
from public, anon, authenticated;


revoke insert
on table
  public.ingredient_groups,
  public.ingredients,
  public.recipe_steps,
  public.recipe_allergens,
  public.recipe_categories,
  public.recipe_tags
from public, anon;


-- =========================================================
-- 2. REMOVE POSSIBLE COLUMN-LEVEL WRITE GRANTS
-- =========================================================

do $migration$
declare
  v_table text;
  v_columns text;
begin

  foreach v_table in array array[
    'ingredient_groups',
    'ingredients',
    'recipe_steps',
    'recipe_allergens',
    'recipe_categories',
    'recipe_tags'
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
      'revoke update (%s)
       on table public.%I
       from public, anon, authenticated',
      v_columns,
      v_table
    );

    execute format(
      'revoke insert (%s)
       on table public.%I
       from public, anon',
      v_columns,
      v_table
    );

  end loop;

end;
$migration$;


-- =========================================================
-- 3. RESTRICT DIRECT INSERTS
--
-- Temporary compatibility with AI recipe imports.
-- Direct inserts are only allowed for administrator-owned
-- draft recipes.
--
-- Restrictive policies complement existing RLS policies.
-- =========================================================

do $migration$
declare
  v_table text;
begin

  foreach v_table in array array[
    'ingredient_groups',
    'recipe_steps',
    'recipe_allergens',
    'recipe_categories',
    'recipe_tags'
  ]
  loop

    execute format(
      $policy$

      create policy "Direct inserts require owned admin draft"
      on public.%I
      as restrictive
      for insert
      to authenticated
      with check (

        (select public.is_admin())

        and exists (
          select 1
          from public.recipes as recipe
          where recipe.id = %I.recipe_id
            and recipe.author_id = (select auth.uid())
            and recipe.status = 'draft'
        )

      )

      $policy$,
      v_table,
      v_table
    );

  end loop;

end;
$migration$;


-- =========================================================
-- 4. INGREDIENT INSERT POLICY
--
-- Ingredients belong to recipes through ingredient groups.
-- =========================================================

create policy "Direct inserts require owned admin draft"
on public.ingredients
as restrictive
for insert
to authenticated
with check (

  (select public.is_admin())

  and exists (
    select 1
    from public.ingredient_groups as ingredient_group
    join public.recipes as recipe
      on recipe.id = ingredient_group.recipe_id

    where ingredient_group.id =
      ingredients.ingredient_group_id

      and recipe.author_id = (select auth.uid())
      and recipe.status = 'draft'
  )

);


-- =========================================================
-- 5. AUD-144
-- RESTRICT INTERNAL ELABORATION TIME FUNCTIONS
-- =========================================================

revoke all
on function public.sync_recipe_elaboration_minutes(uuid)
from public, anon, authenticated;


revoke all
on function public.handle_recipe_steps_elaboration_time_sync()
from public, anon, authenticated;