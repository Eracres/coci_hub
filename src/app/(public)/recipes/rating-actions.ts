"use server";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  deleteRecipeRating,
  setRecipeRating,
} from "@/services/recipes/recipe-rating-service";


export type RecipeRatingActionResult = {
  success:
    boolean;

  message:
    string;

  currentUserRating:
    number | null;
};


function getRatingErrorMessage(
  error:
    unknown,
) {
  if (
    errorHasCode(
      error,
      "42501",
    )
  ) {
    return "Necesitas iniciar sesión para valorar una receta.";
  }


  if (
    errorHasCode(
      error,
      "P0002",
    )
  ) {
    return "No se encontró la receta o tu perfil de usuario.";
  }


  if (
    errorHasCode(
      error,
      "22023",
    )
  ) {
    return "Solo se pueden valorar recetas publicadas.";
  }


  return "No se pudo guardar la valoración.";
}


/* =========================================================
   SET RATING
========================================================= */

export async function setRecipeRatingAction(
  recipeId:
    string,

  rating:
    number,
): Promise<RecipeRatingActionResult> {
  if (
    !recipeId
  ) {
    return {
      success:
        false,

      message:
        "La receta no tiene un identificador válido.",

      currentUserRating:
        null,
    };
  }


  if (
    !Number.isInteger(
      rating,
    ) ||
    rating <
      1 ||
    rating >
      5
  ) {
    return {
      success:
        false,

      message:
        "La valoración debe estar entre 1 y 5 estrellas.",

      currentUserRating:
        null,
    };
  }


  try {
    await setRecipeRating(
      recipeId,
      rating,
    );


    return {
      success:
        true,

      message:
        "Valoración guardada.",

      currentUserRating:
        rating,
    };

  } catch (
    error
  ) {
    console.error(
      "SET RECIPE RATING ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getRatingErrorMessage(
          error,
        ),

      currentUserRating:
        null,
    };
  }
}


/* =========================================================
   DELETE RATING
========================================================= */

export async function deleteRecipeRatingAction(
  recipeId:
    string,
): Promise<RecipeRatingActionResult> {
  if (
    !recipeId
  ) {
    return {
      success:
        false,

      message:
        "La receta no tiene un identificador válido.",

      currentUserRating:
        null,
    };
  }


  try {
    await deleteRecipeRating(
      recipeId,
    );


    return {
      success:
        true,

      message:
        "Valoración eliminada.",

      currentUserRating:
        null,
    };

  } catch (
    error
  ) {
    console.error(
      "DELETE RECIPE RATING ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getRatingErrorMessage(
          error,
        ),

      currentUserRating:
        null,
    };
  }
}
