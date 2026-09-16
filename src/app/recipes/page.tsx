import type {
  Metadata,
} from "next";

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
    <main className="min-h-screen py-12 md:py-16">
      <Container>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            CociHub
          </p>


          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Recetas
          </h1>


          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Descubre recetas,
            encuentra inspiración
            y guarda nuevas ideas
            para disfrutar
            cocinando.
          </p>
        </header>


        <RecipeFilters
          filters={
            filters
          }
          options={
            filterOptions
          }
        />


        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {result.total ===
            1
              ? "1 receta encontrada"
              : `${result.total} recetas encontradas`}
          </p>


          {hasActiveFilters ? (
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-brand">
              Filtros activos
            </p>
          ) : null}
        </div>


        {result.recipes.length >
        0 ? (
          <section
            aria-label="Listado de recetas"
            className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
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
          <section className="mt-6 rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              {hasActiveFilters
                ? "No encontramos recetas"
                : "Todavía no hay recetas publicadas"}
            </h2>


            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              {hasActiveFilters
                ? "Prueba a cambiar o eliminar alguno de los filtros."
                : "En cuanto haya recetas disponibles, aparecerán aquí."}
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}