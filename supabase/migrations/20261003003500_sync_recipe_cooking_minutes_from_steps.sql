-- =========================================================
-- CociHub
-- Sync recipe cooking time from recipe steps
-- =========================================================
--
-- Goal:
--
--   Keep recipes.cooking_minutes synchronized automatically
--   from recipe_steps.duration_minutes.
--
-- Rules:
--
--   - If a recipe has no steps:
--       cooking_minutes = NULL
--
--   - If at least one step has duration_minutes = NULL:
--       cooking_minutes = NULL
--
--   - Otherwise:
--       cooking_minutes = SUM(duration_minutes)
--
-- Important:
--
--   This migration does NOT backfill existing recipes.
--   It only introduces automatic synchronization for future
--   inserts / updates / deletes on recipe_steps.
-- =========================================================


-- =========================================================
-- RECALCULATE COOKING MINUTES FOR ONE RECIPE
-- =========================================================

create or replace function public.sync_recipe_cooking_minutes(
  p_recipe_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total_steps integer;
  v_steps_with_duration integer;
  v_total_minutes integer;
begin

  -- -------------------------------------------------------
  -- NOTHING TO DO
  -- -------------------------------------------------------

  if p_recipe_id is null then
    return;
  end if;


  -- -------------------------------------------------------
  -- RECIPE EXISTS
  -- -------------------------------------------------------

  perform 1
  from public.recipes
  where id = p_recipe_id;

  if not found then
    return;
  end if;


  -- -------------------------------------------------------
  -- COLLECT STEP TIME INFORMATION
  -- -------------------------------------------------------

  select
    count(*)::integer,
    count(rs.duration_minutes)::integer,
    coalesce(sum(rs.duration_minutes), 0)::integer
  into
    v_total_steps,
    v_steps_with_duration,
    v_total_minutes
  from public.recipe_steps as rs
  where rs.recipe_id = p_recipe_id;


  -- -------------------------------------------------------
  -- APPLY BUSINESS RULES
  -- -------------------------------------------------------

  update public.recipes
  set cooking_minutes =
    case
      when v_total_steps = 0 then null
      when v_steps_with_duration <> v_total_steps then null
      else v_total_minutes
    end
  where id = p_recipe_id;

end;
$$;


-- =========================================================
-- TRIGGER FUNCTION
-- =========================================================

create or replace function public.handle_recipe_steps_cooking_time_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  if tg_op = 'DELETE' then
    perform public.sync_recipe_cooking_minutes(
      old.recipe_id
    );
    return old;
  end if;


  if tg_op = 'UPDATE' then
    if old.recipe_id is distinct from new.recipe_id then
      perform public.sync_recipe_cooking_minutes(
        old.recipe_id
      );
    end if;

    perform public.sync_recipe_cooking_minutes(
      new.recipe_id
    );

    return new;
  end if;


  perform public.sync_recipe_cooking_minutes(
    new.recipe_id
  );

  return new;
end;
$$;


-- =========================================================
-- TRIGGER
-- =========================================================

drop trigger if exists
  recipe_steps_sync_cooking_minutes_trigger
on public.recipe_steps;


create trigger
  recipe_steps_sync_cooking_minutes_trigger
after insert or update or delete
on public.recipe_steps
for each row
execute function
  public.handle_recipe_steps_cooking_time_sync();


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.sync_recipe_cooking_minutes(uuid)
from public;

revoke all
on function public.handle_recipe_steps_cooking_time_sync()
from public;
