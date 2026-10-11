-- =========================================================
-- CociHub
-- Recipe notification context
-- =========================================================
--
-- Provides administrators with the minimum private data
-- required to send moderation notifications to an author.
--
-- The application does NOT need a service role key.
-- =========================================================


create or replace function
public.get_recipe_notification_context(
  p_recipe_id uuid
)
returns table (
  recipe_id uuid,
  recipe_title text,
  recipe_slug text,
  author_id uuid,
  author_email text,
  author_display_name text,
  author_username text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin

  -- =======================================================
  -- AUTHENTICATION
  -- =======================================================

  if auth.uid() is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- ADMINISTRATION
  -- =======================================================

  if not public.is_admin() then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- NOTIFICATION CONTEXT
  -- =======================================================

  return query

  select
    recipe.id,
    recipe.title::text,
    recipe.slug::text,
    recipe.author_id,
    auth_user.email::text,
    profile.display_name::text,
    profile.username::text

  from public.recipes
    as recipe

  join public.profiles
    as profile
    on profile.id =
      recipe.author_id

  join auth.users
    as auth_user
    on auth_user.id =
      recipe.author_id

  where recipe.id =
    p_recipe_id;


  if not found then
    raise exception
      'Recipe not found'
      using errcode = 'P0002';
  end if;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function
public.get_recipe_notification_context(
  uuid
)
from public;


revoke all
on function
public.get_recipe_notification_context(
  uuid
)
from anon;


grant execute
on function
public.get_recipe_notification_context(
  uuid
)
to authenticated;