import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Clock3,
  Grid2X2,
  Sparkles,
  UsersRound,
} from "lucide-react";

import {
  CategoryCard,
} from "@/components/categories/category-card";

import {
  Container,
} from "@/components/layout/container";

import {
  RecipeCard,
} from "@/components/recipes/recipe-card";

import {
  RecipeSearchAutocomplete,
} from "@/components/recipes/recipe-search-autocomplete";

import {
  getPublicCategories,
} from "@/services/categories/public-category-service";

import {
  getPublishedRecipes,
} from "@/services/recipes/public-recipe-service";


export default async function HomePage() {
  const [
    recipes,
    categories,
  ] =
    await Promise.all([
      getPublishedRecipes(),
      getPublicCategories(),
    ]);


  const featuredRecipes =
    recipes
      .filter(
        (
          recipe,
        ) =>
          recipe.featured,
      )
      .slice(
        0,
        3,
      );


  const featuredRecipeIds =
    new Set(
      featuredRecipes.map(
        (
          recipe,
        ) =>
          recipe.id,
      ),
    );


  const latestRecipes =
    recipes
      .filter(
        (
          recipe,
        ) =>
          !featuredRecipeIds.has(
            recipe.id,
          ),
      )
      .sort(
        (
          first,
          second,
        ) => {
          const firstDate =
            first.publishedAt
              ? new Date(
                  first.publishedAt,
                ).getTime()
              : 0;


          const secondDate =
            second.publishedAt
              ? new Date(
                  second.publishedAt,
                ).getTime()
              : 0;


          return (
            secondDate -
            firstDate
          );
        },
      )
      .slice(
        0,
        3,
      );


  const activeCategories =
    categories.filter(
      (
        category,
      ) =>
        category.recipeCount >
        0,
    );


  const visibleCategories =
    activeCategories.slice(
      0,
      6,
    );


  const hasRecipes =
    recipes.length >
    0;


  return (
    <main className="overflow-hidden">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative border-b border-border bg-page">

        {/* Future:
            estos laterales podrán alojar imágenes temáticas
            configurables desde Administración.
        */}

        <div
          className="pointer-events-none absolute -left-40 top-16 size-80 rounded-full bg-secondary/15 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -right-40 top-10 size-96 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <Container className="relative py-16 md:py-20 lg:py-24">

          <div className="mx-auto max-w-5xl text-center">

            {/* =================================================
                BADGE
            ================================================= */}

            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              <Sparkles
                className="size-4"
                aria-hidden="true"
              />

              Tu rincón para cocinar, aprender y compartir
            </div>


            {/* =================================================
                BRAND
            ================================================= */}

            <h1 className="mt-7 font-serif text-6xl font-bold leading-none tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              Coci
              <span className="text-brand">
                Hub
              </span>
            </h1>


            {/* =================================================
                MAIN MESSAGE
            ================================================= */}

            <p className="mx-auto mt-6 max-w-4xl font-serif text-2xl leading-relaxed text-secondary-hover sm:text-3xl md:text-4xl">
              Comer es un placer, cocinar un privilegio,
              enseñar una responsabilidad.
            </p>


            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
              Descubre recetas caseras, adapta las cantidades
              a tu mesa y conserva esas ideas que merecen
              seguir pasando de cocina en cocina.
            </p>


            {/* =================================================
                PRIMARY ACTIONS
            ================================================= */}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/recipes"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
              >
                Explorar recetas

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>


              <Link
                href="/categories"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-semibold text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary hover:bg-page-muted"
              >
                <BookOpen
                  className="size-4 text-secondary-hover"
                  aria-hidden="true"
                />

                Ver categorías
              </Link>
            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <RecipeSearchAutocomplete />
          </div>


          {/* =================================================
              FEATURE CARDS
          ================================================= */}

          <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3">

            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface/90 p-5 text-left shadow-sm">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <BookOpen
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Recetas claras
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ingredientes y pasos ordenados para cocinar sin perderte.
                </p>
              </div>
            </div>


            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface/90 p-5 text-left shadow-sm">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <Grid2X2
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Categorías útiles
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Encuentra fácilmente recetas según tus gustos y el momento.
                </p>
              </div>
            </div>


            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface/90 p-5 text-left shadow-sm">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/20 text-warning">
                <UsersRound
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2 className="font-serif text-lg font-bold text-foreground">
                  Comunidad activa
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Comparte tus recetas, comenta y aprende de otras personas.
                </p>
              </div>
            </div>

          </div>


          {/* =================================================
              REAL STATS
          ================================================= */}

          <div className="mx-auto mt-8 grid max-w-6xl overflow-hidden rounded-2xl border border-secondary/20 bg-secondary/10 md:grid-cols-3">

            <div className="flex items-center justify-center gap-4 px-6 py-5">
              <ChefHat
                className="size-5 shrink-0 text-secondary-hover"
                aria-hidden="true"
              />

              <div className="text-left">
                <p className="font-serif text-2xl font-bold text-foreground">
                  {
                    recipes.length
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  {recipes.length ===
                  1
                    ? "receta publicada"
                    : "recetas publicadas"}
                </p>
              </div>
            </div>


            <div className="border-t border-secondary/20 md:border-l md:border-t-0">
              <div className="flex items-center justify-center gap-4 px-6 py-5">
                <Grid2X2
                  className="size-5 shrink-0 text-secondary-hover"
                  aria-hidden="true"
                />

                <div className="text-left">
                  <p className="font-serif text-2xl font-bold text-foreground">
                    {
                      activeCategories.length
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {activeCategories.length ===
                    1
                      ? "categoría activa"
                      : "categorías activas"}
                  </p>
                </div>
              </div>
            </div>


            <div className="border-t border-secondary/20 md:border-l md:border-t-0">
              <div className="flex items-center justify-center gap-4 px-6 py-5">
                <UsersRound
                  className="size-5 shrink-0 text-secondary-hover"
                  aria-hidden="true"
                />

                <div className="text-left">
                  <p className="font-serif text-xl font-bold text-foreground">
                    Comunidad
                  </p>

                  <p className="text-xs text-muted-foreground">
                    abierta para compartir
                  </p>
                </div>
              </div>
            </div>

          </div>

        </Container>
      </section>


      {/* ===================================================
          FEATURED RECIPES
      =================================================== */}

      {featuredRecipes.length >
      0 ? (
        <section className="bg-surface py-16 md:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  Selección CociHub
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Recetas destacadas
                </h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  Una selección de recetas que merece la pena tener siempre a mano.
                </p>
              </div>


              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-brand-hover"
              >
                Ver todas

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featuredRecipes.map(
                (
                  recipe,
                ) => (
                  <RecipeCard
                    key={
                      recipe.id
                    }
                    recipe={
                      recipe
                    }
                  />
                ),
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          CATEGORIES
      =================================================== */}

      {visibleCategories.length >
      0 ? (
        <section className="border-y border-border bg-page-muted/60 py-16 md:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                  Encuentra tu próxima receta
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Explora por categorías
                </h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  Navega por estilos, momentos y tipos de cocina para encontrar justo lo que te apetece.
                </p>
              </div>


              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-secondary-hover transition hover:bg-secondary/10"
              >
                Todas las categorías

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleCategories.map(
                (
                  category,
                ) => (
                  <CategoryCard
                    key={
                      category.id
                    }
                    category={
                      category
                    }
                  />
                ),
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          LATEST RECIPES
      =================================================== */}

      {latestRecipes.length >
      0 ? (
        <section className="bg-page py-16 md:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-brand">
                  <Clock3
                    className="size-5"
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                    Recién publicadas
                  </p>
                </div>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Últimas recetas
                </h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  Las incorporaciones más recientes a la cocina de CociHub.
                </p>
              </div>


              <Link
                href="/recipes?order=newest"
                className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-brand-hover"
              >
                Ver más recientes

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <div className="mt-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {latestRecipes.map(
                (
                  recipe,
                ) => (
                  <RecipeCard
                    key={
                      recipe.id
                    }
                    recipe={
                      recipe
                    }
                  />
                ),
              )}
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          EMPTY STATE
      =================================================== */}

      {!hasRecipes ? (
        <section className="py-16 md:py-20">
          <Container>
            <div className="rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center shadow-sm">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ChefHat
                  className="size-7"
                  aria-hidden="true"
                />
              </span>

              <h2 className="mt-5 font-serif text-3xl font-bold text-foreground">
                La cocina está a punto de empezar
              </h2>


              <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
                Todavía no hay recetas publicadas. Cuando llegue la primera, aparecerá aquí.
              </p>
            </div>
          </Container>
        </section>
      ) : null}


      {/* ===================================================
          COMMUNITY CTA
      =================================================== */}

      {hasRecipes ? (
        <section className="py-16 md:py-20">
          <Container>
            <div className="relative overflow-hidden rounded-3xl bg-secondary-hover px-6 py-12 text-center text-inverse shadow-lg md:px-12 md:py-14">

              <div
                className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl"
                aria-hidden="true"
              />

              <div
                className="absolute -bottom-20 -left-16 size-64 rounded-full bg-accent/20 blur-3xl"
                aria-hidden="true"
              />


              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                  De cocina en cocina
                </p>


                <h2 className="mx-auto mt-3 max-w-3xl font-serif text-3xl font-bold md:text-4xl">
                  ¿Tienes una receta que merece seguir pasando de una mesa a otra?
                </h2>


                <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/80">
                  Comparte tus recetas, descubre las de otras personas y ayuda a que las buenas ideas sigan creciendo dentro de CociHub.
                </p>


                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/mi-cocihub/recetas/nueva"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
                  >
                    Compartir una receta

                    <ArrowRight
                      className="size-4"
                      aria-hidden="true"
                    />
                  </Link>


                  <Link
                    href="/recipes"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 font-semibold text-white transition hover:bg-white/15"
                  >
                    Explorar la comunidad
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

    </main>
  );
}