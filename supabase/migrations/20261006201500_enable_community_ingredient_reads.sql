-- =========================================================
-- CociHub
-- Enable community ingredient reads
-- =========================================================
--
-- Community recipe authors already have controlled write
-- access through:
--
--   public.replace_recipe_ingredients()
--
-- That function validates recipe ownership and editable
-- status through public.can_edit_recipe().
--
-- The community editor also needs to reload the ingredient
-- groups and ingredients previously saved by the author.
--
-- These policies grant READ access only when the recipe
-- belongs to the authenticated user.
--
-- No direct INSERT, UPDATE or DELETE permissions are added.
-- Writes remain controlled by the existing RPC.
-- =========================================================



-- =========================================================
-- READ INGREDIENT GROUPS OF OWN RECIPES
-- =========================================================

drop policy if exists
  "Users can read ingredient groups of own recipes"
on public.ingredient_groups;


create policy
  "Users can read ingredient groups of own recipes"
on public.ingredient_groups
for select
to authenticated
using (
  exists (
    select 1

    from public.recipes
      as recipe

    where recipe.id =
      public.ingredient_groups.recipe_id

      and recipe.author_id = (
        select auth.uid()
      )
  )
);



-- =========================================================
-- READ INGREDIENTS OF OWN RECIPES
-- =========================================================

drop policy if exists
  "Users can read ingredients of own recipes"
on public.ingredients;


create policy
  "Users can read ingredients of own recipes"
on public.ingredients
for select
to authenticated
using (
  exists (
    select 1

    from public.ingredient_groups
      as ingredient_group

    join public.recipes
      as recipe
      on recipe.id =
        ingredient_group.recipe_id

    where ingredient_group.id =
      public.ingredients.ingredient_group_id

      and recipe.author_id = (
        select auth.uid()
      )
  )
);
