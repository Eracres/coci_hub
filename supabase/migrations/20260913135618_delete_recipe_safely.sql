-- =========================================================
-- CociHub
-- Delete recipe safely
-- =========================================================

create or replace function public.delete_recipe(
  p_recipe_id uuid
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
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
  -- DELETE
  --
  -- Related records are removed by ON DELETE CASCADE.
  -- Storage files are removed separately from the service.
  -- =======================================================

  delete from public.recipes
  where id = p_recipe_id;

end;
$$;


revoke all
on function public.delete_recipe(
  uuid
)
from public;


grant execute
on function public.delete_recipe(
  uuid
)
to authenticated;