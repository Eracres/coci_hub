-- =========================================================
-- CociHub
-- Enable controlled recipe step editing for community users
-- =========================================================
--
-- This migration evolves public.replace_recipe_steps().
--
-- Previous behavior:
--
--   - only administrators could replace recipe steps
--   - the function used SECURITY INVOKER
--
-- New behavior:
--
--   - administrators can still edit steps
--   - normal users can edit steps only on their own drafts
--   - pending_review recipes are locked for their authors
--   - published recipes are locked for their authors
--   - recipes owned by other users cannot be edited
--
-- Authorization is centralized through:
--
--   public.can_edit_recipe(recipe_id)
--
-- The function uses SECURITY DEFINER so authenticated users
-- do not need unrestricted direct write access to
-- public.recipe_steps.
--
-- Step positions are generated from the JSON array order
-- instead of trusting a client-provided position.
--
-- cooking_minutes is synchronized automatically by the
-- recipe_steps trigger introduced previously.
-- =========================================================


create or replace function public.replace_recipe_steps(
  p_recipe_id uuid,
  p_steps jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_steps jsonb;

  step_item jsonb;
  step_position integer;

  step_title text;
  step_instructions text;
  step_tip text;

  step_duration_text text;
  step_duration integer;
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
  where id = p_recipe_id;

  if not found then
    raise exception
      'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- =======================================================
  -- NORMALIZE STEPS CONTAINER
  -- =======================================================

  v_steps :=
    coalesce(
      p_steps,
      '[]'::jsonb
    );


  if jsonb_typeof(
    v_steps
  ) <> 'array' then
    raise exception
      'Recipe steps must be a JSON array'
      using errcode = '22023';
  end if;


  -- =======================================================
  -- REMOVE PREVIOUS STEPS
  -- =======================================================

  delete from public.recipe_steps
  where recipe_id =
    p_recipe_id;


  -- =======================================================
  -- CREATE NEW STEPS
  -- =======================================================

  for
    step_item,
    step_position
  in

    select
      item.value,
      (
        item.ordinality - 1
      )::integer

    from jsonb_array_elements(
      v_steps
    )
    with ordinality
      as item(
        value,
        ordinality
      )

  loop

    -- -----------------------------------------------------
    -- STEP MUST BE AN OBJECT
    -- -----------------------------------------------------

    if jsonb_typeof(
      step_item
    ) <> 'object' then
      raise exception
        'Each recipe step must be a JSON object'
        using errcode = '22023';
    end if;


    -- -----------------------------------------------------
    -- NORMALIZE TEXT VALUES
    -- -----------------------------------------------------

    step_title :=
      nullif(
        btrim(
          coalesce(
            step_item ->> 'title',
            ''
          )
        ),
        ''
      );


    step_instructions :=
      btrim(
        coalesce(
          step_item ->> 'instructions',
          ''
        )
      );


    step_tip :=
      nullif(
        btrim(
          coalesce(
            step_item ->> 'tip',
            ''
          )
        ),
        ''
      );


    -- -----------------------------------------------------
    -- VALIDATE TITLE
    -- -----------------------------------------------------

    if
      step_title is not null
      and char_length(
        step_title
      ) > 120
    then
      raise exception
        'Recipe step title cannot exceed 120 characters';
    end if;


    -- -----------------------------------------------------
    -- VALIDATE INSTRUCTIONS
    -- -----------------------------------------------------

    if
      char_length(
        step_instructions
      ) < 10
      or char_length(
        step_instructions
      ) > 2500
    then
      raise exception
        'Recipe step instructions must contain between 10 and 2500 characters';
    end if;


    -- -----------------------------------------------------
    -- VALIDATE TIP
    -- -----------------------------------------------------

    if
      step_tip is not null
      and char_length(
        step_tip
      ) > 800
    then
      raise exception
        'Recipe step tip cannot exceed 800 characters';
    end if;


    -- -----------------------------------------------------
    -- NORMALIZE AND VALIDATE DURATION
    -- -----------------------------------------------------

    if
      not (
        step_item
        ? 'durationMinutes'
      )
      or (
        step_item
        -> 'durationMinutes'
      ) is null
      or jsonb_typeof(
        step_item
        -> 'durationMinutes'
      ) = 'null'
      or btrim(
        coalesce(
          step_item
          ->> 'durationMinutes',
          ''
        )
      ) = ''
    then
      step_duration :=
        null;

    else

      step_duration_text :=
        btrim(
          step_item
          ->> 'durationMinutes'
        );


      if step_duration_text !~
        '^[0-9]+$'
      then
        raise exception
          'Recipe step duration must be a non-negative integer';
      end if;


      step_duration :=
        step_duration_text::integer;

    end if;


    -- -----------------------------------------------------
    -- INSERT STEP
    -- -----------------------------------------------------

    insert into public.recipe_steps (
      recipe_id,
      title,
      instructions,
      duration_minutes,
      tip,
      position
    )
    values (
      p_recipe_id,
      step_title,
      step_instructions,
      step_duration,
      step_tip,
      step_position
    );

  end loop;

end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.replace_recipe_steps(
  uuid,
  jsonb
)
from public;


revoke all
on function public.replace_recipe_steps(
  uuid,
  jsonb
)
from anon;


grant execute
on function public.replace_recipe_steps(
  uuid,
  jsonb
)
to authenticated;
