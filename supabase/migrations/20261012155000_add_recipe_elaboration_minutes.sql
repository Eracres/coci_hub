-- =========================================================
-- CociHub
-- Introduce recipe elaboration time
-- =========================================================
--
-- New time model:
--
--   preparation_minutes
--     Manual preparation time.
--
--   elaboration_minutes
--     Automatically derived from the duration of all
--     recipe steps.
--
-- Legacy fields are intentionally preserved temporarily:
--
--   cooking_minutes
--   additional_minutes
--
-- They will be removed only after the whole application
-- has migrated to the new model and has been fully tested.
--
-- This makes the migration backwards compatible with the
-- current deployed application.
-- =========================================================



-- =========================================================
-- ADD ELABORATION MINUTES
-- =========================================================

alter table public.recipes
add column if not exists
  elaboration_minutes integer;



-- =========================================================
-- ELABORATION MINUTES VALIDATION
-- =========================================================

alter table public.recipes
add constraint recipes_elaboration_minutes_nonnegative
check (
  elaboration_minutes is null
  or elaboration_minutes >= 0
);



-- =========================================================
-- DOCUMENT COLUMN
-- =========================================================

comment on column
public.recipes.elaboration_minutes
is
  'Total recipe elaboration time in minutes. Derived automatically from recipe_steps.duration_minutes.';



-- =========================================================
-- BACKFILL EXISTING RECIPES
-- =========================================================
--
-- Existing data used the model:
--
--   cooking_minutes
--   additional_minutes
--
-- We must not lose that information.
--
-- If every existing step already has a duration:
--
--   elaboration =
--     SUM(step durations)
--     + legacy additional time
--
-- Otherwise we fall back to:
--
--   cooking_minutes
--   + additional_minutes
--
-- This preserves the previously stored total as closely
-- as possible during the transition.
-- =========================================================

with recipe_time_data as (
  select
    recipe.id,

    count(
      recipe_step.id
    )::integer
      as total_steps,

    count(
      recipe_step.duration_minutes
    )::integer
      as steps_with_duration,

    coalesce(
      sum(
        recipe_step.duration_minutes
      ),
      0
    )::integer
      as step_minutes,

    recipe.cooking_minutes,

    recipe.additional_minutes

  from public.recipes
    as recipe

  left join public.recipe_steps
    as recipe_step

    on recipe_step.recipe_id =
      recipe.id

  group by
    recipe.id,
    recipe.cooking_minutes,
    recipe.additional_minutes
)

update public.recipes
  as recipe

set elaboration_minutes =
  case

    when
      time_data.total_steps > 0
      and
      time_data.steps_with_duration =
        time_data.total_steps

    then
      time_data.step_minutes
      +
      coalesce(
        time_data.additional_minutes,
        0
      )


    when
      time_data.cooking_minutes
        is not null
      or
      time_data.additional_minutes
        is not null

    then
      coalesce(
        time_data.cooking_minutes,
        0
      )
      +
      coalesce(
        time_data.additional_minutes,
        0
      )


    else
      null

  end

from recipe_time_data
  as time_data

where
  recipe.id =
    time_data.id

  and
  recipe.elaboration_minutes
    is null;



-- =========================================================
-- SYNC ELABORATION MINUTES FOR ONE RECIPE
-- =========================================================
--
-- Rules:
--
-- No steps:
--
--   elaboration_minutes = NULL
--
-- At least one step without duration:
--
--   elaboration_minutes = NULL
--
-- Every step has a duration:
--
--   elaboration_minutes =
--     SUM(recipe_steps.duration_minutes)
--
-- Waiting, resting, fermentation, marinating, baking,
-- cooking, cooling, etc. are all part of elaboration
-- whenever they are represented by a recipe step.
-- =========================================================

create or replace function
public.sync_recipe_elaboration_minutes(
  p_recipe_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total_steps
    integer;

  v_steps_with_duration
    integer;

  v_total_minutes
    integer;
begin

  -- -------------------------------------------------------
  -- NOTHING TO DO
  -- -------------------------------------------------------

  if p_recipe_id
    is null then

    return;

  end if;



  -- -------------------------------------------------------
  -- RECIPE EXISTS
  -- -------------------------------------------------------

  perform 1
  from public.recipes
  where id =
    p_recipe_id;


  if not found then
    return;
  end if;



  -- -------------------------------------------------------
  -- STEP TIME INFORMATION
  -- -------------------------------------------------------

  select
    count(*)::integer,

    count(
      recipe_step.duration_minutes
    )::integer,

    coalesce(
      sum(
        recipe_step.duration_minutes
      ),
      0
    )::integer

  into
    v_total_steps,
    v_steps_with_duration,
    v_total_minutes

  from public.recipe_steps
    as recipe_step

  where recipe_step.recipe_id =
    p_recipe_id;



  -- -------------------------------------------------------
  -- APPLY BUSINESS RULE
  -- -------------------------------------------------------

  update public.recipes

  set elaboration_minutes =
    case

      when
        v_total_steps = 0

      then
        null


      when
        v_steps_with_duration <>
          v_total_steps

      then
        null


      else
        v_total_minutes

    end

  where id =
    p_recipe_id;

end;
$$;



-- =========================================================
-- TRIGGER FUNCTION
-- =========================================================

create or replace function
public.handle_recipe_steps_elaboration_time_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  -- -------------------------------------------------------
  -- DELETE
  -- -------------------------------------------------------

  if tg_op =
    'DELETE' then

    perform
      public.sync_recipe_elaboration_minutes(
        old.recipe_id
      );


    return old;

  end if;



  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

  if tg_op =
    'UPDATE' then

    if old.recipe_id
      is distinct from
      new.recipe_id then

      perform
        public.sync_recipe_elaboration_minutes(
          old.recipe_id
        );

    end if;


    perform
      public.sync_recipe_elaboration_minutes(
        new.recipe_id
      );


    return new;

  end if;



  -- -------------------------------------------------------
  -- INSERT
  -- -------------------------------------------------------

  perform
    public.sync_recipe_elaboration_minutes(
      new.recipe_id
    );


  return new;

end;
$$;



-- =========================================================
-- ELABORATION SYNC TRIGGER
-- =========================================================

drop trigger if exists
  recipe_steps_sync_elaboration_minutes_trigger
on public.recipe_steps;


create trigger
  recipe_steps_sync_elaboration_minutes_trigger

after insert or update or delete
on public.recipe_steps

for each row

execute function
  public.handle_recipe_steps_elaboration_time_sync();



-- =========================================================
-- INTERNAL FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.sync_recipe_elaboration_minutes(
  uuid
)
from public;


revoke all
on function
public.handle_recipe_steps_elaboration_time_sync()
from public;



-- =========================================================
-- COMMUNITY: UPDATE PREPARATION TIME
-- =========================================================
--
-- Community authors only edit preparation time manually.
--
-- elaboration_minutes is intentionally NOT accepted here.
--
-- It is controlled exclusively by the durations of the
-- recipe steps.
--
-- A new RPC name is used intentionally so the current
-- application can continue using update_my_recipe_times()
-- while the frontend migration is in progress.
-- =========================================================

create or replace function
public.update_my_recipe_preparation_time(
  p_recipe_id uuid,
  p_preparation_minutes integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin

  -- -------------------------------------------------------
  -- AUTHORIZATION
  -- -------------------------------------------------------

  if not public.can_edit_recipe(
    p_recipe_id
  ) then

    raise exception
      'Not authorized'
      using errcode = '42501';

  end if;



  -- -------------------------------------------------------
  -- VALIDATION
  -- -------------------------------------------------------

  if
    p_preparation_minutes
      is not null

    and
    p_preparation_minutes < 0

  then

    raise exception
      'Preparation time cannot be negative'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

  update public.recipes

  set preparation_minutes =
    p_preparation_minutes

  where id =
    p_recipe_id;

end;
$$;



-- =========================================================
-- COMMUNITY RPC PERMISSIONS
-- =========================================================

revoke all
on function
public.update_my_recipe_preparation_time(
  uuid,
  integer
)
from public;


revoke all
on function
public.update_my_recipe_preparation_time(
  uuid,
  integer
)
from anon;


grant execute
on function
public.update_my_recipe_preparation_time(
  uuid,
  integer
)
to authenticated;



-- =========================================================
-- TRANSITION NOTE
-- =========================================================
--
-- DO NOT remove yet:
--
--   recipes.cooking_minutes
--   recipes.additional_minutes
--
-- DO NOT remove yet:
--
--   sync_recipe_cooking_minutes(...)
--   handle_recipe_steps_cooking_time_sync()
--   recipe_steps_sync_cooking_minutes_trigger
--   update_my_recipe_times(...)
--
-- They are still required by the existing application.
--
-- A later cleanup migration will remove all of them after
-- the application has been migrated and tested.
-- =========================================================
