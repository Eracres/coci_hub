import Link from "next/link";

import {
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


export function RecipeFilters({
  filters,
  options,
}: RecipeFiltersProps) {
  const activeFilters =
    hasActiveFilters(
      filters,
    );


  return (
    <form
      action="/recipes"
      method="get"
      className="rounded-3xl border border-border bg-surface p-5 shadow-sm md:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <SlidersHorizontal
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="font-serif text-xl font-bold text-foreground md:text-2xl">
              Buscar y filtrar
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Combina distintos
              criterios para encontrar
              la receta que necesitas.
            </p>
          </div>
        </div>


        {activeFilters ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
            <SlidersHorizontal
              className="size-3.5"
              aria-hidden="true"
            />

            Filtros aplicados
          </span>
        ) : null}
      </div>


      <div className="mt-7">
        <label
          htmlFor="recipe-search"
          className="text-sm font-semibold text-foreground"
        >
          Buscar receta
        </label>


        <div className="relative mt-2">
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
            placeholder="Ej. macarrones, tortilla, pollo..."
            className="min-h-12 w-full rounded-xl border border-border bg-page py-2 pl-12 pr-4 text-foreground outline-none transition duration-200 placeholder:text-disabled focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>


      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-page px-3 text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-page px-3 text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-page px-3 text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-page px-3 text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-page px-3 text-foreground outline-none transition duration-200 focus:border-brand focus:bg-surface focus:ring-2 focus:ring-brand/20"
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


      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
        >
          <Search
            className="size-4"
            aria-hidden="true"
          />

          Aplicar filtros
        </button>


        {activeFilters ? (
          <Link
            href="/recipes"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 font-semibold text-muted-foreground transition duration-200 hover:border-secondary hover:bg-page-muted hover:text-foreground"
          >
            <X
              className="size-4"
              aria-hidden="true"
            />

            Limpiar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}