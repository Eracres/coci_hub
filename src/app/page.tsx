import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Clock3,
  Sparkles,
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


  const visibleCategories =
    categories
      .filter(
        (
          category,
        ) =>
          category.recipeCount >
          0,
      )
      .slice(
        0,
        6,
      );


  const hasRecipes =
    recipes.length >
    0;


  return (
    <main>
      <section className="py-16 md:py-24 lg:py-28">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-brand">
                <Sparkles
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Tu rincón para cocinar,
                aprender y compartir
              </div>


              <h1 className="mt-6 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                CociHub
              </h1>


              <p className="mt-5 max-w-2xl font-serif text-2xl leading-relaxed text-secondary-hover md:text-3xl">
                Comer es un placer,
                cocinar un privilegio,
                enseñar una
                responsabilidad.
              </p>


              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Descubre recetas,
                adapta las cantidades
                a tus comensales y
                guarda esas ideas que
                merecen seguir pasando
                de cocina en cocina.
              </p>


              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/recipes"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse transition-colors hover:bg-brand-hover"
                >
                  Explorar recetas

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Link>


                <Link
                  href="/categories"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  <BookOpen
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Ver categorías
                </Link>
              </div>
            </div>


            <div className="rounded-3xl border border-border bg-white p-7 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                CociHub
              </p>


              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground">
                Recetas pensadas
                para cocinar de verdad
              </h2>


              <p className="mt-4 leading-7 text-muted-foreground">
                Cada receta puede
                incluir ingredientes,
                elaboración, tiempos,
                alérgenos y cantidades
                adaptables según el
                número de raciones.
              </p>


              <div className="mt-7 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-secondary/60 p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {
                      recipes.length
                    }
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {recipes.length ===
                    1
                      ? "receta publicada"
                      : "recetas publicadas"}
                  </div>
                </div>


                <div className="rounded-2xl bg-secondary/60 p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {
                      visibleCategories.length
                    }
                  </div>

                  <div className="mt-1 text-sm text-muted-foreground">
                    {visibleCategories.length ===
                    1
                      ? "categoría activa"
                      : "categorías activas"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {featuredRecipes.length >
      0 ? (
        <section className="border-t border-border py-14 md:py-18">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  Selección CociHub
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Recetas destacadas
                </h2>
              </div>


              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                Ver todas

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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


      {latestRecipes.length >
      0 ? (
        <section className="border-t border-border py-14 md:py-18">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-brand">
                  <Clock3
                    className="h-5 w-5"
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                    Recién publicadas
                  </p>
                </div>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Últimas recetas
                </h2>
              </div>


              <Link
                href="/recipes?order=newest"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                Ver más recientes

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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


      {visibleCategories.length >
      0 ? (
        <section className="border-t border-border py-14 md:py-18">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  Encuentra tu próxima receta
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Explora por categorías
                </h2>
              </div>


              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                Todas las categorías

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>


            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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


      {!hasRecipes ? (
        <section className="border-t border-border py-16">
          <Container>
            <div className="rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
              <h2 className="font-serif text-3xl font-bold text-foreground">
                La cocina está a
                punto de empezar
              </h2>


              <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
                Todavía no hay
                recetas publicadas.
                Cuando llegue la
                primera, aparecerá
                aquí.
              </p>
            </div>
          </Container>
        </section>
      ) : null}


      <section className="border-t border-border py-16 md:py-20">
        <Container>
          <div className="rounded-3xl bg-secondary px-6 py-12 text-center md:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
              ¿Qué cocinamos hoy?
            </p>


            <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-bold text-foreground md:text-4xl">
              Encuentra una receta
              y adapta las raciones
              a tu mesa
            </h2>


            <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
              Busca por nombre,
              categoría,
              dificultad,
              etiqueta o tiempo.
            </p>


            <Link
              href="/recipes"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse transition-colors hover:bg-brand-hover"
            >
              Buscar recetas

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}