-- =========================================================
-- CociHub
-- Replace recipe steps atomically
-- =========================================================

create or replace function public.replace_recipe_steps(
  p_recipe_id uuid,
  p_steps jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  step_item jsonb;
begin

  -- =======================================================
  -- SECURITY
  -- =======================================================

  if not public.is_admin() then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- RECIPE EXISTS
  -- =======================================================

  perform 1
  from public.recipes
  where id = p_recipe_id;

  if not found then
    raise exception 'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- =======================================================
  -- REMOVE PREVIOUS STEPS
  -- =======================================================

  delete from public.recipe_steps
  where recipe_id = p_recipe_id;


  -- =======================================================
  -- CREATE NEW STEPS
  -- =======================================================

  for step_item in
    select value
    from jsonb_array_elements(
      coalesce(
        p_steps,
        '[]'::jsonb
      )
    )
  loop

    insert into public.recipe_steps (
      recipe_id,
      title,
      instructions,
      duration_minutes,
      tip,
      image_url,
      position
    )
    values (
      p_recipe_id,

      nullif(
        step_item ->> 'title',
        ''
      ),

      step_item ->> 'instructions',

      case
        when
          step_item -> 'durationMinutes'
          is null
          or jsonb_typeof(
            step_item -> 'durationMinutes'
          ) = 'null'
        then null

        else (
          step_item
          ->> 'durationMinutes'
        )::integer
      end,

      nullif(
        step_item ->> 'tip',
        ''
      ),

      null,

      coalesce(
        (
          step_item
          ->> 'position'
        )::integer,
        0
      )
    );

  end loop;

end;
$$;


revoke all
on function public.replace_recipe_steps(
  uuid,
  jsonb
)
from public;


grant execute
on function public.replace_recipe_steps(
  uuid,
  jsonb
)
to authenticated;