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
      className="mt-10 rounded-2xl border border-border bg-white p-5 md:p-6"
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal
          className="h-5 w-5 text-brand"
          aria-hidden="true"
        />

        <h2 className="font-serif text-xl font-bold text-foreground">
          Buscar y filtrar
        </h2>
      </div>


      <div className="mt-5">
        <label
          htmlFor="recipe-search"
          className="text-sm font-semibold text-foreground"
        >
          Buscar receta
        </label>


        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
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
            className="min-h-11 w-full rounded-xl border border-border bg-white py-2 pl-10 pr-4 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>


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
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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
            className="mt-2 min-h-11 w-full rounded-xl border border-border bg-white px-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
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


      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 font-semibold text-inverse transition-colors hover:bg-brand-hover"
        >
          Aplicar filtros
        </button>


        {activeFilters ? (
          <Link
            href="/recipes"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-5 font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />

            Limpiar
          </Link>
        ) : null}
      </div>
    </form>
  );
}