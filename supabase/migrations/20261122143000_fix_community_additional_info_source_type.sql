-- =========================================================
-- CociHub
-- Fix community additional-info recipe source type
-- =========================================================
--
-- public.recipes.source_type uses the PostgreSQL enum:
--
--   public.recipe_source_type
--
-- The community additional-info RPC accepts source type as
-- text so it can validate the incoming value explicitly.
--
-- The previous implementation validated the text correctly
-- but attempted to assign that text directly to the enum
-- column, causing PostgreSQL error:
--
--   42804
--   column "source_type" is of type public.recipe_source_type
--   but expression is of type text
--
-- This migration keeps the public RPC API unchanged and
-- casts the validated text to the database enum before the
-- update.
-- =========================================================


create or replace function
public.update_my_recipe_additional_info(
  p_recipe_id uuid,
  p_tips text,
  p_substitutions text,
  p_storage text,
  p_freezing text,
  p_reheating text,
  p_source_type text,
  p_source_title text,
  p_source_author text,
  p_source_page text,
  p_source_url text,
  p_source_notes text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_type_text
    text;

  v_source_type
    public.recipe_source_type;
begin

  -- =======================================================
  -- AUTHORIZATION
  -- =======================================================

  if not public.can_edit_recipe(
    p_recipe_id
  ) then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  -- =======================================================
  -- NORMALIZE SOURCE TYPE
  -- =======================================================

  v_source_type_text :=
    nullif(
      btrim(
        p_source_type
      ),
      ''
    );


  -- =======================================================
  -- VALIDATE SOURCE TYPE
  -- =======================================================

  if
    v_source_type_text
      is not null

    and

    v_source_type_text
      not in (
        'own',
        'family',
        'book',
        'magazine',
        'web',
        'handwritten',
        'other'
      )
  then
    raise exception
      'Invalid recipe source type'
      using errcode = '22023';
  end if;


  -- =======================================================
  -- CAST TO DATABASE ENUM
  -- =======================================================

  if
    v_source_type_text
      is null
  then
    v_source_type :=
      null;

  else
    v_source_type :=
      v_source_type_text
        ::public.recipe_source_type;
  end if;


  -- =======================================================
  -- UPDATE
  -- =======================================================

  update public.recipes
  set
    tips =
      nullif(
        btrim(
          p_tips
        ),
        ''
      ),

    substitutions =
      nullif(
        btrim(
          p_substitutions
        ),
        ''
      ),

    storage =
      nullif(
        btrim(
          p_storage
        ),
        ''
      ),

    freezing =
      nullif(
        btrim(
          p_freezing
        ),
        ''
      ),

    reheating =
      nullif(
        btrim(
          p_reheating
        ),
        ''
      ),

    source_type =
      v_source_type,

    source_title =
      nullif(
        btrim(
          p_source_title
        ),
        ''
      ),

    source_author =
      nullif(
        btrim(
          p_source_author
        ),
        ''
      ),

    source_page =
      nullif(
        btrim(
          p_source_page
        ),
        ''
      ),

    source_url =
      nullif(
        btrim(
          p_source_url
        ),
        ''
      ),

    source_notes =
      nullif(
        btrim(
          p_source_notes
        ),
        ''
      )

  where id =
    p_recipe_id;

end;
$$;


-- =========================================================
-- PERMISSIONS
-- =========================================================

revoke all
on function
public.update_my_recipe_additional_info(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from public;


revoke all
on function
public.update_my_recipe_additional_info(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
from anon;


grant execute
on function
public.update_my_recipe_additional_info(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
to authenticated;
