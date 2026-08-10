-- =========================================================
-- CociHub
-- Seed inicial
-- =========================================================


-- =========================================================
-- RECIPE TYPES
-- =========================================================

insert into public.recipe_types (
  name,
  slug,
  position
)
values
  ('Desayuno', 'breakfast', 1),
  ('Aperitivo', 'appetizer', 2),
  ('Entrante', 'starter', 3),
  ('Primer plato', 'first-course', 4),
  ('Segundo plato', 'second-course', 5),
  ('Plato único', 'main-course', 6),
  ('Guarnición', 'side-dish', 7),
  ('Ensalada', 'salad', 8),
  ('Sopas y cremas', 'soup', 9),
  ('Salsa', 'sauce', 10),
  ('Panes y masas', 'bread', 11),
  ('Postre', 'dessert', 12),
  ('Bebida', 'drink', 13),
  ('Snack', 'snack', 14),
  ('Conserva', 'preserve', 15),
  ('Repostería', 'pastry', 16)
on conflict (slug)
do update set
  name = excluded.name,
  position = excluded.position;


-- =========================================================
-- ALLERGENS
-- =========================================================

insert into public.allergens (
  name,
  slug,
  position
)
values
  ('Gluten', 'gluten', 1),
  ('Crustáceos', 'crustaceans', 2),
  ('Huevos', 'eggs', 3),
  ('Pescado', 'fish', 4),
  ('Cacahuetes', 'peanuts', 5),
  ('Soja', 'soy', 6),
  ('Leche', 'milk', 7),
  ('Frutos de cáscara', 'nuts', 8),
  ('Apio', 'celery', 9),
  ('Mostaza', 'mustard', 10),
  ('Sésamo', 'sesame', 11),
  ('Sulfitos', 'sulphites', 12),
  ('Altramuces', 'lupin', 13),
  ('Moluscos', 'molluscs', 14)
on conflict (slug)
do update set
  name = excluded.name,
  position = excluded.position;