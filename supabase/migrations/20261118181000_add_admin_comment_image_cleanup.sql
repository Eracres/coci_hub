-- =========================================================
-- CociHub
-- Admin recipe comment deletion with image cleanup metadata
-- =========================================================
--
-- Deletes one recipe comment and returns the private Storage
-- paths that were attached to it.
--
-- Storage objects are removed afterwards by the server-side
-- service. This keeps the database deletion atomic while
-- allowing orphaned Storage files to be cleaned safely.
--
-- =========================================================


create function
public.admin_delete_recipe_comment_with_images(
  p_comment_id uuid
)
returns text[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_image_paths text[];
begin

  -- =======================================================
  -- AUTHORIZATION
  -- =======================================================

  if auth.uid() is null
    or not public.is_admin()
  then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- LOAD IMAGE PATHS
  -- =======================================================

  select
    recipe_comment.image_paths

  into
    v_image_paths

  from public.recipe_comments
    as recipe_comment

  where recipe_comment.id =
    p_comment_id;


  if not found then
    raise exception
      'Comment not found'
      using errcode = 'P0002';
  end if;


  -- =======================================================
  -- DELETE COMMENT
  -- =======================================================

  delete from public.recipe_comments
  where id =
    p_comment_id;


  -- =======================================================
  -- RETURN STORAGE PATHS
  -- =======================================================

  return coalesce(
    v_image_paths,
    '{}'::text[]
  );

end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.admin_delete_recipe_comment_with_images(uuid)
from public;


revoke all
on function
public.admin_delete_recipe_comment_with_images(uuid)
from anon;


grant execute
on function
public.admin_delete_recipe_comment_with_images(uuid)
to authenticated;


-- =========================================================
-- COMMENT
-- =========================================================

comment on function
public.admin_delete_recipe_comment_with_images(uuid)
is
  'Deletes one recipe comment as an administrator and returns its private Storage image paths for server-side cleanup.';
