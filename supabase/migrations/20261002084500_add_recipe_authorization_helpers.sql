-- =========================================================
-- CociHub
-- Add community recipe authorization helpers
-- =========================================================
--
-- These helper functions centralize ownership and edit
-- permissions for community recipes.
--
-- A normal authenticated user:
--
--   - owns a recipe when recipes.author_id = auth.uid()
--   - can edit only an owned recipe whose status is draft
--
-- An administrator can edit any existing recipe.
--
-- These functions will later be reused by RLS policies
-- and recipe management RPC functions.
-- =========================================================


-- =========================================================
-- IS RECIPE OWNER
-- =========================================================

create or replace function public.is_recipe_owner(
  p_recipe_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.recipes as recipe
    where recipe.id = p_recipe_id
      and recipe.author_id = (
        select auth.uid()
      )
  );
$$;


revoke all
on function public.is_recipe_owner(
  uuid
)
from public;


revoke all
on function public.is_recipe_owner(
  uuid
)
from anon;


grant execute
on function public.is_recipe_owner(
  uuid
)
to authenticated;



-- =========================================================
-- CAN EDIT RECIPE
-- =========================================================

create or replace function public.can_edit_recipe(
  p_recipe_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.recipes as recipe
    where recipe.id = p_recipe_id
      and (
        public.is_admin()
        or (
          recipe.author_id = (
            select auth.uid()
          )
          and recipe.status =
            'draft'::public.recipe_status
        )
      )
  );
$$;


revoke all
on function public.can_edit_recipe(
  uuid
)
from public;


revoke all
on function public.can_edit_recipe(
  uuid
)
from anon;


grant execute
on function public.can_edit_recipe(
  uuid
)
to authenticated;
