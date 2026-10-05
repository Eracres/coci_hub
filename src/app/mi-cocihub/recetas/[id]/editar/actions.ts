"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  recipeBasicInfoSchema,
  type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

import {
  updateMyRecipeBasicInfo,
} from "@/services/recipes/community-recipe-service";


export type UpdateMyRecipeBasicInfoResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    title?:
      string[];

    slug?:
      string[];

    shortDescription?:
      string[];

    introduction?:
      string[];
  };
};


/* =========================================================
   UPDATE COMMUNITY RECIPE BASIC INFO
========================================================= */

export async function updateMyRecipeBasicInfoAction(
  recipeId:
    string,

  input:
    RecipeBasicInfoFormData,
): Promise<
  UpdateMyRecipeBasicInfoResult
> {

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validation =
    recipeBasicInfoSchema.safeParse(
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


  /* =======================================================
     DATABASE
  ======================================================= */

  try {
    await updateMyRecipeBasicInfo(
      recipeId,
      validation.data,
    );


    revalidatePath(
      `/mi-cocihub/recetas/${recipeId}/editar`,
    );


    revalidatePath(
      "/mi-cocihub/recetas",
    );


    return {
      success:
        true,

      message:
        "Información básica guardada correctamente.",
    };
  } catch (error) {

    /* =====================================================
       DUPLICATE SLUG
    ===================================================== */

    if (
      errorHasCode(
        error,
        "23505",
      )
    ) {
      return {
        success:
          false,

        fieldErrors: {
          slug: [
            "Ya existe otra receta con esta dirección.",
          ],
        },
      };
    }


    /* =====================================================
       RECIPE LOCKED / NOT AUTHORIZED
    ===================================================== */

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
          "Esta receta ya no puede editarse. Puede estar en revisión, publicada o no pertenecerte.",
      };
    }


    console.error(
      "UPDATE COMMUNITY BASIC INFO ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudieron guardar los cambios.",
    };
  }
}
