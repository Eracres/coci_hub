/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import {
  Clock3,
  Star,
  Users,
} from "lucide-react";

import type {
  PublicRecipeListItem,
} from "@/types/public-recipe";


type RecipeCardProps = {
  recipe:
    PublicRecipeListItem;
};


function getDifficultyLabel(
  difficulty:
    PublicRecipeListItem["difficulty"],
) {
  switch (
    difficulty
  ) {
    case "easy":
      return "Fácil";

    case "medium":
      return "Media";

    case "hard":
      return "Difícil";

    default:
      return null;
  }
}


export function RecipeCard({
  recipe,
}: RecipeCardProps) {
  const difficultyLabel =
    getDifficultyLabel(
      recipe.difficulty,
    );


  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {recipe.imageUrl ? (
            <img
              src={
                recipe.imageUrl
              }
              alt={
                recipe.title
              }
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Imagen no disponible
            </div>
          )}


          {recipe.featured ? (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand shadow-sm">
              <Star
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Destacada
            </div>
          ) : null}
        </div>


        <div className="p-5">
          <h2 className="font-serif text-2xl font-bold leading-tight text-foreground">
            {recipe.title}
          </h2>


          {recipe.shortDescription ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {
                recipe.shortDescription
              }
            </p>
          ) : null}


          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {recipe.totalMinutes >
            0 ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock3
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {
                  recipe.totalMinutes
                } min
              </span>
            ) : null}


            {recipe.baseServings ? (
              <span className="inline-flex items-center gap-1.5">
                <Users
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                {
                  recipe.baseServings
                } raciones
              </span>
            ) : null}


            {difficultyLabel ? (
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
                {
                  difficultyLabel
                }
              </span>
            ) : null}
          </div>


          <div className="mt-5 text-sm font-semibold text-brand">
            Ver receta →
          </div>
        </div>
      </Link>
    </article>
  );
}