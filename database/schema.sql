-- =========================================================
-- CociHub
-- Modelo inicial de base de datos PostgreSQL
-- =========================================================


-- =========================================================
-- EXTENSIONES
-- =========================================================

create extension if not exists pgcrypto;


-- =========================================================
-- ENUMS
-- =========================================================

create type user_role as enum (
  'admin',
  'editor',
  'user'
);

create type recipe_status as enum (
  'draft',
  'published',
  'archived'
);

create type recipe_difficulty as enum (
  'easy',
  'medium',
  'hard'
);

create type allergen_presence as enum (
  'present',
  'possible'
);

create type recipe_source_type as enum (
  'own',
  'family',
  'book',
  'magazine',
  'web',
  'handwritten',
  'other'
);


-- =========================================================
-- PROFILES
-- =========================================================

create table profiles (
  id uuid primary key,

  display_name varchar(120),

  role user_role not null default 'user',

  avatar_url text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- RECIPE TYPES
-- =========================================================

create table recipe_types (
  id uuid primary key default gen_random_uuid(),

  name varchar(100) not null unique,

  slug varchar(120) not null unique,

  position integer not null default 0
    check (position >= 0),

  created_at timestamptz not null default now()
);


-- =========================================================
-- CATEGORIES
-- =========================================================

create table categories (
  id uuid primary key default gen_random_uuid(),

  name varchar(100) not null unique,

  slug varchar(120) not null unique,

  description text,

  image_url text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- =========================================================
-- TAGS
-- =========================================================

create table tags (
  id uuid primary key default gen_random_uuid(),

  name varchar(100) not null unique,

  slug varchar(120) not null unique,

  created_at timestamptz not null default now()
);


-- =========================================================
-- ALLERGENS
-- =========================================================

create table allergens (
  id uuid primary key default gen_random_uuid(),

  name varchar(100) not null unique,

  slug varchar(120) not null unique,

  position integer not null default 0
    check (position >= 0),

  created_at timestamptz not null default now()
);


-- =========================================================
-- RECIPES
-- =========================================================

create table recipes (
  id uuid primary key default gen_random_uuid(),

  author_id uuid not null
    references profiles(id)
    on delete restrict,

  recipe_type_id uuid
    references recipe_types(id)
    on delete set null,

  title varchar(120) not null,

  slug varchar(140) not null unique,

  short_description varchar(180),

  introduction text,

  image_url text,

  image_alt varchar(180),

  status recipe_status not null default 'draft',

  difficulty recipe_difficulty,

  base_servings integer
    check (
      base_servings is null
      or (
        base_servings >= 1
        and base_servings <= 100
      )
    ),

  preparation_minutes integer
    check (
      preparation_minutes is null
      or preparation_minutes >= 0
    ),

  cooking_minutes integer
    check (
      cooking_minutes is null
      or cooking_minutes >= 0
    ),

  additional_minutes integer
    check (
      additional_minutes is null
      or additional_minutes >= 0
    ),

  featured boolean not null default false,

  tips text,

  substitutions text,

  storage text,

  freezing text,

  reheating text,

  source_type recipe_source_type,

  source_title varchar(180),

  source_author varchar(120),

  source_page varchar(30),

  source_url text,

  source_notes text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  published_at timestamptz
);


-- =========================================================
-- RECIPE CATEGORIES
-- =========================================================

create table recipe_categories (
  recipe_id uuid not null
    references recipes(id)
    on delete cascade,

  category_id uuid not null
    references categories(id)
    on delete cascade,

  primary key (
    recipe_id,
    category_id
  )
);


-- =========================================================
-- RECIPE TAGS
-- =========================================================

create table recipe_tags (
  recipe_id uuid not null
    references recipes(id)
    on delete cascade,

  tag_id uuid not null
    references tags(id)
    on delete cascade,

  primary key (
    recipe_id,
    tag_id
  )
);


-- =========================================================
-- INGREDIENT GROUPS
-- =========================================================

create table ingredient_groups (
  id uuid primary key default gen_random_uuid(),

  recipe_id uuid not null
    references recipes(id)
    on delete cascade,

  name varchar(100) not null,

  position integer not null
    check (position >= 0),

  created_at timestamptz not null default now()
);


-- =========================================================
-- INGREDIENTS
-- =========================================================

create table ingredients (
  id uuid primary key default gen_random_uuid(),

  ingredient_group_id uuid not null
    references ingredient_groups(id)
    on delete cascade,

  name varchar(120) not null,

  quantity numeric(10, 3)
    check (
      quantity is null
      or quantity >= 0
    ),

  unit varchar(40),

  notes varchar(250),

  scalable boolean not null default true,

  position integer not null
    check (position >= 0),

  created_at timestamptz not null default now()
);


-- =========================================================
-- RECIPE STEPS
-- =========================================================

create table recipe_steps (
  id uuid primary key default gen_random_uuid(),

  recipe_id uuid not null
    references recipes(id)
    on delete cascade,

  title varchar(120),

  instructions text not null,

  duration_minutes integer
    check (
      duration_minutes is null
      or duration_minutes >= 0
    ),

  tip varchar(800),

  image_url text,

  position integer not null
    check (position >= 0),

  created_at timestamptz not null default now()
);


-- =========================================================
-- RECIPE ALLERGENS
-- =========================================================

create table recipe_allergens (
  recipe_id uuid not null
    references recipes(id)
    on delete cascade,

  allergen_id uuid not null
    references allergens(id)
    on delete cascade,

  presence allergen_presence not null,

  primary key (
    recipe_id,
    allergen_id
  )
);


-- =========================================================
-- ÍNDICES
-- =========================================================

create index idx_recipes_status
  on recipes(status);

create index idx_recipes_recipe_type
  on recipes(recipe_type_id);

create index idx_recipes_author
  on recipes(author_id);

create index idx_recipes_published_at
  on recipes(published_at desc);

create index idx_recipes_featured
  on recipes(featured);

create index idx_recipe_categories_category
  on recipe_categories(category_id);

create index idx_recipe_tags_tag
  on recipe_tags(tag_id);

create index idx_ingredient_groups_recipe
  on ingredient_groups(recipe_id);

create index idx_ingredients_group
  on ingredients(ingredient_group_id);

create index idx_recipe_steps_recipe
  on recipe_steps(recipe_id);

create index idx_recipe_allergens_allergen
  on recipe_allergens(allergen_id);


-- =========================================================
-- ORDENACIÓN ÚNICA
-- =========================================================

create unique index idx_ingredient_groups_recipe_position
  on ingredient_groups(
    recipe_id,
    position
  );

create unique index idx_ingredients_group_position
  on ingredients(
    ingredient_group_id,
    position
  );

create unique index idx_recipe_steps_recipe_position
  on recipe_steps(
    recipe_id,
    position
  );