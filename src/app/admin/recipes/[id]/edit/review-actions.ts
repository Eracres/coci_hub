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


export type RecipeReviewActionResult = {
  success:
    boolean;

  message?:
    string;
};


function revalidateReviewPaths(
  recipeId:
    string,
) {
  revalidatePath(
    "/admin/recipes",
  );


  revalidatePath(
    `/admin/recipes/${recipeId}/edit`,
  );


  revalidatePath(
    `/admin/recipes/${recipeId}/preview`,
  );


  revalidatePath(
    "/mi-cocihub",
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    "/recipes",
  );
}


function getReviewErrorMessage(
  error:
    unknown,

  fallback:
    string,
) {
  if (
    errorHasCode(
      error,
      "42501",
    )
  ) {
    return "No tienes permisos para moderar esta receta.";
  }


  if (
    errorHasCode(
      error,
      "P0002",
    )
  ) {
    return "La receta ya no existe.";
  }


  if (
    errorHasCode(
      error,
      "22023",
    )
  ) {
    return "La receta ya no se encuentra pendiente de revisión o los datos enviados no son válidos.";
  }


  return fallback;
}


/* =========================================================
   APPROVE
========================================================= */

export async function approveRecipeReviewAction(
  recipeId:
    string,
): Promise<
  RecipeReviewActionResult
> {
  const supabase =
    await createClient();


  try {
    const {
      error,
    } =
      await supabase.rpc(
        "approve_recipe_review",
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


    revalidateReviewPaths(
      recipeId,
    );


    return {
      success:
        true,

      message:
        "Receta aprobada y publicada correctamente.",
    };

  } catch (
    error
  ) {
    console.error(
      "APPROVE RECIPE REVIEW ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getReviewErrorMessage(
          error,
          "No se pudo aprobar la receta.",
        ),
    };
  }
}


/* =========================================================
   RETURN FOR CHANGES
========================================================= */

export async function returnRecipeReviewAction(
  recipeId:
    string,

  reviewNotes:
    string,
): Promise<
  RecipeReviewActionResult
> {
  const normalizedNotes =
    reviewNotes.trim();


  if (
    normalizedNotes.length ===
    0
  ) {
    return {
      success:
        false,

      message:
        "Debes indicar al autor qué cambios necesita realizar.",
    };
  }


  if (
    normalizedNotes.length >
    1500
  ) {
    return {
      success:
        false,

      message:
        "Las observaciones no pueden superar los 1500 caracteres.",
    };
  }


  const supabase =
    await createClient();


  try {
    const {
      error,
    } =
      await supabase.rpc(
        "return_recipe_review",
        {
          p_recipe_id:
            recipeId,

          p_review_notes:
            normalizedNotes,
        },
      );


    if (
      error
    ) {
      throw error;
    }


    revalidateReviewPaths(
      recipeId,
    );


    return {
      success:
        true,

      message:
        "La receta ha sido devuelta al autor con las observaciones indicadas.",
    };

  } catch (
    error
  ) {
    console.error(
      "RETURN RECIPE REVIEW ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getReviewErrorMessage(
          error,
          "No se pudo devolver la receta.",
        ),
    };
  }
}
