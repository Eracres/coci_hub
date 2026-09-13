-- =========================================================
-- CociHub
-- Safe recipe deletion
-- =========================================================

-- Elimina una posible versión anterior menos estricta.
drop function if exists public.delete_recipe(uuid);


create or replace function public.delete_recipe(
  p_recipe_id uuid,
  p_confirmation_title text
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
  -- PUBLISHED RECIPES CANNOT BE DELETED DIRECTLY
  -- =======================================================

  if recipe_row.status = 'published' then
    raise exception 'Published recipes cannot be deleted'
      using errcode = '55000';
  end if;


  -- =======================================================
  -- EXPLICIT TITLE CONFIRMATION
  -- =======================================================

  if trim(
    coalesce(
      p_confirmation_title,
      ''
    )
  ) <> recipe_row.title then

    raise exception 'Recipe title confirmation does not match'
      using errcode = '22023';

  end if;


  -- =======================================================
  -- DELETE
  --
  -- Child records are removed through ON DELETE CASCADE.
  -- Storage files are removed from the application service.
  -- =======================================================

  delete from public.recipes
  where id = p_recipe_id;

end;
$$;


revoke all
on function public.delete_recipe(
  uuid,
  text
)
from public;


grant execute
on function public.delete_recipe(
  uuid,
  text
)
to authenticated;