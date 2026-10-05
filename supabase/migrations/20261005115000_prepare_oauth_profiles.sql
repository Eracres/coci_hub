-- =========================================================
-- CociHub
-- Prepare profiles for OAuth registration
-- =========================================================
--
-- Traditional email/password registration already sends a
-- CociHub username inside raw_user_meta_data.
--
-- OAuth providers such as Google do not know the CociHub
-- username yet.
--
-- Therefore:
--
--   email/password -> profile with username
--
--   OAuth          -> provisional profile with username NULL
--
-- OAuth users will complete their profile later through:
--
--   public.complete_my_profile(...)
--
-- Security:
--
--   role is ALWAYS assigned by PostgreSQL as "user".
--
-- OAuth metadata can never assign administrative privileges.
-- =========================================================



-- =========================================================
-- CREATE PROFILE AFTER AUTH USER CREATION
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

  v_avatar_url text;
begin

  -- -------------------------------------------------------
  -- USERNAME
  -- -------------------------------------------------------
  --
  -- Email/password registration sends username metadata.
  --
  -- OAuth registration normally does not.
  -- In that case username remains NULL until onboarding.
  -- -------------------------------------------------------

  v_username :=
    nullif(
      lower(
        btrim(
          coalesce(
            new.raw_user_meta_data
              ->> 'username',
            ''
          )
        )
      ),
      ''
    );


  if
    v_username is not null
    and v_username !~
      '^[a-z0-9_]{3,30}$'
  then

    raise exception
      'Invalid username'
      using errcode = '22023';

  end if;


  if
    v_username in (
      'admin',
      'administrator',
      'cocihub',
      'support',
      'system',
      'moderator'
    )
  then

    raise exception
      'Username is reserved'
      using errcode = '22023';

  end if;



  -- -------------------------------------------------------
  -- DISPLAY NAME
  -- -------------------------------------------------------
  --
  -- Provider metadata can use different fields.
  --
  -- Preference:
  --
  --   display_name
  --   full_name
  --   name
  --   email local-part
  -- -------------------------------------------------------

  v_display_name :=
    coalesce(
      nullif(
        btrim(
          new.raw_user_meta_data
            ->> 'display_name'
        ),
        ''
      ),

      nullif(
        btrim(
          new.raw_user_meta_data
            ->> 'full_name'
        ),
        ''
      ),

      nullif(
        btrim(
          new.raw_user_meta_data
            ->> 'name'
        ),
        ''
      ),

      nullif(
        split_part(
          coalesce(
            new.email,
            ''
          ),
          '@',
          1
        ),
        ''
      ),

      'Usuario CociHub'
    );



  -- -------------------------------------------------------
  -- AVATAR
  -- -------------------------------------------------------

  v_avatar_url :=
    coalesce(
      nullif(
        btrim(
          new.raw_user_meta_data
            ->> 'avatar_url'
        ),
        ''
      ),

      nullif(
        btrim(
          new.raw_user_meta_data
            ->> 'picture'
        ),
        ''
      )
    );



  -- -------------------------------------------------------
  -- CREATE PROFILE
  -- -------------------------------------------------------

  insert into public.profiles (
    id,
    display_name,
    username,
    role,
    avatar_url
  )
  values (
    new.id,

    v_display_name,

    v_username,

    'user'
      ::public.user_role,

    v_avatar_url
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



-- =========================================================
-- COMPLETE MY PROFILE
-- =========================================================
--
-- Used mainly after OAuth registration.
--
-- Only the authenticated user can complete their own profile.
--
-- The username can only be assigned while it is NULL.
-- Published identity changes will be designed separately.
-- =========================================================

create or replace function
public.complete_my_profile(
  p_username text,
  p_display_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;

  v_username text;

  v_display_name text;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then

    raise exception
      'Authentication required'
      using errcode = '42501';

  end if;



  -- -------------------------------------------------------
  -- USERNAME
  -- -------------------------------------------------------

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



  -- -------------------------------------------------------
  -- DISPLAY NAME
  -- -------------------------------------------------------

  v_display_name :=
    nullif(
      btrim(
        p_display_name
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



  -- -------------------------------------------------------
  -- UPDATE OWN PROVISIONAL PROFILE
  -- -------------------------------------------------------

  update public.profiles
  set
    username =
      v_username,

    display_name =
      coalesce(
        v_display_name,
        display_name,
        v_username
      ),

    updated_at =
      now()

  where id =
    v_user_id

    and username
      is null;


  if not found then

    raise exception
      'Profile is already complete or does not exist'
      using errcode = '42501';

  end if;



exception

  when unique_violation then

    raise exception
      'Username already exists'
      using errcode = '23505';

end;
$$;



-- =========================================================
-- COMPLETE PROFILE PERMISSIONS
-- =========================================================

revoke all
on function
public.complete_my_profile(
  text,
  text
)
from public;


revoke all
on function
public.complete_my_profile(
  text,
  text
)
from anon;


grant execute
on function
public.complete_my_profile(
  text,
  text
)
to authenticated;
