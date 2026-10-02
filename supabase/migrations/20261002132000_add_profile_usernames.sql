-- =========================================================
-- CociHub
-- Add public usernames to user profiles
-- =========================================================
--
-- Community users need a unique public alias independent
-- from their internal UUID and optional display name.
--
-- During this migration:
--
--   1. username is introduced as temporarily nullable.
--   2. existing CociHub profiles receive their known aliases.
--   3. PostgreSQL validates the username format.
--   4. PostgreSQL guarantees username uniqueness.
--
-- username will become NOT NULL in a later migration after
-- the public registration flow and handle_new_user() trigger
-- have been updated and tested.
-- =========================================================


-- =========================================================
-- ADD USERNAME
-- =========================================================

alter table public.profiles
add column if not exists username varchar(30);


-- =========================================================
-- BACKFILL EXISTING PROFILES
-- =========================================================
--
-- These aliases correspond to the two profiles that already
-- exist before introducing public community registration.
-- =========================================================

update public.profiles
set username = 'shark215038'
where display_name = 'shark215038'
  and username is null;


update public.profiles
set username = 'cocihub2026'
where display_name = 'cocihub2026'
  and username is null;


-- =========================================================
-- USERNAME FORMAT
-- =========================================================
--
-- Rules:
--
--   - between 3 and 30 characters
--   - lowercase letters
--   - numbers
--   - underscore
--
-- NULL is temporarily accepted while registration support
-- is being implemented.
-- =========================================================

alter table public.profiles
drop constraint if exists profiles_username_format_check;


alter table public.profiles
add constraint profiles_username_format_check
check (
  username is null
  or username ~ '^[a-z0-9_]{3,30}$'
);


-- =========================================================
-- RESERVED USERNAMES
-- =========================================================
--
-- Prevent public users from adopting aliases that could
-- impersonate official CociHub/system accounts.
-- =========================================================

alter table public.profiles
drop constraint if exists profiles_username_reserved_check;


alter table public.profiles
add constraint profiles_username_reserved_check
check (
  username is null
  or username not in (
    'admin',
    'administrator',
    'cocihub',
    'support',
    'system',
    'moderator'
  )
);


-- =========================================================
-- UNIQUE USERNAME
-- =========================================================
--
-- Usernames are stored in lowercase, so a normal UNIQUE
-- constraint is sufficient to guarantee public uniqueness.
-- =========================================================

create unique index if not exists
profiles_username_unique_idx
on public.profiles(username)
where username is not null;
