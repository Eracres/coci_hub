import type {
  Metadata,
} from "next";

import {
  RecipeCard,
} from "@/components/recipes/recipe-card";

import {
  Container,
} from "@/components/layout/container";

import {
  getPublishedRecipes,
} from "@/services/recipes/public-recipe-service";


export const metadata: Metadata = {
  title:
    "Recetas",

  description:
    "Descubre las recetas publicadas en CociHub.",
};


export default async function RecipesPage() {
  const recipes =
    await getPublishedRecipes();


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


        {recipes.length >
        0 ? (
          <section
            aria-label="Listado de recetas"
            className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {recipes.map(
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
              Todavía no hay
              recetas publicadas
            </h2>


            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              En cuanto haya
              recetas disponibles,
              aparecerán aquí.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}