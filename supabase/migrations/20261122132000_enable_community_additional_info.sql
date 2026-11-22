-- =========================================================
-- CociHub
-- Enable community recipe additional-info editing
-- =========================================================
--
-- Allows authenticated recipe authors to edit optional
-- additional information while the recipe remains editable.
--
-- Authorization continues to rely on can_edit_recipe(),
-- keeping the same security model as the other community
-- recipe editor RPCs.
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
  v_source_type text;
begin
  -- -------------------------------------------------------
  -- AUTHORIZATION
  -- -------------------------------------------------------

  if not public.can_edit_recipe(
    p_recipe_id
  ) then
    raise exception
      'Not authorized'
      using errcode = '42501';
  end if;


  -- -------------------------------------------------------
  -- SOURCE TYPE
  -- -------------------------------------------------------

  v_source_type :=
    nullif(
      btrim(
        p_source_type
      ),
      ''
    );


  if
    v_source_type is not null
    and v_source_type not in (
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


  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

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


revoke all
on function public.update_my_recipe_additional_info(
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


grant execute
on function public.update_my_recipe_additional_info(
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
