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


type RecipeCardRatingSummary = {
  ratingCount:
    number;

  averageRating:
    number | null;
};


type RecipeCardProps = {
  recipe:
    PublicRecipeListItem;

  ratingSummary?:
    RecipeCardRatingSummary | null;
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


function getRatingCountLabel(
  count:
    number,
) {
  return count ===
    1
    ? "1 valoración"
    : `${count} valoraciones`;
}


export function RecipeCard({
  recipe,
  ratingSummary = null,
}: RecipeCardProps) {
  const difficultyLabel =
    getDifficultyLabel(
      recipe.difficulty,
    );


  const hasRatings =
    ratingSummary !==
      null &&
    ratingSummary.ratingCount >
      0 &&
    ratingSummary.averageRating !==
      null;


  return (
    <article className="group h-full">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
      >
        {/* =================================================
            IMAGE
        ================================================= */}

        <div className="relative aspect-[16/10] overflow-hidden bg-page-muted">
          {recipe.imageUrl ? (
            <img
              src={
                recipe.imageUrl
              }
              alt={
                recipe.title
              }
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <span className="rounded-full border border-border bg-surface/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                Imagen no disponible
              </span>
            </div>
          )}


          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />


          {recipe.featured ? (
            <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-sm backdrop-blur-sm">
              <Star
                className="size-3.5 fill-accent text-accent"
                aria-hidden="true"
              />

              Destacada
            </div>
          ) : null}


          {difficultyLabel ? (
            <span className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              {
                difficultyLabel
              }
            </span>
          ) : null}
        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex flex-1 flex-col p-5">

          {/* =================================================
              TITLE
          ================================================= */}

          <h2 className="font-serif text-[1.35rem] font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-brand">
            {
              recipe.title
            }
          </h2>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {recipe.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {
                recipe.shortDescription
              }
            </p>
          ) : null}


          {/* =================================================
              RATING
          ================================================= */}

          {hasRatings ? (
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-foreground">
                <Star
                  className="size-3.5 fill-accent text-accent"
                  aria-hidden="true"
                />

                {ratingSummary.averageRating!.toLocaleString(
                  "es-ES",
                  {
                    minimumFractionDigits:
                      1,

                    maximumFractionDigits:
                      1,
                  },
                )}
              </span>


              <span className="text-xs text-muted-foreground">
                {
                  getRatingCountLabel(
                    ratingSummary.ratingCount,
                  )
                }
              </span>
            </div>
          ) : null}


          {/* =================================================
              META
          ================================================= */}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {recipe.totalMinutes >
            0 ? (
              <span className="inline-flex items-center gap-1.5">
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
              <span className="inline-flex items-center gap-1.5">
                <Users
                  className="size-4 text-secondary-hover"
                  aria-hidden="true"
                />

                {
                  recipe.baseServings
                }{" "}
                {recipe.baseServings ===
                1
                  ? "ración"
                  : "raciones"}
              </span>
            ) : null}
          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="mt-auto pt-5">
            <div className="border-t border-border pt-4">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors group-hover:text-brand-hover">
                Ver receta

                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}