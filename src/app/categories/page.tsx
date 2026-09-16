import type {
  Metadata,
} from "next";

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


  return (
    <main className="min-h-screen py-12 md:py-16">
      <Container>
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Descubre
          </p>


          <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Categorías
          </h1>


          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Explora las
            recetas por tipo
            de cocina,
            ingredientes,
            estilos o
            cualquier otra
            categoría.
          </p>
        </header>


        {categories.length >
        0 ? (
          <section
            aria-label="Categorías de recetas"
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
          <section className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Todavía no
              hay categorías
            </h2>


            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Cuando existan
              categorías
              disponibles,
              aparecerán aquí.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}