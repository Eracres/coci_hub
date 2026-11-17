import {
  createClient,
} from "@/lib/supabase/server";


export type RecipeRatingSummary = {
  ratingCount:
    number;

  averageRating:
    number | null;

  currentUserRating:
    number | null;
};


type RecipeRatingSummaryRow = {
  rating_count:
    number | string | null;

  average_rating:
    number | string | null;

  current_user_rating:
    number | string | null;
};


function toNumber(
  value:
    number |
    string |
    null |
    undefined,
): number | null {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return null;
  }


  const parsed =
    typeof value ===
      "number"
      ? value
      : Number(
          value,
        );


  return Number.isFinite(
    parsed,
  )
    ? parsed
    : null;
}


/* =========================================================
   GET RECIPE RATING SUMMARY
========================================================= */

export async function getRecipeRatingSummary(
  recipeId:
    string,
): Promise<RecipeRatingSummary> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_recipe_rating_summary",
      {
        p_recipe_id:
          recipeId,
      },
    );


  if (
    error
  ) {
    console.error(
      "GET RECIPE RATING SUMMARY ERROR:",
      error,
    );


    throw new Error(
      "No se pudieron cargar las valoraciones de la receta.",
    );
  }


  const row =
    (
      data?.[0] ??
      null
    ) as RecipeRatingSummaryRow | null;


  if (
    !row
  ) {
    return {
      ratingCount:
        0,

      averageRating:
        null,

      currentUserRating:
        null,
    };
  }


  return {
    ratingCount:
      toNumber(
        row.rating_count,
      ) ??
      0,

    averageRating:
      toNumber(
        row.average_rating,
      ),

    currentUserRating:
      toNumber(
        row.current_user_rating,
      ),
  };
}
