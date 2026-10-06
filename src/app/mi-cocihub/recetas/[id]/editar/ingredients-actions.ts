"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  normalizeRecipeIngredients,
  recipeIngredientsSchema,
  type RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";

import {
  replaceRecipeIngredients,
} from "@/services/recipes/recipe-service";


export type UpdateMyRecipeIngredientsResult = {
  success:
    boolean;

  message?:
    string;
};


/* =========================================================
   UPDATE COMMUNITY RECIPE INGREDIENTS
========================================================= */

export async function updateMyRecipeIngredientsAction(
  recipeId:
    string,

  input:
    RecipeIngredientsFormData,
): Promise<
  UpdateMyRecipeIngredientsResult
> {

  // =======================================================
  // SCHEMA VALIDATION
  // =======================================================

  const validation =
    recipeIngredientsSchema.safeParse(
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
        "Hay datos de ingredientes que no son válidos.",
    };
  }


  // =======================================================
  // AT LEAST ONE INGREDIENT
  // =======================================================

  const ingredientCount =
    validation.data.groups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group.ingredients.length,
      0,
    );


  if (
    ingredientCount <
    1
  ) {
    return {
      success:
        false,

      message:
        "Añade al menos un ingrediente para continuar.",
    };
  }


  // =======================================================
  // NORMALIZE
  // =======================================================

  const normalized =
    normalizeRecipeIngredients(
      validation.data,
    );


  // =======================================================
  // PERSIST
  // =======================================================

  try {
    await replaceRecipeIngredients(
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
        "Ingredientes guardados correctamente.",
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
      "UPDATE COMMUNITY INGREDIENTS ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudieron guardar los ingredientes.",
    };
  }
}
