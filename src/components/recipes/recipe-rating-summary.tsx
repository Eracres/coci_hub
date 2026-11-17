import {
  Star,
} from "lucide-react";

import {
  getRecipeRatingSummary,
} from "@/services/recipes/recipe-rating-service";


type RecipeRatingSummaryProps = {
  recipeId:
    string;
};


function getRatingLabel(
  count:
    number,
) {
  if (
    count ===
    0
  ) {
    return "Sin valoraciones";
  }


  if (
    count ===
    1
  ) {
    return "1 valoración";
  }


  return `${count} valoraciones`;
}


export async function RecipeRatingSummary({
  recipeId,
}: RecipeRatingSummaryProps) {
  const summary =
    await getRecipeRatingSummary(
      recipeId,
    );


  const roundedRating =
    summary.averageRating ===
      null
      ? 0
      : Math.round(
          summary.averageRating,
        );


  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div
        className="flex items-center gap-1"
        aria-label={
          summary.averageRating ===
          null
            ? "Esta receta todavía no tiene valoraciones"
            : `Valoración media ${summary.averageRating.toFixed(1)} de 5`
        }
      >
        {[
          1,
          2,
          3,
          4,
          5,
        ].map(
          (
            star,
          ) => (
            <Star
              key={
                star
              }
              className={
                star <=
                roundedRating
                  ? "size-5 fill-accent text-accent"
                  : "size-5 text-border"
              }
              aria-hidden="true"
            />
          ),
        )}
      </div>


      <div className="flex items-baseline gap-2">
        {summary.averageRating !==
        null ? (
          <span className="font-semibold text-foreground">
            {summary.averageRating.toFixed(
              1,
            )}
          </span>
        ) : null}


        <span className="text-sm text-muted-foreground">
          {getRatingLabel(
            summary.ratingCount,
          )}
        </span>
      </div>


      {summary.currentUserRating !==
      null ? (
        <span className="rounded-full bg-page-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
          Tu valoración:{" "}
          {
            summary.currentUserRating
          }
          /5
        </span>
      ) : null}
    </div>
  );
}
