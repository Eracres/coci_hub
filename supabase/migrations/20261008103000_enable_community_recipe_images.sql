-- =========================================================
-- CociHub
-- Enable community recipe image editing
-- =========================================================
--
-- Community users may manage the main image only when
-- public.can_edit_recipe(recipe_id) authorizes that recipe.
--
-- Valid Storage paths:
--
--   recipes/{recipe_id}/main.jpg
--   recipes/{recipe_id}/main.jpeg
--   recipes/{recipe_id}/main.png
--   recipes/{recipe_id}/main.webp
--
-- Existing administrative Storage policies remain intact.
-- =========================================================


-- =========================================================
-- 1. STORAGE PATH AUTHORIZATION HELPER
-- =========================================================

create or replace function
public.can_edit_recipe_image_object(
  p_name text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_parts text[];
  v_recipe_id uuid;
begin

  if p_name is null then
    return false;
  end if;


  v_parts :=
    string_to_array(
      p_name,
      '/'
    );


  if
    cardinality(
      v_parts
    ) <> 3
    or v_parts[1] <> 'recipes'
    or v_parts[3] !~
      '^main\.(jpg|jpeg|png|webp)$'
  then
    return false;
  end if;


  begin
    v_recipe_id :=
      v_parts[2]::uuid;

  exception
    when invalid_text_representation then
      return false;
  end;


  return public.can_edit_recipe(
    v_recipe_id
  );
end;
$$;


revoke all
on function
public.can_edit_recipe_image_object(
  text
)
from public;


revoke all
on function
public.can_edit_recipe_image_object(
  text
)
from anon;


grant execute
on function
public.can_edit_recipe_image_object(
  text
)
to authenticated;



-- =========================================================
-- 2. COMMUNITY STORAGE SELECT
-- =========================================================

drop policy if exists
  "recipe_images_community_select"
on storage.objects;


create policy
  "recipe_images_community_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.can_edit_recipe_image_object(
    name
  )
);



-- =========================================================
-- 3. COMMUNITY STORAGE INSERT
-- =========================================================

drop policy if exists
  "recipe_images_community_insert"
on storage.objects;


create policy
  "recipe_images_community_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and public.can_edit_recipe_image_object(
    name
  )
);



-- =========================================================
-- 4. COMMUNITY STORAGE UPDATE
-- =========================================================

drop policy if exists
  "recipe_images_community_update"
on storage.objects;


create policy
  "recipe_images_community_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.can_edit_recipe_image_object(
    name
  )
)
with check (
  bucket_id = 'recipe-images'
  and public.can_edit_recipe_image_object(
    name
  )
);



-- =========================================================
-- 5. COMMUNITY STORAGE DELETE
-- =========================================================

drop policy if exists
  "recipe_images_community_delete"
on storage.objects;


create policy
  "recipe_images_community_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.can_edit_recipe_image_object(
    name
  )
);



-- =========================================================
-- 6. UPDATE OWN RECIPE IMAGE
-- =========================================================

create or replace function
public.update_my_recipe_image(
  p_recipe_id uuid,
  p_image_path text,
  p_image_alt text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_image_path text;
  v_image_alt text;
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
  -- NORMALIZATION
  -- -------------------------------------------------------

  v_image_path :=
    nullif(
      btrim(
        p_image_path
      ),
      ''
    );


  v_image_alt :=
    nullif(
      btrim(
        p_image_alt
      ),
      ''
    );


  -- -------------------------------------------------------
  -- REMOVE IMAGE
  -- -------------------------------------------------------

  if v_image_path is null then

    update public.recipes
    set
      image_path = null,
      image_alt = null
    where id =
      p_recipe_id;


    return;
  end if;


  -- -------------------------------------------------------
  -- PATH VALIDATION
  -- -------------------------------------------------------

  if v_image_path !~
    (
      '^recipes/' ||
      p_recipe_id::text ||
      '/main\.(jpg|jpeg|png|webp)$'
    )
  then
    raise exception
      'Invalid recipe image path'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- ALT VALIDATION
  -- -------------------------------------------------------

  if
    v_image_alt is null
    or char_length(
      v_image_alt
    ) < 3
    or char_length(
      v_image_alt
    ) > 180
  then
    raise exception
      'Recipe image alt must contain between 3 and 180 characters'
      using errcode = '22023';
  end if;


  -- -------------------------------------------------------
  -- UPDATE
  -- -------------------------------------------------------

  update public.recipes
  set
    image_path =
      v_image_path,

    image_alt =
      v_image_alt
  where id =
    p_recipe_id;

end;
$$;


revoke all
on function
public.update_my_recipe_image(
  uuid,
  text,
  text
)
from public;


revoke all
on function
public.update_my_recipe_image(
  uuid,
  text,
  text
)
from anon;


grant execute
on function
public.update_my_recipe_image(
  uuid,
  text,
  text
)
to authenticated;
