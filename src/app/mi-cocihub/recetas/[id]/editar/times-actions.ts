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

import {
  communityRecipeTimesSchema,
  normalizeCommunityRecipeTimes,
  type CommunityRecipeTimesFormData,
} from "@/schemas/community-recipe-times-schema";


export type UpdateMyRecipeTimesResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    preparationMinutes?:
      string[];
  };
};


/* =========================================================
   UPDATE COMMUNITY RECIPE TIMES
========================================================= */

export async function updateMyRecipeTimesAction(
  recipeId:
    string,

  input:
    CommunityRecipeTimesFormData,
): Promise<
  UpdateMyRecipeTimesResult
> {

  // =======================================================
  // VALIDATION
  // =======================================================

  const validation =
    communityRecipeTimesSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      fieldErrors:
        validation.error
          .flatten()
          .fieldErrors,
    };
  }


  const normalized =
    normalizeCommunityRecipeTimes(
      validation.data,
    );


  // =======================================================
  // PERSIST
  // =======================================================
  //
  // Only preparation time is entered manually.
  //
  // elaboration_minutes is derived automatically in the
  // database from recipe_steps.duration_minutes.
  // =======================================================

  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "update_my_recipe_preparation_time",
      {
        p_recipe_id:
          recipeId,

        p_preparation_minutes:
          normalized
            .preparationMinutes,
      },
    );


  if (
    error
  ) {
    if (
      errorHasCode(
        error,
        "42501",
      ) ||
      errorHasCode(
        error,
        "P0001",
      )
    ) {
      return {
        success:
          false,

        message:
          "Esta receta ya no puede editarse.",
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


    console.error(
      "UPDATE COMMUNITY TIMES ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo guardar el tiempo de preparación.",
    };
  }


  // =======================================================
  // REVALIDATION
  // =======================================================

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
      "Tiempos guardados correctamente.",
  };
}
