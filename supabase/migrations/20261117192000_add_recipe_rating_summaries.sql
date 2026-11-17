-- =========================================================
-- CociHub
-- Batch recipe rating summaries
-- =========================================================
--
-- Returns public rating summaries for multiple published
-- recipes in a single database call.
--
-- This avoids making one rating query per RecipeCard.
-- =========================================================


create function
public.get_recipe_rating_summaries(
  p_recipe_ids uuid[]
)
returns table (
  recipe_id uuid,
  rating_count bigint,
  average_rating numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_recipes as (
    select distinct
      unnest(
        coalesce(
          p_recipe_ids,
          '{}'::uuid[]
        )
      ) as recipe_id
  )

  select
    requested.recipe_id,

    count(
      recipe_rating.id
    )::bigint
      as rating_count,

    round(
      avg(
        recipe_rating.rating
      )::numeric,
      2
    )
      as average_rating

  from requested_recipes
    as requested

  join public.recipes
    as recipe
    on recipe.id =
      requested.recipe_id
    and recipe.status =
      'published'
        ::public.recipe_status

  left join public.recipe_ratings
    as recipe_rating
    on recipe_rating.recipe_id =
      requested.recipe_id

  group by
    requested.recipe_id;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function
public.get_recipe_rating_summaries(
  uuid[]
)
from public;


grant execute
on function
public.get_recipe_rating_summaries(
  uuid[]
)
to anon;


grant execute
on function
public.get_recipe_rating_summaries(
  uuid[]
)
to authenticated;


-- =========================================================
-- COMMENTS
-- =========================================================

comment on function
public.get_recipe_rating_summaries(
  uuid[]
)
is
  'Returns rating count and average rating for multiple published recipes in one call.';

