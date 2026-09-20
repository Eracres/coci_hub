import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChefHat,
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

        <Container className="relative py-10 md:py-16 lg:py-20">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-secondary-hover transition hover:bg-secondary/10"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a categorías
          </Link>


          <div className="mt-7 grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <header className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/15 px-4 py-2 text-sm font-semibold text-secondary-hover">
                <BookOpen
                  className="size-4"
                  aria-hidden="true"
                />

                Categoría CociHub
              </div>


              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {
                  result.category
                    .name
                }
              </h1>


              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Explora todas las
                recetas publicadas
                dentro de{" "}
                <strong className="font-semibold text-foreground">
                  {
                    result.category
                      .name
                  }
                </strong>
                {" "}y encuentra una
                nueva idea para tu
                próxima comida.
              </p>
            </header>


            <div className="rounded-2xl border border-border bg-surface px-6 py-5 shadow-sm">
              <span className="flex size-11 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                <ChefHat
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <p className="mt-4 font-serif text-3xl font-bold text-foreground">
                {
                  result.total
                }
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {result.total ===
                1
                  ? "receta publicada"
                  : "recetas publicadas"}
              </p>
            </div>
          </div>
        </Container>
      </section>


      <section className="py-12 md:py-16">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                Recetario
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Recetas de{" "}
                {
                  result.category
                    .name
                }
              </h2>
            </div>


            {result.recipes.length >
            0 ? (
              <Link
                href="/recipes"
                className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-brand-hover"
              >
                Explorar todo CociHub

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </Link>
            ) : null}
          </div>


          {result.recipes.length >
          0 ? (
            <section
              aria-label={`Recetas de ${result.category.name}`}
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
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <BookOpen
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-5 font-serif text-2xl font-bold text-foreground md:text-3xl">
                Todavía no hay
                recetas publicadas
              </h2>


              <p className="mx-auto mt-4 max-w-lg leading-7 text-muted-foreground">
                La categoría{" "}
                <strong className="font-semibold text-foreground">
                  {
                    result.category
                      .name
                  }
                </strong>
                {" "}todavía no
                contiene recetas
                públicas.
              </p>


              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/categories"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 font-semibold text-foreground transition hover:bg-page-muted"
                >
                  <ArrowLeft
                    className="size-4"
                    aria-hidden="true"
                  />

                  Ver categorías
                </Link>


                <Link
                  href="/recipes"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
                >
                  Explorar recetas

                  <ArrowRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </section>
          )}
        </Container>
      </section>
    </main>
  );
}