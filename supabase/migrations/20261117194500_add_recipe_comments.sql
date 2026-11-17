-- =========================================================
-- CociHub
-- Recipe comments
-- =========================================================
--
-- Rules:
--
--   - only authenticated users can comment
--   - only published recipes can receive comments
--   - users can edit their own comments
--   - users can delete their own comments
--   - comments contain between 1 and 2000 characters
--   - public visitors can read visible comments
--   - administrators can hide/unhide comments
--   - administrators can permanently delete comments
--
-- Direct table access is intentionally restricted.
-- Reads and mutations are exposed through controlled RPCs.
-- =========================================================


-- =========================================================
-- TABLE
-- =========================================================

create table public.recipe_comments (
  id uuid primary key
    default gen_random_uuid(),

  recipe_id uuid not null
    references public.recipes(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  body text not null
    check (
      char_length(body)
      between 1 and 2000
    ),

  is_hidden boolean not null
    default false,

  hidden_at timestamptz,

  hidden_by uuid
    references public.profiles(id)
    on delete set null,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint recipe_comments_hidden_state_check
    check (
      (
        is_hidden = false
        and hidden_at is null
        and hidden_by is null
      )
      or
      (
        is_hidden = true
      )
    )
);


create index
recipe_comments_recipe_created_at_idx
on public.recipe_comments(
  recipe_id,
  created_at desc
);


create index
recipe_comments_user_id_idx
on public.recipe_comments(
  user_id
);


create index
recipe_comments_visible_recipe_idx
on public.recipe_comments(
  recipe_id,
  created_at desc
)
where is_hidden = false;


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.recipe_comments
enable row level security;


revoke all
on table public.recipe_comments
from public;


revoke all
on table public.recipe_comments
from anon;


revoke all
on table public.recipe_comments
from authenticated;


-- =========================================================
-- GET PUBLIC RECIPE COMMENTS
-- =========================================================

create function
public.get_recipe_comments(
  p_recipe_id uuid
)
returns table (
  comment_id uuid,
  author_id uuid,
  author_display_name text,
  author_avatar_url text,
  body text,
  created_at timestamptz,
  updated_at timestamptz,
  is_own boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    recipe_comment.id
      as comment_id,

    recipe_comment.user_id
      as author_id,

    coalesce(
      nullif(
        trim(
          profile.display_name
        ),
        ''
      ),
      'Usuario'
    )
      as author_display_name,

    profile.avatar_url
      as author_avatar_url,

    recipe_comment.body,

    recipe_comment.created_at,

    recipe_comment.updated_at,

    (
      recipe_comment.user_id =
      auth.uid()
    )
      as is_own

  from public.recipe_comments
    as recipe_comment

  join public.profiles
    as profile
    on profile.id =
      recipe_comment.user_id

  join public.recipes
    as recipe
    on recipe.id =
      recipe_comment.recipe_id

  where recipe_comment.recipe_id =
    p_recipe_id

    and recipe.status =
      'published'
        ::public.recipe_status

    and recipe_comment.is_hidden =
      false

  order by
    recipe_comment.created_at desc;
$$;


-- =========================================================
-- CREATE COMMENT
-- =========================================================

create function
public.add_recipe_comment(
  p_recipe_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_body text;
  v_comment_id uuid;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  if not exists (
    select 1
    from public.profiles
    where id =
      v_user_id
  ) then
    raise exception
      'User profile not found'
      using errcode = 'P0002';
  end if;


  if not exists (
    select 1
    from public.recipes
    where id =
      p_recipe_id
      and status =
        'published'
          ::public.recipe_status
  ) then
    raise exception
      'Published recipe not found'
      using errcode = 'P0002';
  end if;


  v_body :=
    trim(
      coalesce(
        p_body,
        ''
      )
    );


  if v_body = '' then
    raise exception
      'Comment body is required'
      using errcode = '22023';
  end if;


  if char_length(
    v_body
  ) > 2000 then
    raise exception
      'Comment body is too long'
      using errcode = '22023';
  end if;


  insert into public.recipe_comments (
    recipe_id,
    user_id,
    body
  )
  values (
    p_recipe_id,
    v_user_id,
    v_body
  )
  returning id
  into v_comment_id;


  return
    v_comment_id;

end;
$$;


-- =========================================================
-- UPDATE OWN COMMENT
-- =========================================================

create function
public.update_recipe_comment(
  p_comment_id uuid,
  p_body text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_body text;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  v_body :=
    trim(
      coalesce(
        p_body,
        ''
      )
    );


  if v_body = '' then
    raise exception
      'Comment body is required'
      using errcode = '22023';
  end if;


  if char_length(
    v_body
  ) > 2000 then
    raise exception
      'Comment body is too long'
      using errcode = '22023';
  end if;


  update public.recipe_comments
  set
    body =
      v_body,

    updated_at =
      now()

  where id =
    p_comment_id

    and user_id =
      v_user_id

    and is_hidden =
      false;


  if not found then
    raise exception
      'Comment not found or not authorized'
      using errcode = '42501';
  end if;

end;
$$;


-- =========================================================
-- DELETE OWN COMMENT
-- =========================================================

create function
public.delete_recipe_comment(
  p_comment_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  delete from public.recipe_comments
  where id =
    p_comment_id
    and user_id =
      v_user_id;


  if not found then
    raise exception
      'Comment not found or not authorized'
      using errcode = '42501';
  end if;

end;
$$;


-- =========================================================
-- ADMIN HIDE / UNHIDE COMMENT
-- =========================================================

create function
public.admin_set_recipe_comment_hidden(
  p_comment_id uuid,
  p_hidden boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin

  v_admin_id :=
    auth.uid();


  if v_admin_id is null
    or not public.is_admin()
  then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  update public.recipe_comments
  set
    is_hidden =
      p_hidden,

    hidden_at =
      case
        when p_hidden
          then now()
        else null
      end,

    hidden_by =
      case
        when p_hidden
          then v_admin_id
        else null
      end

  where id =
    p_comment_id;


  if not found then
    raise exception
      'Comment not found'
      using errcode = 'P0002';
  end if;

end;
$$;


-- =========================================================
-- ADMIN DELETE COMMENT
-- =========================================================

create function
public.admin_delete_recipe_comment(
  p_comment_id uuid
)
returns void
language plpgsql
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


  delete from public.recipe_comments
  where id =
    p_comment_id;


  if not found then
    raise exception
      'Comment not found'
      using errcode = 'P0002';
  end if;

end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.get_recipe_comments(uuid)
from public;


grant execute
on function public.get_recipe_comments(uuid)
to anon;


grant execute
on function public.get_recipe_comments(uuid)
to authenticated;



revoke all
on function public.add_recipe_comment(uuid, text)
from public;


revoke all
on function public.add_recipe_comment(uuid, text)
from anon;


grant execute
on function public.add_recipe_comment(uuid, text)
to authenticated;



revoke all
on function public.update_recipe_comment(uuid, text)
from public;


revoke all
on function public.update_recipe_comment(uuid, text)
from anon;


grant execute
on function public.update_recipe_comment(uuid, text)
to authenticated;



revoke all
on function public.delete_recipe_comment(uuid)
from public;


revoke all
on function public.delete_recipe_comment(uuid)
from anon;


grant execute
on function public.delete_recipe_comment(uuid)
to authenticated;



revoke all
on function public.admin_set_recipe_comment_hidden(uuid, boolean)
from public;


revoke all
on function public.admin_set_recipe_comment_hidden(uuid, boolean)
from anon;


grant execute
on function public.admin_set_recipe_comment_hidden(uuid, boolean)
to authenticated;



revoke all
on function public.admin_delete_recipe_comment(uuid)
from public;


revoke all
on function public.admin_delete_recipe_comment(uuid)
from anon;


grant execute
on function public.admin_delete_recipe_comment(uuid)
to authenticated;


-- =========================================================
-- COMMENTS
-- =========================================================

comment on table
public.recipe_comments
is
  'Stores user comments attached to recipes.';


comment on function
public.get_recipe_comments(uuid)
is
  'Returns visible comments for a published recipe.';


comment on function
public.add_recipe_comment(uuid, text)
is
  'Creates a comment by the authenticated user on a published recipe.';


comment on function
public.update_recipe_comment(uuid, text)
is
  'Updates a visible comment owned by the authenticated user.';


comment on function
public.delete_recipe_comment(uuid)
is
  'Deletes a comment owned by the authenticated user.';


comment on function
public.admin_set_recipe_comment_hidden(uuid, boolean)
is
  'Allows an administrator to hide or restore a recipe comment.';


comment on function
public.admin_delete_recipe_comment(uuid)
is
  'Allows an administrator to permanently delete a recipe comment.';
