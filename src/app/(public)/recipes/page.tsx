import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ChefHat,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";

import {
  RecipeCard,
} from "@/components/recipes/recipe-card";

import {
  RecipeFilters,
} from "@/components/recipes/recipe-filters";

import {
  getPublicRecipeFilterOptions,
  searchPublishedRecipes,
} from "@/services/recipes/public-recipe-list-service";

import type {
  PublicRecipeDifficulty,
} from "@/types/public-recipe";

import type {
  PublicRecipeFilters,
  PublicRecipeOrder,
} from "@/types/public-recipe-filters";


export const metadata: Metadata = {
  title:
    "Recetas",

  description:
    "Descubre las recetas publicadas en CociHub.",
};


type RecipesPageProps = {
  searchParams:
    Promise<{
      search?:
        string | string[];

      category?:
        string | string[];

      type?:
        string | string[];

      difficulty?:
        string | string[];

      tag?:
        string | string[];

      order?:
        string | string[];
    }>;
};


function getFirstParam(
  value:
    string |
    string[] |
    undefined,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      ""
    );
  }


  return (
    value ??
    ""
  );
}


function parseDifficulty(
  value: string,
): PublicRecipeDifficulty | "" {
  if (
    value ===
      "easy" ||
    value ===
      "medium" ||
    value ===
      "hard"
  ) {
    return value;
  }


  return "";
}


function parseOrder(
  value: string,
): PublicRecipeOrder {
  const validOrders:
    PublicRecipeOrder[] =
    [
      "featured",
      "newest",
      "oldest",
      "title-asc",
      "title-desc",
      "time-asc",
      "time-desc",
    ];


  if (
    validOrders.includes(
      value as PublicRecipeOrder,
    )
  ) {
    return (
      value as PublicRecipeOrder
    );
  }


  return "featured";
}


export default async function RecipesPage({
  searchParams,
}: RecipesPageProps) {
  const params =
    await searchParams;


  const filters:
    PublicRecipeFilters =
    {
      search:
        getFirstParam(
          params.search,
        ).trim(),

      category:
        getFirstParam(
          params.category,
        ),

      recipeType:
        getFirstParam(
          params.type,
        ),

      difficulty:
        parseDifficulty(
          getFirstParam(
            params.difficulty,
          ),
        ),

      tag:
        getFirstParam(
          params.tag,
        ),

      order:
        parseOrder(
          getFirstParam(
            params.order,
          ),
        ),
    };


  const [
    result,
    filterOptions,
  ] =
    await Promise.all([
      searchPublishedRecipes(
        filters,
      ),

      getPublicRecipeFilterOptions(),
    ]);


  const hasActiveFilters =
    Boolean(
      filters.search ||
        filters.category ||
        filters.recipeType ||
        filters.difficulty ||
        filters.tag ||
        filters.order !==
          "featured",
    );


  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-page-muted/50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-28 -left-24 size-72 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden="true"
        />

        <Container className="relative py-14 md:py-18 lg:py-20">
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <header className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
                <ChefHat
                  className="size-4"
                  aria-hidden="true"
                />

                Recetario CociHub
              </div>


              <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Encuentra algo
                delicioso para
                cocinar
              </h1>


              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Explora todas las
                recetas publicadas,
                utiliza los filtros
                para encontrar justo
                lo que necesitas y
                adapta después las
                raciones a tu mesa.
              </p>
            </header>


            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <ChefHat
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="font-serif text-2xl font-bold text-foreground">
                  {
                    result.total
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  {result.total ===
                  1
                    ? "receta disponible"
                    : "recetas disponibles"}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>


      <section className="py-12 md:py-16">
        <Container>
          <RecipeFilters
            filters={
              filters
            }
            options={
              filterOptions
            }
          />


          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {result.total ===
                1
                  ? "1 receta encontrada"
                  : `${result.total} recetas encontradas`}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {hasActiveFilters
                  ? "Mostrando resultados según los filtros seleccionados."
                  : "Mostrando el recetario disponible en CociHub."}
              </p>
            </div>


            {hasActiveFilters ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                <SlidersHorizontal
                  className="size-3.5"
                  aria-hidden="true"
                />

                Filtros activos
              </div>
            ) : null}
          </div>


          {result.recipes.length >
          0 ? (
            <section
              aria-label="Listado de recetas"
              className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              {result.recipes.map(
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
            </section>
          ) : (
            <section className="mt-8 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center shadow-sm">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <SearchX
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-5 font-serif text-2xl font-bold text-foreground md:text-3xl">
                {hasActiveFilters
                  ? "No encontramos recetas"
                  : "Todavía no hay recetas publicadas"}
              </h2>


              <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
                {hasActiveFilters
                  ? "Prueba a cambiar alguno de los criterios de búsqueda o elimina los filtros para volver a ver todo el recetario."
                  : "En cuanto haya recetas disponibles, aparecerán aquí."}
              </p>


              {hasActiveFilters ? (
                <Link
                  href="/recipes"
                  className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition duration-200 hover:bg-brand-hover"
                >
                  Ver todas las recetas
                </Link>
              ) : null}
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}