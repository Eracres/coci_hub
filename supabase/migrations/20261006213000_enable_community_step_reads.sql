-- =========================================================
-- CociHub
-- Enable community recipe step reads
-- =========================================================
--
-- Community recipe authors already have controlled write
-- access through:
--
--   public.replace_recipe_steps()
--
-- That function validates whether the authenticated user
-- can edit the recipe through:
--
--   public.can_edit_recipe(recipe_id)
--
-- The community editor also needs to reload the recipe
-- steps previously saved by the author.
--
-- This policy grants SELECT access only to steps belonging
-- to recipes owned by the authenticated user.
--
-- No direct INSERT, UPDATE or DELETE permissions are added.
-- Writes remain controlled by the existing RPC.
-- =========================================================


-- =========================================================
-- READ STEPS OF OWN RECIPES
-- =========================================================

drop policy if exists
  "Users can read steps of own recipes"
on public.recipe_steps;


create policy
  "Users can read steps of own recipes"
on public.recipe_steps
for select
to authenticated
using (
  exists (
    select 1

    from public.recipes
      as recipe

    where recipe.id =
      public.recipe_steps.recipe_id

      and recipe.author_id = (
        select auth.uid()
      )
  )
);
