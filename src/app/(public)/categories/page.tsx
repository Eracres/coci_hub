import type {
  Metadata,
} from "next";

import {
  BookOpen,
  ChefHat,
} from "lucide-react";

import {
  CategoryCard,
} from "@/components/categories/category-card";

import {
  Container,
} from "@/components/layout/container";

import {
  getPublicCategories,
} from "@/services/categories/public-category-service";


export const metadata: Metadata = {
  title:
    "Categorías",

  description:
    "Explora las recetas de CociHub organizadas por categorías.",
};


export default async function CategoriesPage() {
  const categories =
    await getPublicCategories();


  const categoriesWithRecipes =
    categories.filter(
      (
        category,
      ) =>
        category.recipeCount >
        0,
    ).length;


  const totalRecipes =
    categories.reduce(
      (
        total,
        category,
      ) =>
        total +
        category.recipeCount,
      0,
    );


  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-page-muted/50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-28 -left-24 size-72 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <Container className="relative py-14 md:py-18 lg:py-20">
          <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <header className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-4 py-2 text-sm font-semibold text-secondary-hover">
                <BookOpen
                  className="size-4"
                  aria-hidden="true"
                />

                Explora CociHub
              </div>


              <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Recetas organizadas
                a tu manera
              </h1>


              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Explora el recetario
                por categorías y
                encuentra fácilmente
                nuevas ideas según el
                tipo de cocina, estilo
                o momento que estés
                buscando.
              </p>
            </header>


            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                  <BookOpen
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <p className="mt-4 font-serif text-2xl font-bold text-foreground">
                  {
                    categoriesWithRecipes
                  }
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {categoriesWithRecipes ===
                  1
                    ? "categoría activa"
                    : "categorías activas"}
                </p>
              </div>


              <div className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-sm">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <ChefHat
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>

                <p className="mt-4 font-serif text-2xl font-bold text-foreground">
                  {
                    totalRecipes
                  }
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  referencias
                  clasificadas
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>


      <section className="py-12 md:py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                Todas las categorías
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                Elige por dónde
                empezar
              </h2>
            </div>


            {categories.length >
            0 ? (
              <p className="text-sm text-muted-foreground">
                {categories.length ===
                1
                  ? "1 categoría disponible"
                  : `${categories.length} categorías disponibles`}
              </p>
            ) : null}
          </div>


          {categories.length >
          0 ? (
            <section
              aria-label="Categorías de recetas"
              className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {categories.map(
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
            </section>
          ) : (
            <section className="mt-8 rounded-3xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center shadow-sm">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <BookOpen
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-5 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Todavía no hay
                categorías
              </h2>


              <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
                Cuando existan
                categorías
                disponibles,
                aparecerán aquí para
                ayudarte a explorar
                las recetas de
                CociHub.
              </p>
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}