-- =========================================================
-- CociHub
-- Prepare public user registration
-- =========================================================
--
-- Public registration needs every new Supabase Auth user
-- to receive a corresponding CociHub profile containing:
--
--   - id
--   - display_name
--   - username
--   - role = user
--
-- Security rule:
--
-- The role is NEVER read from user metadata.
--
-- Every public registration starts as:
--
--   role = user
--
-- Administrative privileges continue to be managed only
-- from trusted CociHub/database workflows.
-- =========================================================



-- =========================================================
-- USERNAME AVAILABILITY
-- =========================================================
--
-- The registration UI needs a safe way to determine whether
-- a public username can be used before attempting sign-up.
--
-- Usernames are public identifiers, so exposing whether a
-- username is already occupied does not reveal private
-- profile information.
--
-- PostgreSQL's UNIQUE index remains the final authority,
-- protecting against race conditions.
-- =========================================================

create or replace function
public.is_username_available(
  p_username text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    case

      when p_username is null then
        false

      when lower(
        btrim(
          p_username
        )
      ) !~
        '^[a-z0-9_]{3,30}$'
      then
        false

      when lower(
        btrim(
          p_username
        )
      ) in (
        'admin',
        'administrator',
        'cocihub',
        'support',
        'system',
        'moderator'
      )
      then
        false

      else
        not exists (
          select 1
          from public.profiles
            as profile
          where profile.username =
            lower(
              btrim(
                p_username
              )
            )
        )

    end;
$$;



-- =========================================================
-- USERNAME AVAILABILITY PERMISSIONS
-- =========================================================
--
-- Anonymous users need this RPC because registration occurs
-- before authentication.
-- =========================================================

revoke all
on function
public.is_username_available(
  text
)
from public;


grant execute
on function
public.is_username_available(
  text
)
to anon;


grant execute
on function
public.is_username_available(
  text
)
to authenticated;



-- =========================================================
-- CREATE PROFILE AFTER SUPABASE AUTH REGISTRATION
-- =========================================================
--
-- Supabase creates auth.users first.
--
-- The existing trigger:
--
--   on_auth_user_created
--
-- then calls this function.
--
-- Expected metadata:
--
--   username
--   display_name (optional)
--
-- Important:
--
--   role is ALWAYS assigned by PostgreSQL as "user".
--
-- A malicious client cannot become an administrator by
-- placing role="admin" inside raw_user_meta_data.
-- =========================================================

create or replace function
public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;

  v_display_name text;
begin

  -- -------------------------------------------------------
  -- USERNAME
  -- -------------------------------------------------------

  v_username :=
    lower(
      btrim(
        coalesce(
          new.raw_user_meta_data
            ->> 'username',
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



  -- -------------------------------------------------------
  -- DISPLAY NAME
  -- -------------------------------------------------------
  --
  -- display_name is optional.
  --
  -- For the first version of registration, username is used
  -- as the fallback public display name.
  -- -------------------------------------------------------

  v_display_name :=
    nullif(
      btrim(
        new.raw_user_meta_data
          ->> 'display_name'
      ),
      ''
    );



  -- -------------------------------------------------------
  -- CREATE COCIHUB PROFILE
  -- -------------------------------------------------------

  insert into public.profiles (
    id,
    display_name,
    username,
    role
  )
  values (
    new.id,

    coalesce(
      v_display_name,
      v_username
    ),

    v_username,

    'user'
      ::public.user_role
  );


  return new;



exception

  when unique_violation then

    raise exception
      'Username already exists'
      using errcode = '23505';

end;
$$;



-- =========================================================
-- TRIGGER FUNCTION PERMISSIONS
-- =========================================================
--
-- Applications never need to execute handle_new_user()
-- directly.
--
-- PostgreSQL invokes it through:
--
--   on_auth_user_created
-- =========================================================

revoke all
on function
public.handle_new_user()
from public;


revoke all
on function
public.handle_new_user()
from anon;


revoke all
on function
public.handle_new_user()
from authenticated;
