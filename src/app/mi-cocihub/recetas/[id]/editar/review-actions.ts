"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  createClient,
} from "@/lib/supabase/server";


export type SubmitRecipeReviewResult = {
  success:
    boolean;

  message?:
    string;
};


/* =========================================================
   SUBMIT COMMUNITY RECIPE FOR REVIEW
========================================================= */

export async function submitMyRecipeForReviewAction(
  recipeId:
    string,
): Promise<
  SubmitRecipeReviewResult
> {
  const supabase =
    await createClient();


  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase
      .auth
      .getClaims();


  const userId =
    claimsData
      ?.claims
      ?.sub;


  if (
    claimsError ||
    !userId
  ) {
    return {
      success:
        false,

      message:
        "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }


  const {
    error,
  } =
    await supabase.rpc(
      "submit_my_recipe_for_review",
      {
        p_recipe_id:
          recipeId,
      },
    );


  if (
    error
  ) {
    if (
      errorHasCode(
        error,
        "42501",
      )
    ) {
      return {
        success:
          false,

        message:
          "No tienes permiso para enviar esta receta a revisión.",
      };
    }


    if (
      errorHasCode(
        error,
        "P0002",
      )
    ) {
      return {
        success:
          false,

        message:
          "No se encontró la receta.",
      };
    }


    if (
      errorHasCode(
        error,
        "22023",
      )
    ) {
      return {
        success:
          false,

        message:
          "La receta todavía no cumple todos los requisitos para enviarse a revisión.",
      };
    }


    console.error(
      "SUBMIT COMMUNITY RECIPE REVIEW ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo enviar la receta a revisión.",
    };
  }


  revalidatePath(
    `/mi-cocihub/recetas/${recipeId}/editar`,
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    "/mi-cocihub",
  );


  return {
    success:
      true,

    message:
      "La receta se ha enviado a revisión.",
  };
}
