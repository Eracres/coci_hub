-- =========================================================
-- CociHub
-- Admin recipe comment moderation
-- =========================================================
--
-- Allows administrators to retrieve every recipe comment,
-- including hidden comments, for moderation purposes.
--
-- Mutations are already provided by:
--
--   admin_set_recipe_comment_hidden(...)
--   admin_delete_recipe_comment(...)
--
-- =========================================================


-- =========================================================
-- GET ADMIN RECIPE COMMENTS
-- =========================================================

create function
public.get_admin_recipe_comments()
returns table (
  comment_id uuid,
  recipe_id uuid,
  recipe_title text,
  recipe_slug text,
  author_id uuid,
  author_display_name text,
  author_avatar_url text,
  body text,
  is_hidden boolean,
  hidden_at timestamptz,
  hidden_by uuid,
  hidden_by_display_name text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin

  if auth.uid() is null
    or not public.is_admin()
  then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  return query

  select
    recipe_comment.id
      as comment_id,

    recipe_comment.recipe_id,

    recipe.title
      as recipe_title,

    recipe.slug
      as recipe_slug,

    recipe_comment.user_id
      as author_id,

    coalesce(
      nullif(
        trim(
          author_profile.display_name
        ),
        ''
      ),
      'Usuario'
    )
      as author_display_name,

    author_profile.avatar_url
      as author_avatar_url,

    recipe_comment.body,

    recipe_comment.is_hidden,

    recipe_comment.hidden_at,

    recipe_comment.hidden_by,

    case
      when recipe_comment.hidden_by
        is null
      then null

      else
        coalesce(
          nullif(
            trim(
              moderator_profile.display_name
            ),
            ''
          ),
          'Administrador'
        )
    end
      as hidden_by_display_name,

    recipe_comment.created_at,

    recipe_comment.updated_at

  from public.recipe_comments
    as recipe_comment

  join public.recipes
    as recipe
    on recipe.id =
      recipe_comment.recipe_id

  join public.profiles
    as author_profile
    on author_profile.id =
      recipe_comment.user_id

  left join public.profiles
    as moderator_profile
    on moderator_profile.id =
      recipe_comment.hidden_by

  order by
    recipe_comment.created_at desc;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function
public.get_admin_recipe_comments()
from public;


revoke all
on function
public.get_admin_recipe_comments()
from anon;


grant execute
on function
public.get_admin_recipe_comments()
to authenticated;


-- =========================================================
-- COMMENT
-- =========================================================

comment on function
public.get_admin_recipe_comments()
is
  'Returns all recipe comments, including hidden comments, to administrators for moderation.';
