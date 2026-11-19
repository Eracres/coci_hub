import Link from "next/link";

import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type {
  PublicRecipeFilterOptions,
  PublicRecipeFilters,
} from "@/types/public-recipe-filters";


type RecipeFiltersProps = {
  filters:
    PublicRecipeFilters;

  options:
    PublicRecipeFilterOptions;
};


function hasActiveFilters(
  filters:
    PublicRecipeFilters,
) {
  return Boolean(
    filters.search ||
      filters.category ||
      filters.recipeType ||
      filters.difficulty ||
      filters.tag ||
      filters.order !==
        "featured",
  );
}


function getAdvancedFilterCount(
  filters:
    PublicRecipeFilters,
) {
  return [
    filters.category,
    filters.recipeType,
    filters.difficulty,
    filters.tag,
    filters.order !==
      "featured",
  ].filter(
    Boolean,
  ).length;
}


export function RecipeFilters({
  filters,
  options,
}: RecipeFiltersProps) {
  const activeFilters =
    hasActiveFilters(
      filters,
    );


  const advancedFilterCount =
    getAdvancedFilterCount(
      filters,
    );


  return (
    <form
      action="/recipes"
      method="get"
      className="mt-6"
    >

      {/* =================================================
          SEARCH INTRO
      ================================================= */}

      <div className="mb-4">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          ¿Qué te apetece cocinar hoy?
        </h2>
      </div>


      {/* =================================================
          MAIN SEARCH
      ================================================= */}

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-2 shadow-sm sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            id="recipe-search"
            name="search"
            type="search"
            defaultValue={
              filters.search
            }
            placeholder="Buscar receta..."
            aria-label="Buscar receta"
            className="min-h-12 w-full rounded-xl border border-transparent bg-page py-2 pl-12 pr-4 text-foreground outline-none transition duration-200 placeholder:text-disabled focus:border-brand/30 focus:bg-surface focus:ring-2 focus:ring-brand/10"
          />
        </div>


        <button
          type="submit"
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse transition duration-200 hover:bg-brand-hover"
        >
          <Search
            className="size-4"
            aria-hidden="true"
          />

          Buscar
        </button>
      </div>


      {/* =================================================
          ADVANCED FILTERS
      ================================================= */}

      <details
        open={
          advancedFilterCount >
          0
        }
        className="group mt-3"
      >
        <summary className="ml-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition duration-200 hover:border-brand/30 hover:bg-page-muted [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal
            className="size-4 text-brand"
            aria-hidden="true"
          />

          Filtros

          {advancedFilterCount >
          0 ? (
            <span className="flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold leading-none text-inverse">
              {
                advancedFilterCount
              }
            </span>
          ) : null}


          <ChevronDown
            className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>


        <div className="mt-3 rounded-2xl border border-border bg-surface p-5 shadow-sm md:p-6">

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Filtros avanzados
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Afina los resultados si buscas algo más concreto.
              </p>
            </div>


            {advancedFilterCount >
            0 ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                <SlidersHorizontal
                  className="size-3.5"
                  aria-hidden="true"
                />

                {advancedFilterCount ===
                1
                  ? "1 filtro activo"
                  : `${advancedFilterCount} filtros activos`}
              </span>
            ) : null}
          </div>


          {/* =================================================
              FILTER FIELDS
          ================================================= */}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

            <div>
              <label
                htmlFor="recipe-category"
                className="text-sm font-semibold text-foreground"
              >
                Categoría
              </label>

              <select
                id="recipe-category"
                name="category"
                defaultValue={
                  filters.category
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
              >
                <option value="">
                  Todas
                </option>

                {options.categories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.slug
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>


            <div>
              <label
                htmlFor="recipe-type"
                className="text-sm font-semibold text-foreground"
              >
                Tipo
              </label>

              <select
                id="recipe-type"
                name="type"
                defaultValue={
                  filters.recipeType
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
              >
                <option value="">
                  Todos
                </option>

                {options.recipeTypes.map(
                  (
                    recipeType,
                  ) => (
                    <option
                      key={
                        recipeType.id
                      }
                      value={
                        recipeType.slug
                      }
                    >
                      {
                        recipeType.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>


            <div>
              <label
                htmlFor="recipe-difficulty"
                className="text-sm font-semibold text-foreground"
              >
                Dificultad
              </label>

              <select
                id="recipe-difficulty"
                name="difficulty"
                defaultValue={
                  filters.difficulty
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
              >
                <option value="">
                  Todas
                </option>

                <option value="easy">
                  Fácil
                </option>

                <option value="medium">
                  Media
                </option>

                <option value="hard">
                  Difícil
                </option>
              </select>
            </div>


            <div>
              <label
                htmlFor="recipe-tag"
                className="text-sm font-semibold text-foreground"
              >
                Etiqueta
              </label>

              <select
                id="recipe-tag"
                name="tag"
                defaultValue={
                  filters.tag
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
              >
                <option value="">
                  Todas
                </option>

                {options.tags.map(
                  (
                    tag,
                  ) => (
                    <option
                      key={
                        tag.id
                      }
                      value={
                        tag.slug
                      }
                    >
                      {
                        tag.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>


            <div>
              <label
                htmlFor="recipe-order"
                className="text-sm font-semibold text-foreground"
              >
                Ordenar
              </label>

              <select
                id="recipe-order"
                name="order"
                defaultValue={
                  filters.order
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
              >
                <option value="featured">
                  Destacadas primero
                </option>

                <option value="newest">
                  Más recientes
                </option>

                <option value="oldest">
                  Más antiguas
                </option>

                <option value="title-asc">
                  Título A–Z
                </option>

                <option value="title-desc">
                  Título Z–A
                </option>

                <option value="time-asc">
                  Menor tiempo
                </option>

                <option value="time-desc">
                  Mayor tiempo
                </option>
              </select>
            </div>
          </div>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-inverse transition duration-200 hover:bg-brand-hover"
            >
              <SlidersHorizontal
                className="size-4"
                aria-hidden="true"
              />

              Aplicar filtros
            </button>


            {activeFilters ? (
              <Link
                href="/recipes"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-muted-foreground transition duration-200 hover:bg-page-muted hover:text-foreground"
              >
                <X
                  className="size-4"
                  aria-hidden="true"
                />

                Limpiar búsqueda y filtros
              </Link>
            ) : null}
          </div>
        </div>
      </details>
    </form>
  );
}