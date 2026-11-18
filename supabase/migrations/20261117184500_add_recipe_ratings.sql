-- =========================================================
-- CociHub
-- Recipe ratings
-- =========================================================
--
-- Rules:
--
--   - ratings use values from 1 to 5
--   - one rating per user and recipe
--   - users can change their rating
--   - users can remove their rating
--   - only published recipes can receive ratings
--   - public visitors can read aggregate rating data
--   - authenticated users can also obtain their own rating
--
-- Mutations are performed through controlled RPC functions.
-- =========================================================


-- =========================================================
-- TABLE
-- =========================================================

create table public.recipe_ratings (
  id uuid primary key
    default gen_random_uuid(),

  recipe_id uuid not null
    references public.recipes(id)
    on delete cascade,

  user_id uuid not null
    references public.profiles(id)
    on delete cascade,

  rating smallint not null
    check (
      rating between 1 and 5
    ),

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint recipe_ratings_recipe_user_unique
    unique (
      recipe_id,
      user_id
    )
);


create index
recipe_ratings_user_id_idx
on public.recipe_ratings(
  user_id
);


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.recipe_ratings
enable row level security;


revoke all
on table public.recipe_ratings
from public;


revoke all
on table public.recipe_ratings
from anon;


revoke all
on table public.recipe_ratings
from authenticated;


grant select
on table public.recipe_ratings
to authenticated;


create policy
"Users can read own recipe ratings"
on public.recipe_ratings
for select
to authenticated
using (
  user_id = (
    select auth.uid()
  )
  or (
    select public.is_admin()
  )
);


-- =========================================================
-- SET RECIPE RATING
-- =========================================================

create function
public.set_recipe_rating(
  p_recipe_id uuid,
  p_rating integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_recipe_status public.recipe_status;
begin

  v_user_id :=
    auth.uid();


  if v_user_id is null then
    raise exception
      'Not authenticated'
      using errcode = '42501';
  end if;


  if p_rating is null
    or p_rating < 1
    or p_rating > 5
  then
    raise exception
      'Recipe rating must be between 1 and 5'
      using errcode = '22023';
  end if;


  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
  ) then
    raise exception
      'User profile not found'
      using errcode = 'P0002';
  end if;


  select
    recipe.status
  into
    v_recipe_status
  from public.recipes as recipe
  where recipe.id =
    p_recipe_id;


  if not found then
    raise exception
      'Recipe not found'
      using errcode = 'P0002';
  end if;


  if v_recipe_status <>
    'published'
      ::public.recipe_status
  then
    raise exception
      'Only published recipes can be rated'
      using errcode = '22023';
  end if;


  insert into public.recipe_ratings (
    recipe_id,
    user_id,
    rating
  )
  values (
    p_recipe_id,
    v_user_id,
    p_rating::smallint
  )

  on conflict (
    recipe_id,
    user_id
  )

  do update
  set
    rating =
      excluded.rating,

    updated_at =
      now();

end;
$$;


-- =========================================================
-- DELETE RECIPE RATING
-- =========================================================

create function
public.delete_recipe_rating(
  p_recipe_id uuid
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


  delete from public.recipe_ratings
  where recipe_id =
    p_recipe_id
    and user_id =
      v_user_id;

end;
$$;


-- =========================================================
-- RATING SUMMARY
-- =========================================================

create function
public.get_recipe_rating_summary(
  p_recipe_id uuid
)
returns table (
  rating_count bigint,
  average_rating numeric,
  current_user_rating smallint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin

  if not exists (
    select 1
    from public.recipes as recipe
    where recipe.id =
      p_recipe_id
      and recipe.status =
        'published'
          ::public.recipe_status
  ) then

    return query

    select
      0::bigint,
      null::numeric,
      null::smallint;

    return;

  end if;


  return query

  select
    count(*)::bigint
      as rating_count,

    round(
      avg(
        recipe_rating.rating
      )::numeric,
      2
    )
      as average_rating,

    (
      select
        own_rating.rating
      from public.recipe_ratings
        as own_rating
      where own_rating.recipe_id =
        p_recipe_id
        and own_rating.user_id =
          auth.uid()
      limit 1
    )::smallint
      as current_user_rating

  from public.recipe_ratings
    as recipe_rating

  where recipe_rating.recipe_id =
    p_recipe_id;

end;
$$;


-- =========================================================
-- FUNCTION PERMISSIONS
-- =========================================================

revoke all
on function
public.set_recipe_rating(
  uuid,
  integer
)
from public;


revoke all
on function
public.set_recipe_rating(
  uuid,
  integer
)
from anon;


grant execute
on function
public.set_recipe_rating(
  uuid,
  integer
)
to authenticated;



revoke all
on function
public.delete_recipe_rating(
  uuid
)
from public;


revoke all
on function
public.delete_recipe_rating(
  uuid
)
from anon;


grant execute
on function
public.delete_recipe_rating(
  uuid
)
to authenticated;



revoke all
on function
public.get_recipe_rating_summary(
  uuid
)
from public;


grant execute
on function
public.get_recipe_rating_summary(
  uuid
)
to anon;


grant execute
on function
public.get_recipe_rating_summary(
  uuid
)
to authenticated;


-- =========================================================
-- COMMENTS
-- =========================================================

comment on table
public.recipe_ratings
is
  'Stores one 1-to-5 star rating per user and recipe.';


comment on function
public.set_recipe_rating(
  uuid,
  integer
)
is
  'Creates or updates the authenticated user rating for a published recipe.';


comment on function
public.delete_recipe_rating(
  uuid
)
is
  'Deletes the authenticated user rating for a recipe.';


comment on function
public.get_recipe_rating_summary(
  uuid
)
is
  'Returns rating count, average rating and the authenticated user rating for a published recipe.';
