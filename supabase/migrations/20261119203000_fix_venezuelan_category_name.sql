-- =========================================================
-- FIX VENEZUELAN CUISINE CATEGORY NAME
-- =========================================================
--
-- The category was accidentally persisted as:
--
--   Cocina venezolada
--   cocina-venezolada
--
-- The canonical category configured by CociHub is:
--
--   Cocina venezolana
--   cocina-venezolana
--
-- The category ID is preserved, so existing recipe-category
-- relations remain intact.
-- =========================================================


do $$
declare
  affected_rows integer;
begin

  update public.categories
  set
    name = 'Cocina venezolana',
    slug = 'cocina-venezolana'
  where id = '074ecb91-8621-412a-b447-8e5928f08c08'
    and name = 'Cocina venezolada'
    and slug = 'cocina-venezolada';


  get diagnostics
    affected_rows = row_count;


  if affected_rows <> 1 then
    raise exception
      'Expected to update exactly one Venezuelan cuisine category, updated %',
      affected_rows;
  end if;

end;
$$;
