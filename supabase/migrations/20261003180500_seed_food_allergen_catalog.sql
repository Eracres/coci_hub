-- =========================================================
-- CociHub
-- Seed initial deterministic food allergen catalog
-- =========================================================
--
-- This migration introduces the first curated foods used
-- by the deterministic CociHub allergen detection engine.
--
-- IMPORTANT DESIGN RULE:
--
-- Only food -> allergen relations considered sufficiently
-- deterministic are stored here.
--
-- Product-dependent relations must NOT be inferred.
--
-- Examples intentionally avoided:
--
--   mayonnaise
--   soy sauce
--   industrial sauces
--   prepared breads
--   commercial broths
--   processed meats
--
-- Their composition may vary between brands and recipes.
--
-- The catalog can be expanded progressively through the
-- administrator moderation system.
-- =========================================================



-- =========================================================
-- CANONICAL FOOD ITEMS
-- =========================================================

insert into public.food_items (
  name,
  slug
)
select
  seed.name,
  seed.slug
from (
  values

    -- -----------------------------------------------------
    -- CEREALS CONTAINING GLUTEN
    -- -----------------------------------------------------

    (
      'Harina de trigo',
      'wheat-flour'
    ),

    (
      'Sémola de trigo',
      'wheat-semolina'
    ),

    (
      'Trigo',
      'wheat'
    ),

    (
      'Espelta',
      'spelt'
    ),

    (
      'Centeno',
      'rye'
    ),

    (
      'Cebada',
      'barley'
    ),


    -- -----------------------------------------------------
    -- CRUSTACEANS
    -- -----------------------------------------------------

    (
      'Gamba',
      'prawn'
    ),

    (
      'Langostino',
      'king-prawn'
    ),

    (
      'Cangrejo',
      'crab'
    ),


    -- -----------------------------------------------------
    -- EGGS
    -- -----------------------------------------------------

    (
      'Huevo de gallina',
      'chicken-egg'
    ),


    -- -----------------------------------------------------
    -- FISH
    -- -----------------------------------------------------

    (
      'Salmón',
      'salmon'
    ),

    (
      'Atún',
      'tuna'
    ),

    (
      'Bacalao',
      'cod'
    ),


    -- -----------------------------------------------------
    -- PEANUTS
    -- -----------------------------------------------------

    (
      'Cacahuete',
      'peanut'
    ),


    -- -----------------------------------------------------
    -- SOY
    -- -----------------------------------------------------

    (
      'Soja',
      'soybean'
    ),

    (
      'Tofu',
      'tofu'
    ),


    -- -----------------------------------------------------
    -- MILK
    -- -----------------------------------------------------

    (
      'Leche de vaca',
      'cow-milk'
    ),

    (
      'Mantequilla',
      'butter'
    ),

    (
      'Queso parmesano',
      'parmesan-cheese'
    ),

    (
      'Yogur de leche de vaca',
      'cow-milk-yogurt'
    ),


    -- -----------------------------------------------------
    -- TREE NUTS
    -- -----------------------------------------------------

    (
      'Almendra',
      'almond'
    ),

    (
      'Nuez',
      'walnut'
    ),

    (
      'Avellana',
      'hazelnut'
    ),


    -- -----------------------------------------------------
    -- CELERY
    -- -----------------------------------------------------

    (
      'Apio',
      'celery'
    ),


    -- -----------------------------------------------------
    -- MUSTARD
    -- -----------------------------------------------------

    (
      'Semillas de mostaza',
      'mustard-seeds'
    ),


    -- -----------------------------------------------------
    -- SESAME
    -- -----------------------------------------------------

    (
      'Semillas de sésamo',
      'sesame-seeds'
    ),

    (
      'Tahini',
      'tahini'
    ),


    -- -----------------------------------------------------
    -- SULPHITES
    -- -----------------------------------------------------
    --
    -- These are explicit sulphite additives.
    -- We do NOT assume that generic foods or drinks
    -- automatically contain sulphites.
    -- -----------------------------------------------------

    (
      'Dióxido de azufre',
      'sulphur-dioxide'
    ),

    (
      'Metabisulfito de sodio',
      'sodium-metabisulphite'
    ),


    -- -----------------------------------------------------
    -- LUPIN
    -- -----------------------------------------------------

    (
      'Altramuz',
      'lupin'
    ),

    (
      'Harina de altramuz',
      'lupin-flour'
    ),


    -- -----------------------------------------------------
    -- MOLLUSCS
    -- -----------------------------------------------------

    (
      'Mejillón',
      'mussel'
    ),

    (
      'Calamar',
      'squid'
    ),

    (
      'Pulpo',
      'octopus'
    )

) as seed(
  name,
  slug
)

on conflict do nothing;



-- =========================================================
-- FOOD ALIASES
-- =========================================================
--
-- Aliases represent exact alternative ingredient names.
--
-- They are deliberately conservative.
--
-- Example:
--
--   "leche"
--
-- can safely resolve to cow milk when it is the COMPLETE
-- ingredient name.
--
-- But:
--
--   "leche de coco"
--
-- will NOT match because matching will later be performed
-- against the complete normalized ingredient name.
-- =========================================================

with alias_seed (
  food_slug,
  alias
) as (

  values

    -- =====================================================
    -- GLUTEN
    -- =====================================================

    (
      'wheat-flour',
      'harina trigo'
    ),

    (
      'wheat-flour',
      'harina de trigo común'
    ),

    (
      'wheat-flour',
      'harina de trigo comun'
    ),

    (
      'wheat-semolina',
      'semola de trigo'
    ),

    (
      'wheat',
      'trigo común'
    ),

    (
      'wheat',
      'trigo comun'
    ),

    (
      'spelt',
      'trigo espelta'
    ),


    -- =====================================================
    -- CRUSTACEANS
    -- =====================================================

    (
      'prawn',
      'gambas'
    ),

    (
      'king-prawn',
      'langostinos'
    ),

    (
      'crab',
      'cangrejos'
    ),


    -- =====================================================
    -- EGGS
    -- =====================================================

    (
      'chicken-egg',
      'huevo'
    ),

    (
      'chicken-egg',
      'huevos'
    ),

    (
      'chicken-egg',
      'huevos de gallina'
    ),


    -- =====================================================
    -- FISH
    -- =====================================================

    (
      'salmon',
      'salmon'
    ),

    (
      'tuna',
      'atun'
    ),


    -- =====================================================
    -- PEANUTS
    -- =====================================================

    (
      'peanut',
      'cacahuetes'
    ),

    (
      'peanut',
      'maní'
    ),

    (
      'peanut',
      'mani'
    ),


    -- =====================================================
    -- SOY
    -- =====================================================

    (
      'soybean',
      'soya'
    ),

    (
      'soybean',
      'habas de soja'
    ),

    (
      'soybean',
      'habas de soya'
    ),


    -- =====================================================
    -- MILK
    -- =====================================================

    (
      'cow-milk',
      'leche'
    ),

    (
      'cow-milk',
      'leche entera'
    ),

    (
      'cow-milk',
      'leche semidesnatada'
    ),

    (
      'cow-milk',
      'leche desnatada'
    ),

    (
      'butter',
      'mantequilla sin sal'
    ),

    (
      'butter',
      'mantequilla con sal'
    ),

    (
      'parmesan-cheese',
      'parmesano'
    ),

    (
      'parmesan-cheese',
      'parmigiano'
    ),

    (
      'parmesan-cheese',
      'parmigiano reggiano'
    ),

    (
      'cow-milk-yogurt',
      'yogur de vaca'
    ),


    -- =====================================================
    -- TREE NUTS
    -- =====================================================

    (
      'almond',
      'almendras'
    ),

    (
      'almond',
      'almendra molida'
    ),

    (
      'almond',
      'almendras molidas'
    ),

    (
      'almond',
      'harina de almendra'
    ),

    (
      'walnut',
      'nueces'
    ),

    (
      'hazelnut',
      'avellanas'
    ),


    -- =====================================================
    -- CELERY
    -- =====================================================

    (
      'celery',
      'apio fresco'
    ),


    -- =====================================================
    -- MUSTARD
    -- =====================================================

    (
      'mustard-seeds',
      'semilla de mostaza'
    ),

    (
      'mustard-seeds',
      'mostaza en grano'
    ),

    (
      'mustard-seeds',
      'mostaza'
    ),


    -- =====================================================
    -- SESAME
    -- =====================================================

    (
      'sesame-seeds',
      'semilla de sésamo'
    ),

    (
      'sesame-seeds',
      'semillas de sesamo'
    ),

    (
      'sesame-seeds',
      'sesamo'
    ),

    (
      'sesame-seeds',
      'sésamo'
    ),

    (
      'tahini',
      'tahina'
    ),

    (
      'tahini',
      'pasta de sésamo'
    ),

    (
      'tahini',
      'pasta de sesamo'
    ),


    -- =====================================================
    -- SULPHITES
    -- =====================================================

    (
      'sulphur-dioxide',
      'dioxido de azufre'
    ),

    (
      'sulphur-dioxide',
      'e220'
    ),

    (
      'sodium-metabisulphite',
      'metabisulfito sódico'
    ),

    (
      'sodium-metabisulphite',
      'metabisulfito sodico'
    ),

    (
      'sodium-metabisulphite',
      'e223'
    ),


    -- =====================================================
    -- LUPIN
    -- =====================================================

    (
      'lupin',
      'altramuces'
    ),

    (
      'lupin-flour',
      'harina de altramuces'
    ),


    -- =====================================================
    -- MOLLUSCS
    -- =====================================================

    (
      'mussel',
      'mejillones'
    ),

    (
      'squid',
      'calamares'
    ),

    (
      'octopus',
      'pulpos'
    )

)

insert into public.food_aliases (
  food_item_id,
  alias
)

select
  food.id,
  alias_seed.alias

from alias_seed

join public.food_items
  as food
  on food.slug =
    alias_seed.food_slug

on conflict do nothing;



-- =========================================================
-- FOOD -> ALLERGEN RELATIONS
-- =========================================================
--
-- Allergens are resolved using their stable slug rather than
-- hard-coded UUID values.
--
-- This allows the migration to be reproduced in another
-- database even if UUID values are different.
-- =========================================================

with relation_seed (
  food_slug,
  allergen_slug
) as (

  values

    -- =====================================================
    -- GLUTEN
    -- =====================================================

    (
      'wheat-flour',
      'gluten'
    ),

    (
      'wheat-semolina',
      'gluten'
    ),

    (
      'wheat',
      'gluten'
    ),

    (
      'spelt',
      'gluten'
    ),

    (
      'rye',
      'gluten'
    ),

    (
      'barley',
      'gluten'
    ),


    -- =====================================================
    -- CRUSTACEANS
    -- =====================================================

    (
      'prawn',
      'crustaceans'
    ),

    (
      'king-prawn',
      'crustaceans'
    ),

    (
      'crab',
      'crustaceans'
    ),


    -- =====================================================
    -- EGGS
    -- =====================================================

    (
      'chicken-egg',
      'eggs'
    ),


    -- =====================================================
    -- FISH
    -- =====================================================

    (
      'salmon',
      'fish'
    ),

    (
      'tuna',
      'fish'
    ),

    (
      'cod',
      'fish'
    ),


    -- =====================================================
    -- PEANUTS
    -- =====================================================

    (
      'peanut',
      'peanuts'
    ),


    -- =====================================================
    -- SOY
    -- =====================================================

    (
      'soybean',
      'soy'
    ),

    (
      'tofu',
      'soy'
    ),


    -- =====================================================
    -- MILK
    -- =====================================================

    (
      'cow-milk',
      'milk'
    ),

    (
      'butter',
      'milk'
    ),

    (
      'parmesan-cheese',
      'milk'
    ),

    (
      'cow-milk-yogurt',
      'milk'
    ),


    -- =====================================================
    -- TREE NUTS
    -- =====================================================

    (
      'almond',
      'nuts'
    ),

    (
      'walnut',
      'nuts'
    ),

    (
      'hazelnut',
      'nuts'
    ),


    -- =====================================================
    -- CELERY
    -- =====================================================

    (
      'celery',
      'celery'
    ),


    -- =====================================================
    -- MUSTARD
    -- =====================================================

    (
      'mustard-seeds',
      'mustard'
    ),


    -- =====================================================
    -- SESAME
    -- =====================================================

    (
      'sesame-seeds',
      'sesame'
    ),

    (
      'tahini',
      'sesame'
    ),


    -- =====================================================
    -- SULPHITES
    -- =====================================================

    (
      'sulphur-dioxide',
      'sulphites'
    ),

    (
      'sodium-metabisulphite',
      'sulphites'
    ),


    -- =====================================================
    -- LUPIN
    -- =====================================================

    (
      'lupin',
      'lupin'
    ),

    (
      'lupin-flour',
      'lupin'
    ),


    -- =====================================================
    -- MOLLUSCS
    -- =====================================================

    (
      'mussel',
      'molluscs'
    ),

    (
      'squid',
      'molluscs'
    ),

    (
      'octopus',
      'molluscs'
    )

)

insert into public.food_allergens (
  food_item_id,
  allergen_id
)

select
  food.id,
  allergen.id

from relation_seed

join public.food_items
  as food
  on food.slug =
    relation_seed.food_slug

join public.allergens
  as allergen
  on allergen.slug =
    relation_seed.allergen_slug

on conflict do nothing;
