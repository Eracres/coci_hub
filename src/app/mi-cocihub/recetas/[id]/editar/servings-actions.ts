"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  normalizeRecipeServings,
  recipeServingsSchema,
  type RecipeServingsFormData,
} from "@/schemas/recipe-servings-schema";

import {
  updateMyRecipeServings,
} from "@/services/recipes/community-recipe-service";


export type UpdateMyRecipeServingsResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    baseServings?:
      string[];
  };
};


/* =========================================================
   UPDATE COMMUNITY RECIPE SERVINGS
========================================================= */

export async function updateMyRecipeServingsAction(
  recipeId:
    string,

  input:
    RecipeServingsFormData,
): Promise<
  UpdateMyRecipeServingsResult
> {

  const validation =
    recipeServingsSchema.safeParse(
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
    normalizeRecipeServings(
      validation.data,
    );


  try {
    await updateMyRecipeServings(
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
        "Raciones guardadas correctamente.",
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


    console.error(
      "UPDATE COMMUNITY SERVINGS ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudieron guardar las raciones.",
    };
  }
}