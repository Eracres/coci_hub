import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";

import {
  RecipeCard,
} from "@/components/recipes/recipe-card";

import {
  getPublicCategoryBySlug,
} from "@/services/categories/public-category-service";


type CategoryPageProps = {
  params:
    Promise<{
      slug: string;
    }>;
};


export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const result =
    await getPublicCategoryBySlug(
      slug,
    );


  if (!result) {
    return {
      title:
        "Categoría no encontrada",
    };
  }


  return {
    title:
      result.category.name,

    description:
      `Descubre las recetas de ${result.category.name} disponibles en CociHub.`,
  };
}


export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const {
    slug,
  } =
    await params;


  const result =
    await getPublicCategoryBySlug(
      slug,
    );


  if (!result) {
    notFound();
  }


  return (
    <main className="min-h-screen py-12 md:py-16">
      <Container>
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Volver a categorías
        </Link>


        <header className="mt-8 max-w-3xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-brand">
            <BookOpen
              className="h-6 w-6"
              aria-hidden="true"
            />
          </div>


          <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {
              result.category
                .name
            }
          </h1>


          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Recetas
            publicadas dentro
            de la categoría{" "}
            <strong className="font-semibold text-foreground">
              {
                result.category
                  .name
              }
            </strong>
            .
          </p>


          <p className="mt-4 text-sm font-medium text-brand">
            {result.total ===
            1
              ? "1 receta"
              : `${result.total} recetas`}
          </p>
        </header>


        {result.recipes.length >
        0 ? (
          <section
            aria-label={`Recetas de ${result.category.name}`}
            className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
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
          <section className="mt-10 rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              No hay recetas
              publicadas
            </h2>


            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Esta categoría
              todavía no
              contiene recetas
              públicas.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}