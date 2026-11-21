-- =========================================================
-- COCIHUB
-- PROFILE DASHBOARD HERO
-- =========================================================
--
-- Allows each authenticated user to personalize the image
-- shown in the hero of their private "Mi CociHub" dashboard.
--
-- Supported sources:
--
--   preset
--     A CociHub-provided artwork identified by a stable key.
--
--   recipe
--     One of the authenticated user's recipes.
--
--   custom
--     A user-uploaded image stored in CociHub Storage.
--
-- When both fields are NULL, Mi CociHub keeps its automatic
-- fallback behaviour and uses an available recipe image.
-- =========================================================


-- =========================================================
-- PROFILE COLUMNS
-- =========================================================

alter table public.profiles
add column if not exists dashboard_hero_type varchar(16);


alter table public.profiles
add column if not exists dashboard_hero_value text;


-- =========================================================
-- HERO TYPE VALIDATION
-- =========================================================

alter table public.profiles
drop constraint if exists profiles_dashboard_hero_type_check;


alter table public.profiles
add constraint profiles_dashboard_hero_type_check
check (
  dashboard_hero_type is null
  or dashboard_hero_type in (
    'preset',
    'recipe',
    'custom'
  )
);


-- =========================================================
-- HERO PAIR VALIDATION
-- =========================================================
--
-- The source and its value must always exist together.
--
-- Valid:
--
--   NULL / NULL
--   preset / mediterranean-table
--   recipe / <recipe uuid>
--   custom / <storage path>
--
-- Invalid:
--
--   preset / NULL
--   NULL / some-value
-- =========================================================

alter table public.profiles
drop constraint if exists profiles_dashboard_hero_pair_check;


alter table public.profiles
add constraint profiles_dashboard_hero_pair_check
check (
  (
    dashboard_hero_type is null
    and dashboard_hero_value is null
  )
  or
  (
    dashboard_hero_type is not null
    and dashboard_hero_value is not null
  )
);


-- =========================================================
-- VALUE LENGTH
-- =========================================================

alter table public.profiles
drop constraint if exists profiles_dashboard_hero_value_length_check;


alter table public.profiles
add constraint profiles_dashboard_hero_value_length_check
check (
  dashboard_hero_value is null
  or char_length(
    dashboard_hero_value
  ) <= 500
);


-- =========================================================
-- SET MY DASHBOARD HERO
-- =========================================================

create or replace function public.set_my_dashboard_hero(
  p_hero_type text,
  p_hero_value text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;

  v_hero_type text;

  v_hero_value text;

  v_recipe_id uuid;
begin
  -- -------------------------------------------------------
  -- AUTHENTICATION
  -- -------------------------------------------------------

  v_user_id :=
    auth.uid();


  if
    v_user_id is null
  then
    raise exception
      'Authentication required'
      using errcode = '42501';
  end if;


  -- -------------------------------------------------------
  -- NORMALIZATION
  -- -------------------------------------------------------

  v_hero_type :=
    nullif(
      btrim(
        p_hero_type
      ),
      ''
    );


  v_hero_value :=
    nullif(
      btrim(
        p_hero_value
      ),
      ''
    );


  -- -------------------------------------------------------
  -- RESET TO AUTOMATIC HERO
  -- -------------------------------------------------------

  if
    v_hero_type is null
    and v_hero_value is null
  then
    update public.profiles
    set
      dashboard_hero_type =
        null,

      dashboard_hero_value =
        null,

      updated_at =
        now()
    where id =
      v_user_id;


    if not found then
      raise exception
        'Profile not found'
        using errcode = 'P0002';
    end if;


    return;
  end if;


  -- -------------------------------------------------------
  -- GENERAL VALIDATION
  -- -------------------------------------------------------

  if
    v_hero_type is null
    or v_hero_value is null
  then
    raise exception
      'Hero type and value must be provided together'
      using errcode = '22023';
  end if;


  if
    v_hero_type not in (
      'preset',
      'recipe',
      'custom'
    )
  then
    raise exception
      'Invalid dashboard hero type'
      using errcode = '22023';
  end if;


  if
    char_length(
      v_hero_value
    ) > 500
  then
    raise exception
      'Dashboard hero value is too long'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- PRESET
  -- -------------------------------------------------------
  --
  -- Preset keys are validated structurally here.
  --
  -- The application owns the actual preset catalogue, so
  -- adding new artwork does not require a database migration.
  -- -------------------------------------------------------

  if
    v_hero_type =
      'preset'
  then
    if
      v_hero_value !~
        '^[a-z0-9]+(-[a-z0-9]+)*$'
      or char_length(
        v_hero_value
      ) > 80
    then
      raise exception
        'Invalid dashboard hero preset'
        using errcode = '22023';
    end if;
  end if;


  -- -------------------------------------------------------
  -- RECIPE
  -- -------------------------------------------------------
  --
  -- Users may only select one of their own recipes and the
  -- selected recipe must already have an image.
  -- -------------------------------------------------------

  if
    v_hero_type =
      'recipe'
  then
    begin
      v_recipe_id :=
        v_hero_value::uuid;

    exception
      when invalid_text_representation then
        raise exception
          'Invalid recipe identifier'
          using errcode = '22023';
    end;


    if not exists (
      select
        1
      from public.recipes
      where id =
        v_recipe_id
        and author_id =
          v_user_id
        and image_path is not null
    ) then
      raise exception
        'Recipe cannot be used as dashboard hero'
        using errcode = '22023';
    end if;
  end if;


  -- -------------------------------------------------------
  -- CUSTOM IMAGE
  -- -------------------------------------------------------
  --
  -- Custom hero objects must live inside the authenticated
  -- user's own Storage directory.
  -- -------------------------------------------------------

  if
    v_hero_type =
      'custom'
  then
    if
      position(
        (
          v_user_id::text ||
          '/'
        )
        in v_hero_value
      ) != 1
    then
      raise exception
        'Invalid custom dashboard hero path'
        using errcode = '22023';
    end if;
  end if;


  -- -------------------------------------------------------
  -- UPDATE PROFILE
  -- -------------------------------------------------------

  update public.profiles
  set
    dashboard_hero_type =
      v_hero_type,

    dashboard_hero_value =
      v_hero_value,

    updated_at =
      now()
  where id =
    v_user_id;


  if not found then
    raise exception
      'Profile not found'
      using errcode = 'P0002';
  end if;
end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function public.set_my_dashboard_hero(
  text,
  text
)
from public;


grant execute
on function public.set_my_dashboard_hero(
  text,
  text
)
to authenticated;


-- =========================================================
-- DOCUMENTATION
-- =========================================================

comment on column public.profiles.dashboard_hero_type
is
  'Selected Mi CociHub hero source: preset, recipe or custom. NULL keeps the automatic fallback.';


comment on column public.profiles.dashboard_hero_value
is
  'Stable preset key, owned recipe UUID or user Storage path associated with dashboard_hero_type.';


comment on function public.set_my_dashboard_hero(
  text,
  text
)
is
  'Updates the authenticated user Mi CociHub hero selection after validating its source.';
