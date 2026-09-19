/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import {
  ArrowRight,
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
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-md">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-page-muted">
          {recipe.imageUrl ? (
            <img
              src={
                recipe.imageUrl
              }
              alt={
                recipe.title
              }
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <span className="rounded-full bg-surface px-4 py-2 text-sm text-muted-foreground shadow-sm">
                Imagen no disponible
              </span>
            </div>
          )}


          {recipe.featured ? (
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-surface/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-sm backdrop-blur-sm">
              <Star
                className="size-3.5 fill-accent text-accent"
                aria-hidden="true"
              />

              Destacada
            </div>
          ) : null}
        </div>


        <div className="flex flex-1 flex-col p-5 md:p-6">
          <h2 className="font-serif text-2xl font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-brand">
            {recipe.title}
          </h2>


          {recipe.shortDescription ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {
                recipe.shortDescription
              }
            </p>
          ) : null}


          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {recipe.totalMinutes >
            0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-page-muted px-3 py-1.5">
                <Clock3
                  className="size-4 text-brand"
                  aria-hidden="true"
                />

                {
                  recipe.totalMinutes
                } min
              </span>
            ) : null}


            {recipe.baseServings ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-page-muted px-3 py-1.5">
                <Users
                  className="size-4 text-secondary-hover"
                  aria-hidden="true"
                />

                {
                  recipe.baseServings
                } raciones
              </span>
            ) : null}


            {difficultyLabel ? (
              <span className="rounded-full bg-secondary/20 px-3 py-1.5 text-xs font-semibold text-secondary-hover">
                {
                  difficultyLabel
                }
              </span>
            ) : null}
          </div>


          <div className="mt-auto pt-6">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors group-hover:text-brand-hover">
              Ver receta

              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}