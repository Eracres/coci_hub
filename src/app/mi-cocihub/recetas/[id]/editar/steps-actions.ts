"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  normalizeRecipeSteps,
  recipeStepsSchema,
  type RecipeStepsFormData,
} from "@/schemas/recipe-steps-schema";

import {
  replaceRecipeSteps,
} from "@/services/recipes/recipe-service";


export type UpdateMyRecipeStepsResult = {
  success:
    boolean;

  message?:
    string;
};


/* =========================================================
   UPDATE COMMUNITY RECIPE STEPS
========================================================= */

export async function updateMyRecipeStepsAction(
  recipeId:
    string,

  input:
    RecipeStepsFormData,
): Promise<
  UpdateMyRecipeStepsResult
> {

  // =======================================================
  // SCHEMA VALIDATION
  // =======================================================

  const validation =
    recipeStepsSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      message:
        validation.error
          .issues[0]
          ?.message ??
        "Hay datos de elaboración que no son válidos.",
    };
  }


  // =======================================================
  // AT LEAST ONE STEP
  // =======================================================

  if (
    validation.data.steps.length <
    1
  ) {
    return {
      success:
        false,

      message:
        "Añade al menos un paso de elaboración para continuar.",
    };
  }


  // =======================================================
  // NORMALIZE
  // =======================================================

  const normalized =
    normalizeRecipeSteps(
      validation.data,
    );


  // =======================================================
  // PERSIST
  // =======================================================

  try {
    await replaceRecipeSteps(
      recipeId,
      normalized,
    );


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
        "Elaboración guardada correctamente.",
    };
  } catch (error) {

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
      "UPDATE COMMUNITY STEPS ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo guardar la elaboración.",
    };
  }
}
