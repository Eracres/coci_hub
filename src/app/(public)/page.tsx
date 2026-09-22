import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Clock3,
  Sparkles,
  Users,
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
      <section className="relative border-b border-border">
        <div
          className="pointer-events-none absolute -right-28 -top-28 size-80 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden="true"
        />

        <Container className="relative py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-16">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
                <Sparkles
                  className="size-4"
                  aria-hidden="true"
                />

                Tu rincón para cocinar,
                aprender y compartir
              </div>


              <h1 className="mt-7 font-serif text-5xl font-bold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Coci
                <span className="text-brand">
                  Hub
                </span>
              </h1>


              <p className="mt-6 max-w-2xl font-serif text-2xl leading-relaxed text-secondary-hover md:text-3xl">
                Comer es un placer,
                cocinar un privilegio,
                enseñar una
                responsabilidad.
              </p>


              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Descubre recetas
                caseras, adapta las
                cantidades a tu mesa
                y conserva esas ideas
                que merecen seguir
                pasando de cocina en
                cocina.
              </p>


              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-semibold text-foreground shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-secondary hover:bg-page-muted"
                >
                  <BookOpen
                    className="size-4 text-secondary-hover"
                    aria-hidden="true"
                  />

                  Ver categorías
                </Link>
              </div>
            </div>


            <div className="relative">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-secondary/10 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-lg">
                <div className="border-b border-border bg-page-muted px-6 py-5 md:px-8">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-inverse shadow-sm">
                      <ChefHat
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                        CociHub
                      </p>

                      <p className="mt-1 text-sm font-medium text-foreground">
                        Cocina sin
                        complicaciones
                      </p>
                    </div>
                  </div>
                </div>


                <div className="p-6 md:p-8">
                  <h2 className="font-serif text-3xl font-bold leading-tight text-foreground">
                    Recetas pensadas
                    para cocinar de
                    verdad
                  </h2>


                  <p className="mt-4 leading-7 text-muted-foreground">
                    Toda la información
                    importante de una
                    receta organizada de
                    forma clara para que
                    puedas centrarte en
                    disfrutar cocinando.
                  </p>


                  <div className="mt-7 space-y-3">
                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-page px-4 py-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                        <Users
                          className="size-5"
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Raciones
                          adaptables
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          Ajusta cantidades
                          según tus
                          comensales.
                        </p>
                      </div>
                    </div>


                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-page px-4 py-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <BookOpen
                          className="size-5"
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Elaboraciones
                          claras
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          Ingredientes y
                          pasos ordenados
                          para cocinar sin
                          perderte.
                        </p>
                      </div>
                    </div>


                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-page px-4 py-3.5">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-warning">
                        <Clock3
                          className="size-5"
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Todo de un
                          vistazo
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                          Tiempos,
                          dificultad y
                          datos útiles
                          antes de empezar.
                        </p>
                      </div>
                    </div>
                  </div>


                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-page-muted p-4">
                      <div className="font-serif text-3xl font-bold text-foreground">
                        {
                          recipes.length
                        }
                      </div>

                      <div className="mt-1 text-xs leading-5 text-muted-foreground">
                        {recipes.length ===
                        1
                          ? "receta publicada"
                          : "recetas publicadas"}
                      </div>
                    </div>


                    <div className="rounded-2xl bg-page-muted p-4">
                      <div className="font-serif text-3xl font-bold text-foreground">
                        {
                          activeCategories.length
                        }
                      </div>

                      <div className="mt-1 text-xs leading-5 text-muted-foreground">
                        {activeCategories.length ===
                        1
                          ? "categoría activa"
                          : "categorías activas"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>


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
                  Una selección de
                  recetas que merece la
                  pena tener siempre a
                  mano.
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


      {visibleCategories.length >
      0 ? (
        <section className="border-y border-border bg-page-muted/60 py-16 md:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                  Encuentra tu próxima
                  receta
                </p>

                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                  Explora por categorías
                </h2>

                <p className="mt-3 leading-7 text-muted-foreground">
                  Navega por estilos,
                  momentos y tipos de
                  cocina para encontrar
                  justo lo que te
                  apetece.
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
                  Las incorporaciones
                  más recientes a la
                  cocina de CociHub.
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
                La cocina está a punto
                de empezar
              </h2>


              <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
                Todavía no hay recetas
                publicadas. Cuando
                llegue la primera,
                aparecerá aquí.
              </p>
            </div>
          </Container>
        </section>
      ) : null}


      {hasRecipes ? (
        <section className="px-0 py-16 md:py-20">
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
                  ¿Qué cocinamos hoy?
                </p>


                <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-bold md:text-4xl">
                  Encuentra una receta
                  y adapta las raciones
                  a tu mesa
                </h2>


                <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">
                  Busca por nombre,
                  categoría,
                  dificultad,
                  etiqueta o tiempo.
                </p>


                <Link
                  href="/recipes"
                  className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
                >
                  Buscar recetas

                  <ArrowRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}