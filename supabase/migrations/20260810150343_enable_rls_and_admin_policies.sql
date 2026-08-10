-- =========================================================
-- CociHub
-- Row Level Security + Admin Policies
-- =========================================================


-- =========================================================
-- 1. HELPER FUNCTION: IS ADMIN
-- =========================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;


-- Impedimos ejecución indiscriminada.
revoke all
on function public.is_admin()
from public;

grant execute
on function public.is_admin()
to authenticated;



-- =========================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =========================================================

alter table public.profiles
enable row level security;

alter table public.recipe_types
enable row level security;

alter table public.categories
enable row level security;

alter table public.tags
enable row level security;

alter table public.allergens
enable row level security;

alter table public.recipes
enable row level security;

alter table public.recipe_categories
enable row level security;

alter table public.recipe_tags
enable row level security;

alter table public.ingredient_groups
enable row level security;

alter table public.ingredients
enable row level security;

alter table public.recipe_steps
enable row level security;

alter table public.recipe_allergens
enable row level security;



-- =========================================================
-- 3. PROFILES
-- =========================================================

-- Un usuario autenticado solo puede leer su perfil.
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
);


-- Los administradores pueden leer todos los perfiles.
create policy "Admins can read all profiles"
on public.profiles
for select
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 4. RECIPE TYPES
-- =========================================================

create policy "Recipe types are publicly readable"
on public.recipe_types
for select
to anon, authenticated
using (true);


create policy "Admins can insert recipe types"
on public.recipe_types
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update recipe types"
on public.recipe_types
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete recipe types"
on public.recipe_types
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 5. CATEGORIES
-- =========================================================

create policy "Categories are publicly readable"
on public.categories
for select
to anon, authenticated
using (true);


create policy "Admins can insert categories"
on public.categories
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update categories"
on public.categories
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete categories"
on public.categories
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 6. TAGS
-- =========================================================

create policy "Tags are publicly readable"
on public.tags
for select
to anon, authenticated
using (true);


create policy "Admins can insert tags"
on public.tags
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update tags"
on public.tags
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete tags"
on public.tags
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 7. ALLERGENS
-- =========================================================

create policy "Allergens are publicly readable"
on public.allergens
for select
to anon, authenticated
using (true);


create policy "Admins can insert allergens"
on public.allergens
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update allergens"
on public.allergens
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete allergens"
on public.allergens
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 8. RECIPES
-- =========================================================

-- Los visitantes y usuarios normales solamente pueden
-- consultar recetas publicadas.
create policy "Published recipes are publicly readable"
on public.recipes
for select
to anon, authenticated
using (
  status = 'published'
);


-- Admin puede consultar cualquier receta:
-- draft, published y archived.
create policy "Admins can read all recipes"
on public.recipes
for select
to authenticated
using (
  (select public.is_admin())
);


-- Solo admin puede crear recetas.
-- Además, inicialmente solamente puede crearlas a su nombre.
create policy "Admins can insert recipes"
on public.recipes
for insert
to authenticated
with check (
  (select public.is_admin())
  and author_id = (select auth.uid())
);


create policy "Admins can update recipes"
on public.recipes
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete recipes"
on public.recipes
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 9. RECIPE CATEGORIES
-- =========================================================

create policy "Public can read categories of published recipes"
on public.recipe_categories
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_categories.recipe_id
      and recipes.status = 'published'
  )
);


create policy "Admins can read all recipe categories"
on public.recipe_categories
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert recipe categories"
on public.recipe_categories
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can delete recipe categories"
on public.recipe_categories
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 10. RECIPE TAGS
-- =========================================================

create policy "Public can read tags of published recipes"
on public.recipe_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_tags.recipe_id
      and recipes.status = 'published'
  )
);


create policy "Admins can read all recipe tags"
on public.recipe_tags
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert recipe tags"
on public.recipe_tags
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can delete recipe tags"
on public.recipe_tags
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 11. INGREDIENT GROUPS
-- =========================================================

create policy "Public can read groups of published recipes"
on public.ingredient_groups
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = ingredient_groups.recipe_id
      and recipes.status = 'published'
  )
);


create policy "Admins can read all ingredient groups"
on public.ingredient_groups
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert ingredient groups"
on public.ingredient_groups
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update ingredient groups"
on public.ingredient_groups
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete ingredient groups"
on public.ingredient_groups
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 12. INGREDIENTS
-- =========================================================

create policy "Public can read ingredients of published recipes"
on public.ingredients
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.ingredient_groups
    join public.recipes
      on recipes.id = ingredient_groups.recipe_id
    where ingredient_groups.id = ingredients.ingredient_group_id
      and recipes.status = 'published'
  )
);


create policy "Admins can read all ingredients"
on public.ingredients
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert ingredients"
on public.ingredients
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update ingredients"
on public.ingredients
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete ingredients"
on public.ingredients
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 13. RECIPE STEPS
-- =========================================================

create policy "Public can read steps of published recipes"
on public.recipe_steps
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.status = 'published'
  )
);


create policy "Admins can read all recipe steps"
on public.recipe_steps
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert recipe steps"
on public.recipe_steps
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update recipe steps"
on public.recipe_steps
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete recipe steps"
on public.recipe_steps
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 14. RECIPE ALLERGENS
-- =========================================================

create policy "Public can read allergens of published recipes"
on public.recipe_allergens
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.recipes
    where recipes.id = recipe_allergens.recipe_id
      and recipes.status = 'published'
  )
);


create policy "Admins can read all recipe allergens"
on public.recipe_allergens
for select
to authenticated
using (
  (select public.is_admin())
);


create policy "Admins can insert recipe allergens"
on public.recipe_allergens
for insert
to authenticated
with check (
  (select public.is_admin())
);


create policy "Admins can update recipe allergens"
on public.recipe_allergens
for update
to authenticated
using (
  (select public.is_admin())
)
with check (
  (select public.is_admin())
);


create policy "Admins can delete recipe allergens"
on public.recipe_allergens
for delete
to authenticated
using (
  (select public.is_admin())
);



-- =========================================================
-- 15. BASE SQL PRIVILEGES
-- =========================================================

-- Quitamos permisos genéricos.
revoke all
on all tables in schema public
from anon;

revoke all
on all tables in schema public
from authenticated;



-- =========================================================
-- 16. ANONYMOUS PERMISSIONS
-- =========================================================

-- Un visitante únicamente necesita SELECT sobre el contenido
-- públicamente accesible. RLS decidirá qué filas puede ver.
grant select
on public.recipe_types,
   public.categories,
   public.tags,
   public.allergens,
   public.recipes,
   public.recipe_categories,
   public.recipe_tags,
   public.ingredient_groups,
   public.ingredients,
   public.recipe_steps,
   public.recipe_allergens
to anon;



-- =========================================================
-- 17. AUTHENTICATED READ PERMISSIONS
-- =========================================================

grant select
on public.profiles,
   public.recipe_types,
   public.categories,
   public.tags,
   public.allergens,
   public.recipes,
   public.recipe_categories,
   public.recipe_tags,
   public.ingredient_groups,
   public.ingredients,
   public.recipe_steps,
   public.recipe_allergens
to authenticated;



-- =========================================================
-- 18. AUTHENTICATED WRITE PERMISSIONS
-- =========================================================

-- El GRANT permite intentar la operación.
-- Las policies RLS deciden si ese usuario concreto puede
-- realizarla.

grant insert, update, delete
on public.recipes,
   public.recipe_types,
   public.categories,
   public.tags,
   public.allergens,
   public.ingredient_groups,
   public.ingredients,
   public.recipe_steps,
   public.recipe_allergens
to authenticated;


-- Tablas puente: no necesitamos UPDATE.
grant insert, delete
on public.recipe_categories,
   public.recipe_tags
to authenticated;