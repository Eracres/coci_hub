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

  isAuthenticated:
    boolean;
};


export type RecipeRatingListSummary = {
  ratingCount:
    number;

  averageRating:
    number | null;
};


export type RecipeRatingSummaryMap = Record<
  string,
  RecipeRatingListSummary
>;


type RecipeRatingSummaryRow = {
  rating_count:
    number | string | null;

  average_rating:
    number | string | null;

  current_user_rating:
    number | string | null;
};


type RecipeRatingSummariesRow = {
  recipe_id:
    string;

  rating_count:
    number | string | null;

  average_rating:
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
    data:
      claimsData,
  } =
    await supabase.auth.getClaims();


  const isAuthenticated =
    Boolean(
      claimsData
        ?.claims
        ?.sub,
    );


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

      isAuthenticated,
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

    isAuthenticated,
  };
}


/* =========================================================
   GET MULTIPLE RECIPE RATING SUMMARIES
========================================================= */

export async function getRecipeRatingSummaries(
  recipeIds:
    string[],
): Promise<RecipeRatingSummaryMap> {
  if (
    recipeIds.length ===
    0
  ) {
    return {};
  }


  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_recipe_rating_summaries",
      {
        p_recipe_ids:
          recipeIds,
      },
    );


  if (
    error
  ) {
    console.error(
      "GET RECIPE RATING SUMMARIES ERROR:",
      error,
    );


    throw new Error(
      "No se pudieron cargar las valoraciones de las recetas.",
    );
  }


  const rows =
    (
      data ??
      []
    ) as RecipeRatingSummariesRow[];


  return rows.reduce<
    RecipeRatingSummaryMap
  >(
    (
      summaries,
      row,
    ) => {
      summaries[
        row.recipe_id
      ] = {
        ratingCount:
          toNumber(
            row.rating_count,
          ) ??
          0,

        averageRating:
          toNumber(
            row.average_rating,
          ),
      };


      return summaries;
    },
    {},
  );
}


/* =========================================================
   SET RECIPE RATING
========================================================= */

export async function setRecipeRating(
  recipeId:
    string,

  rating:
    number,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "set_recipe_rating",
      {
        p_recipe_id:
          recipeId,

        p_rating:
          rating,
      },
    );


  if (
    error
  ) {
    throw error;
  }
}


/* =========================================================
   DELETE RECIPE RATING
========================================================= */

export async function deleteRecipeRating(
  recipeId:
    string,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "delete_recipe_rating",
      {
        p_recipe_id:
          recipeId,
      },
    );


  if (
    error
  ) {
    throw error;
  }
}