"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  communityRecipeClassificationSchema,
  normalizeCommunityRecipeClassification,
  type CommunityRecipeClassificationFormData,
} from "@/schemas/community-recipe-classification-schema";

import {
  updateMyRecipeClassification,
} from "@/services/recipes/community-recipe-service";


export type UpdateMyRecipeClassificationResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    recipeTypeId?:
      string[];

    difficulty?:
      string[];

    categoryIds?:
      string[];

    tagIds?:
      string[];
  };
};


/* =========================================================
   UPDATE COMMUNITY RECIPE CLASSIFICATION
========================================================= */

export async function updateMyRecipeClassificationAction(
  recipeId:
    string,

  input:
    CommunityRecipeClassificationFormData,
): Promise<
  UpdateMyRecipeClassificationResult
> {
  const validation =
    communityRecipeClassificationSchema.safeParse(
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
    normalizeCommunityRecipeClassification(
      validation.data,
    );


  try {
    await updateMyRecipeClassification(
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
        "Clasificación guardada correctamente.",
    };
  } catch (
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


    console.error(
      "UPDATE COMMUNITY CLASSIFICATION ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo guardar la clasificación.",
    };
  }
}