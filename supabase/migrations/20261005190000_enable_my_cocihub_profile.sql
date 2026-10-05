-- =========================================================
-- CociHub
-- Enable Mi CociHub profile management
-- =========================================================
--
-- This migration prepares the authenticated personal area.
--
-- It introduces:
--
--   1. Read access to recipes owned by the current user.
--
--   2. A controlled RPC for changing:
--
--        - display name
--        - username
--
-- Direct unrestricted UPDATE access to public.profiles is
-- intentionally NOT granted.
--
-- PostgreSQL remains the final authority for:
--
--   - authentication
--   - ownership
--   - username format
--   - username uniqueness
--   - reserved usernames
-- =========================================================



-- =========================================================
-- READ OWN RECIPES
-- =========================================================

drop policy if exists
  "Users can read own recipes"
on public.recipes;


create policy
  "Users can read own recipes"
on public.recipes
for select
to authenticated
using (
  author_id = (
    select auth.uid()
  )
);



-- =========================================================
-- UPDATE MY PROFILE
-- =========================================================

create or replace function
public.update_my_profile(
  p_display_name text,
  p_username text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;

  v_display_name text;

  v_username text;

  v_current_username text;
begin

  -- =======================================================
  -- AUTHENTICATION
  -- =======================================================

  v_user_id :=
    auth.uid();


  if v_user_id is null then

    raise exception
      'Authentication required'
      using errcode = '42501';

  end if;



  -- =======================================================
  -- CURRENT PROFILE
  -- =======================================================

  select
    profile.username

  into
    v_current_username

  from public.profiles
    as profile

  where profile.id =
    v_user_id;


  if not found then

    raise exception
      'Profile not found'
      using errcode = 'P0002';

  end if;



  -- =======================================================
  -- DISPLAY NAME
  -- =======================================================

  v_display_name :=
    nullif(
      btrim(
        coalesce(
          p_display_name,
          ''
        )
      ),
      ''
    );


  if
    v_display_name is not null
    and char_length(
      v_display_name
    ) > 120
  then

    raise exception
      'Display name cannot exceed 120 characters'
      using errcode = '22023';

  end if;



  -- =======================================================
  -- USERNAME
  -- =======================================================

  v_username :=
    lower(
      btrim(
        coalesce(
          p_username,
          ''
        )
      )
    );


  if v_username !~
    '^[a-z0-9_]{3,30}$'
  then

    raise exception
      'Invalid username'
      using errcode = '22023';

  end if;


  if v_username in (
    'admin',
    'administrator',
    'cocihub',
    'support',
    'system',
    'moderator'
  ) then

    raise exception
      'Username is reserved'
      using errcode = '22023';

  end if;



  -- =======================================================
  -- USERNAME AVAILABILITY
  -- =======================================================
  --
  -- Keeping the current username is valid.
  --
  -- If it changes, no other profile may already own it.
  -- =======================================================

  if
    v_username <>
    coalesce(
      v_current_username,
      ''
    )
    and exists (
      select 1

      from public.profiles
        as profile

      where profile.username =
        v_username

        and profile.id <>
          v_user_id
    )
  then

    raise exception
      'Username already exists'
      using errcode = '23505';

  end if;



  -- =======================================================
  -- UPDATE
  -- =======================================================

  update public.profiles
  set
    display_name =
      v_display_name,

    username =
      v_username,

    updated_at =
      now()

  where id =
    v_user_id;

end;
$$;



-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.update_my_profile(
  text,
  text
)
from public;


revoke all
on function
public.update_my_profile(
  text,
  text
)
from anon;


grant execute
on function
public.update_my_profile(
  text,
  text
)
to authenticated;
