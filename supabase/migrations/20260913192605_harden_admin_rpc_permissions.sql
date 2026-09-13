-- =========================================================
-- CociHub
-- Harden administrative RPC permissions
-- =========================================================

-- ---------------------------------------------------------
-- is_admin
-- ---------------------------------------------------------

revoke all
on function public.is_admin()
from public;

revoke all
on function public.is_admin()
from anon;

grant execute
on function public.is_admin()
to authenticated;


-- ---------------------------------------------------------
-- UPDATE RECIPE CLASSIFICATION
-- ---------------------------------------------------------

revoke all
on function public.update_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  boolean,
  uuid[],
  uuid[]
)
from public;

revoke all
on function public.update_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  boolean,
  uuid[],
  uuid[]
)
from anon;

grant execute
on function public.update_recipe_classification(
  uuid,
  uuid,
  public.recipe_difficulty,
  boolean,
  uuid[],
  uuid[]
)
to authenticated;


-- ---------------------------------------------------------
-- REPLACE INGREDIENTS
-- ---------------------------------------------------------

revoke all
on function public.replace_recipe_ingredients(
  uuid,
  jsonb
)
from public;

revoke all
on function public.replace_recipe_ingredients(
  uuid,
  jsonb
)
from anon;

grant execute
on function public.replace_recipe_ingredients(
  uuid,
  jsonb
)
to authenticated;


-- ---------------------------------------------------------
-- REPLACE STEPS
-- ---------------------------------------------------------

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


-- ---------------------------------------------------------
-- REPLACE ALLERGENS
-- ---------------------------------------------------------

revoke all
on function public.replace_recipe_allergens(
  uuid,
  jsonb
)
from public;

revoke all
on function public.replace_recipe_allergens(
  uuid,
  jsonb
)
from anon;

grant execute
on function public.replace_recipe_allergens(
  uuid,
  jsonb
)
to authenticated;


-- ---------------------------------------------------------
-- PUBLICATION STATUS
-- ---------------------------------------------------------

revoke all
on function public.set_recipe_status(
  uuid,
  text
)
from public;

revoke all
on function public.set_recipe_status(
  uuid,
  text
)
from anon;

grant execute
on function public.set_recipe_status(
  uuid,
  text
)
to authenticated;


-- ---------------------------------------------------------
-- DELETE RECIPE
-- ---------------------------------------------------------

revoke all
on function public.delete_recipe(
  uuid,
  text
)
from public;

revoke all
on function public.delete_recipe(
  uuid,
  text
)
from anon;

grant execute
on function public.delete_recipe(
  uuid,
  text
)
to authenticated;