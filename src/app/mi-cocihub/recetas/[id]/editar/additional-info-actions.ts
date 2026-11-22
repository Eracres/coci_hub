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
  normalizeRecipeAdditionalInfo,
  recipeAdditionalInfoSchema,
  type RecipeAdditionalInfoFormData,
} from "@/schemas/recipe-additional-info-schema";


export type UpdateMyRecipeAdditionalInfoResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    tips?:
      string[];

    substitutions?:
      string[];

    storage?:
      string[];

    freezing?:
      string[];

    reheating?:
      string[];

    sourceType?:
      string[];

    sourceTitle?:
      string[];

    sourceAuthor?:
      string[];

    sourcePage?:
      string[];

    sourceUrl?:
      string[];

    sourceNotes?:
      string[];
  };
};


/* =========================================================
   UPDATE COMMUNITY RECIPE ADDITIONAL INFO
========================================================= */

export async function updateMyRecipeAdditionalInfoAction(
  recipeId:
    string,

  input:
    RecipeAdditionalInfoFormData,
): Promise<
  UpdateMyRecipeAdditionalInfoResult
> {
  // =======================================================
  // VALIDATION
  // =======================================================

  const validation =
    recipeAdditionalInfoSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      message:
        "Revisa los datos de información adicional.",

      fieldErrors:
        validation.error
          .flatten()
          .fieldErrors,
    };
  }


  const normalized =
    normalizeRecipeAdditionalInfo(
      validation.data,
    );


  // =======================================================
  // PERSIST
  // =======================================================

  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "update_my_recipe_additional_info",
      {
        p_recipe_id:
          recipeId,

        p_tips:
          normalized.tips,

        p_substitutions:
          normalized.substitutions,

        p_storage:
          normalized.storage,

        p_freezing:
          normalized.freezing,

        p_reheating:
          normalized.reheating,

        p_source_type:
          normalized.sourceType,

        p_source_title:
          normalized.sourceTitle,

        p_source_author:
          normalized.sourceAuthor,

        p_source_page:
          normalized.sourcePage,

        p_source_url:
          normalized.sourceUrl,

        p_source_notes:
          normalized.sourceNotes,
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


    console.error(
      "UPDATE COMMUNITY ADDITIONAL INFO ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo guardar la información adicional.",
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
      "Información adicional guardada correctamente.",
  };
}
