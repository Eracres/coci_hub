-- =========================================================
-- CociHub
-- Add safe food keyword resolution
-- =========================================================
--
-- Existing resolution order:
--
--   1. canonical exact match
--   2. alias exact match
--
-- This migration adds:
--
--   3. safe keyword / phrase match
--
-- Keywords are explicitly curated by administrators.
-- They are NOT fuzzy matches and are NOT automatically
-- inferred from food names.
--
-- Exact canonical / alias matches always have priority.
--
-- If more than one different food matches by keyword,
-- resolution becomes ambiguous instead of choosing one.
-- =========================================================



-- =========================================================
-- FOOD KEYWORDS
-- =========================================================

create table if not exists
public.food_keywords (
  id uuid
    primary key
    default gen_random_uuid(),

  food_item_id uuid
    not null
    references public.food_items(id)
    on delete cascade,

  keyword varchar(160)
    not null,

  normalized_keyword text
    generated always as (
      public.normalize_food_term(
        keyword
      )
    )
    stored,

  created_at timestamptz
    not null
    default now(),

  constraint food_keywords_keyword_not_blank_check
    check (
      btrim(keyword) <> ''
    )
);


create unique index if not exists
food_keywords_normalized_keyword_unique_idx
on public.food_keywords(
  normalized_keyword
);


create index if not exists
food_keywords_food_item_id_idx
on public.food_keywords(
  food_item_id
);



-- =========================================================
-- RLS
-- =========================================================

alter table public.food_keywords
enable row level security;


revoke all
on table public.food_keywords
from public;


revoke all
on table public.food_keywords
from anon;


revoke all
on table public.food_keywords
from authenticated;


grant
  select,
  insert,
  update,
  delete
on table public.food_keywords
to authenticated;



drop policy if exists
  "Authenticated users can read food keywords"
on public.food_keywords;


create policy
  "Authenticated users can read food keywords"
on public.food_keywords
for select
to authenticated
using (
  true
);


drop policy if exists
  "Admins can insert food keywords"
on public.food_keywords;


create policy
  "Admins can insert food keywords"
on public.food_keywords
for insert
to authenticated
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can update food keywords"
on public.food_keywords;


create policy
  "Admins can update food keywords"
on public.food_keywords
for update
to authenticated
using (
  (
    select public.is_admin()
  )
)
with check (
  (
    select public.is_admin()
  )
);


drop policy if exists
  "Admins can delete food keywords"
on public.food_keywords;


create policy
  "Admins can delete food keywords"
on public.food_keywords
for delete
to authenticated
using (
  (
    select public.is_admin()
  )
);



-- =========================================================
-- NORMALIZE KEYWORD MATCHING CONTEXT
-- =========================================================
--
-- Keyword matching should respect complete words / phrases.
--
-- Punctuation is converted to spaces before comparison:
--
--   "queso mascarpone, italiano"
--
-- becomes:
--
--   "queso mascarpone italiano"
--
-- This allows keyword:
--
--   "mascarpone"
--
-- to match safely without using arbitrary substring logic.
-- =========================================================

create or replace function
public.normalize_food_keyword_context(
  p_value text
)
returns text
language sql
immutable
strict
set search_path = ''
as $$

  select regexp_replace(
    regexp_replace(
      public.normalize_food_term(
        p_value
      ),
      '[[:punct:]]+',
      ' ',
      'g'
    ),
    '[[:space:]]+',
    ' ',
    'g'
  );

$$;


revoke all
on function
public.normalize_food_keyword_context(
  text
)
from public;


revoke all
on function
public.normalize_food_keyword_context(
  text
)
from anon;


grant execute
on function
public.normalize_food_keyword_context(
  text
)
to authenticated;



-- =========================================================
-- SAFE KEYWORD MATCH
-- =========================================================
--
-- Padding with spaces ensures complete word / phrase
-- matching.
--
-- Example:
--
-- keyword:
--   mascarpone
--
-- matches:
--   mascarpone
--   queso mascarpone
--   crema de mascarpone
--
-- but does not perform arbitrary substring matching.
-- =========================================================

create or replace function
public.food_term_contains_keyword(
  p_value text,
  p_keyword text
)
returns boolean
language sql
immutable
strict
set search_path = ''
as $$

  select position(
    ' ' ||
    public.normalize_food_keyword_context(
      p_keyword
    ) ||
    ' '

    in

    ' ' ||
    public.normalize_food_keyword_context(
      p_value
    ) ||
    ' '
  ) > 0;

$$;


revoke all
on function
public.food_term_contains_keyword(
  text,
  text
)
from public;


revoke all
on function
public.food_term_contains_keyword(
  text,
  text
)
from anon;


grant execute
on function
public.food_term_contains_keyword(
  text,
  text
)
to authenticated;



-- =========================================================
-- RESOLVE FOOD CATALOG ITEM
-- =========================================================
--
-- Resolution priority:
--
--   1. canonical exact match
--   2. alias exact match
--   3. safe keyword match
--
-- Keyword matching is only considered when there are no
-- exact canonical / alias candidates.
--
-- Multiple different keyword matches produce:
--
--   resolution_status = 'ambiguous'
--
-- UNKNOWN remains UNKNOWN.
-- =========================================================

create or replace function
public.resolve_food_catalog_item(
  p_value text
)
returns table (
  input_value text,
  normalized_value text,
  resolution_status text,
  food_item_id uuid,
  food_name varchar,
  matched_by text
)
language sql
stable
security invoker
set search_path = ''
as $$

  with normalized_input as (
    select
      case
        when nullif(
          btrim(
            p_value
          ),
          ''
        ) is null
        then null

        else
          public.normalize_food_term(
            p_value
          )
      end
        as normalized_value
  ),


  exact_candidates as (

    -- -----------------------------------------------------
    -- CANONICAL NAME MATCH
    -- -----------------------------------------------------

    select
      food.id
        as food_item_id,

      food.name
        as food_name,

      'canonical'::text
        as match_source

    from normalized_input
      as input

    join public.food_items
      as food

      on food.normalized_name =
        input.normalized_value

    where
      input.normalized_value
        is not null

      and food.is_active = true


    union all


    -- -----------------------------------------------------
    -- ALIAS MATCH
    -- -----------------------------------------------------

    select
      food.id
        as food_item_id,

      food.name
        as food_name,

      'alias'::text
        as match_source

    from normalized_input
      as input

    join public.food_aliases
      as food_alias

      on food_alias.normalized_alias =
        input.normalized_value

    join public.food_items
      as food

      on food.id =
        food_alias.food_item_id

    where
      input.normalized_value
        is not null

      and food.is_active = true

  ),


  grouped_exact_candidates as (
    select
      candidate.food_item_id,
      candidate.food_name,

      bool_or(
        candidate.match_source =
          'canonical'
      )
        as matched_canonical,

      bool_or(
        candidate.match_source =
          'alias'
      )
        as matched_alias

    from exact_candidates
      as candidate

    group by
      candidate.food_item_id,
      candidate.food_name
  ),


  exact_summary as (
    select
      count(*)::integer
        as match_count

    from grouped_exact_candidates
  ),


  keyword_candidates as (
    select distinct
      food.id
        as food_item_id,

      food.name
        as food_name

    from public.food_keywords
      as food_keyword

    join public.food_items
      as food

      on food.id =
        food_keyword.food_item_id

    cross join exact_summary
      as exact

    where exact.match_count = 0

      and food.is_active = true

      and nullif(
        btrim(
          p_value
        ),
        ''
      ) is not null

      and public.food_term_contains_keyword(
        p_value,
        food_keyword.keyword
      )
  ),


  keyword_summary as (
    select
      count(*)::integer
        as match_count

    from keyword_candidates
  ),


  single_exact_match as (
    select
      candidate.food_item_id,
      candidate.food_name,
      candidate.matched_canonical,
      candidate.matched_alias

    from grouped_exact_candidates
      as candidate

    cross join exact_summary
      as summary

    where summary.match_count = 1
  ),


  single_keyword_match as (
    select
      candidate.food_item_id,
      candidate.food_name

    from keyword_candidates
      as candidate

    cross join keyword_summary
      as summary

    where summary.match_count = 1
  )


  select
    p_value
      as input_value,

    input.normalized_value,


    case

      when input.normalized_value
        is null
      then
        'invalid'


      when exact.match_count = 1
      then
        'matched'


      when exact.match_count > 1
      then
        'ambiguous'


      when keyword.match_count = 1
      then
        'matched'


      when keyword.match_count > 1
      then
        'ambiguous'


      else
        'unknown'

    end
      as resolution_status,


    case

      when exact.match_count = 1
      then
        exact_match.food_item_id

      when
        exact.match_count = 0
        and keyword.match_count = 1
      then
        keyword_match.food_item_id

      else
        null

    end
      as food_item_id,


    case

      when exact.match_count = 1
      then
        exact_match.food_name

      when
        exact.match_count = 0
        and keyword.match_count = 1
      then
        keyword_match.food_name

      else
        null

    end
      as food_name,


    case

      when exact.match_count = 1
      then
        case

          when
            exact_match.matched_canonical
            and exact_match.matched_alias
          then
            'canonical+alias'


          when exact_match.matched_canonical
          then
            'canonical'


          when exact_match.matched_alias
          then
            'alias'


          else
            null

        end


      when
        exact.match_count = 0
        and keyword.match_count = 1
      then
        'keyword'


      else
        null

    end
      as matched_by


  from normalized_input
    as input

  cross join exact_summary
    as exact

  cross join keyword_summary
    as keyword

  left join single_exact_match
    as exact_match
    on true

  left join single_keyword_match
    as keyword_match
    on true;

$$;


revoke all
on function
public.resolve_food_catalog_item(
  text
)
from public;


revoke all
on function
public.resolve_food_catalog_item(
  text
)
from anon;


grant execute
on function
public.resolve_food_catalog_item(
  text
)
to authenticated;
