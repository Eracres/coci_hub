-- =========================================================
-- CociHub
-- Manage recipe publication status
-- =========================================================

create or replace function public.set_recipe_status(
  p_recipe_id uuid,
  p_status text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  recipe_row public.recipes%rowtype;
begin

  -- =======================================================
  -- SECURITY
  -- =======================================================

  if not public.is_admin() then
    raise exception 'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- VALID STATUS
  -- =======================================================

  if p_status not in (
    'draft',
    'published',
    'archived'
  ) then
    raise exception 'Invalid recipe status'
      using errcode = '22023';
  end if;


  -- =======================================================
  -- RECIPE EXISTS
  -- =======================================================

  select *
  into recipe_row
  from public.recipes
  where id = p_recipe_id;

  if not found then
    raise exception 'Recipe not found'
      using errcode = 'P0002';
  end if;


  -- =======================================================
  -- PUBLISH VALIDATION
  -- =======================================================

  if p_status = 'published' then

    if trim(
      coalesce(
        recipe_row.title,
        ''
      )
    ) = '' then
      raise exception 'Recipe title is required';
    end if;


    if trim(
      coalesce(
        recipe_row.slug,
        ''
      )
    ) = '' then
      raise exception 'Recipe slug is required';
    end if;


    if trim(
      coalesce(
        recipe_row.short_description,
        ''
      )
    ) = '' then
      raise exception 'Short description is required';
    end if;


    if trim(
      coalesce(
        recipe_row.image_path,
        ''
      )
    ) = '' then
      raise exception 'Main image is required';
    end if;


    if recipe_row.recipe_type_id is null then
      raise exception 'Recipe type is required';
    end if;


    if recipe_row.difficulty is null then
      raise exception 'Difficulty is required';
    end if;


    if recipe_row.base_servings is null
      or recipe_row.base_servings <= 0
    then
      raise exception 'Base servings are required';
    end if;


    if recipe_row.preparation_minutes is null
      or recipe_row.preparation_minutes <= 0
    then
      raise exception 'Preparation time must be greater than zero';
    end if;


    if not exists (
      select 1
      from public.recipe_categories
      where recipe_id = p_recipe_id
    ) then
      raise exception 'At least one category is required';
    end if;


    if not exists (
      select 1
      from public.ingredient_groups as ig
      join public.ingredients as i
        on i.ingredient_group_id = ig.id
      where ig.recipe_id = p_recipe_id
    ) then
      raise exception 'At least one ingredient is required';
    end if;


    if not exists (
      select 1
      from public.recipe_steps
      where recipe_id = p_recipe_id
    ) then
      raise exception 'At least one recipe step is required';
    end if;


    update public.recipes
    set
      status =
        'published'::public.recipe_status,

      published_at =
        now()
    where id = p_recipe_id;

    return;
  end if;


  -- =======================================================
  -- RETURN TO DRAFT
  -- =======================================================

  if p_status = 'draft' then

    update public.recipes
    set
      status =
        'draft'::public.recipe_status,

      published_at =
        null
    where id = p_recipe_id;

    return;
  end if;


  -- =======================================================
  -- ARCHIVE
  --
  -- published_at is intentionally preserved.
  -- =======================================================

  if p_status = 'archived' then

    update public.recipes
    set
      status =
        'archived'::public.recipe_status
    where id = p_recipe_id;

    return;
  end if;

end;
$$;


revoke all
on function public.set_recipe_status(
  uuid,
  text
)
from public;


grant execute
on function public.set_recipe_status(
  uuid,
  text
)
to authenticated;