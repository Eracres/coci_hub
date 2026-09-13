"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  normalizeRecipeAdditionalInfo,
  recipeAdditionalInfoSchema,
  type RecipeAdditionalInfoFormData,
} from "@/schemas/recipe-additional-info-schema";

import {
  normalizeRecipeAllergens,
  recipeAllergensSchema,
  type RecipeAllergensFormData,
} from "@/schemas/recipe-allergens-schema";

import {
  normalizeRecipeBasicInfo,
  recipeBasicInfoSchema,
  type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

import {
  normalizeRecipeClassification,
  recipeClassificationSchema,
  type RecipeClassificationFormData,
} from "@/schemas/recipe-classification-schema";

import {
  normalizeRecipeIngredients,
  recipeIngredientsSchema,
  type RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";

import {
  recipeStatusSchema,
  type RecipeStatus,
} from "@/schemas/recipe-publication-schema";

import {
  normalizeRecipeServings,
  recipeServingsSchema,
  type RecipeServingsFormData,
} from "@/schemas/recipe-servings-schema";

import {
  normalizeRecipeSteps,
  recipeStepsSchema,
  type RecipeStepsFormData,
} from "@/schemas/recipe-steps-schema";

import {
  normalizeRecipeTimes,
  recipeTimesSchema,
  type RecipeTimesFormData,
} from "@/schemas/recipe-times-schema";

import {
  deleteRecipe,
  replaceRecipeAllergens,
  replaceRecipeIngredients,
  replaceRecipeSteps,
  updateRecipeAdditionalInfo,
  updateRecipeBasicInfo,
  updateRecipeClassification,
  updateRecipeImagePath,
  updateRecipeServings,
  updateRecipeStatus,
  updateRecipeTimes,
} from "@/services/recipes/recipe-service";


/* =========================================================
   IMAGE
========================================================= */

export async function updateRecipeImageAction(
  recipeId: string,
  imagePath: string | null,
) {
  if (!recipeId) {
    throw new Error(
      "La receta no tiene un identificador válido.",
    );
  }

  if (
    imagePath !== null &&
    !imagePath.startsWith(
      `recipes/${recipeId}/`,
    )
  ) {
    throw new Error(
      "La ruta de imagen no pertenece a esta receta.",
    );
  }

  await updateRecipeImagePath(
    recipeId,
    imagePath,
  );

  revalidatePath(
    `/admin/recipes/${recipeId}/edit`,
  );

  revalidatePath(
    "/admin/recipes",
  );
}


/* =========================================================
   BASIC INFO
========================================================= */

export type UpdateBasicInfoResult = {
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


export async function updateRecipeBasicInfoAction(
  recipeId: string,
  input: RecipeBasicInfoFormData,
): Promise<UpdateBasicInfoResult> {
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

  const normalizedData =
    normalizeRecipeBasicInfo(
      validation.data,
    );

  try {
    await updateRecipeBasicInfo(
      recipeId,
      normalizedData,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Información básica guardada.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE BASIC INFO ERROR:",
      error,
    );

    if (
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error &&
      error.code ===
        "23505"
    ) {
      return {
        success:
          false,

        fieldErrors: {
          slug: [
            "Ya existe otra receta con este slug.",
          ],
        },
      };
    }

    return {
      success:
        false,

      message:
        "No se pudieron guardar los cambios.",
    };
  }
}


/* =========================================================
   CLASSIFICATION
========================================================= */

export type UpdateClassificationResult = {
  success:
    boolean;

  message?:
    string;
};


export async function updateRecipeClassificationAction(
  recipeId: string,
  input: RecipeClassificationFormData,
): Promise<UpdateClassificationResult> {
  const validation =
    recipeClassificationSchema.safeParse(
      input,
    );

  if (
    !validation.success
  ) {
    return {
      success:
        false,

      message:
        "Los datos de clasificación no son válidos.",
    };
  }

  const normalized =
    normalizeRecipeClassification(
      validation.data,
    );

  try {
    await updateRecipeClassification(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Clasificación guardada correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE CLASSIFICATION ERROR:",
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


/* =========================================================
   SERVINGS
========================================================= */

export type UpdateRecipeServingsResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    baseServings?:
      string[];
  };
};


export async function updateRecipeServingsAction(
  recipeId: string,
  input: RecipeServingsFormData,
): Promise<UpdateRecipeServingsResult> {
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
    await updateRecipeServings(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Raciones guardadas correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE SERVINGS ERROR:",
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


/* =========================================================
   TIMES
========================================================= */

export type UpdateRecipeTimesResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    preparationMinutes?:
      string[];

    cookingMinutes?:
      string[];

    additionalMinutes?:
      string[];
  };
};


export async function updateRecipeTimesAction(
  recipeId: string,
  input: RecipeTimesFormData,
): Promise<UpdateRecipeTimesResult> {
  const validation =
    recipeTimesSchema.safeParse(
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
    normalizeRecipeTimes(
      validation.data,
    );

  try {
    await updateRecipeTimes(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Tiempos guardados correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE TIMES ERROR:",
      error,
    );

    return {
      success:
        false,

      message:
        "No se pudieron guardar los tiempos.",
    };
  }
}


/* =========================================================
   INGREDIENTS
========================================================= */

export type UpdateRecipeIngredientsResult = {
  success:
    boolean;

  message?:
    string;
};


export async function updateRecipeIngredientsAction(
  recipeId: string,
  input: RecipeIngredientsFormData,
): Promise<UpdateRecipeIngredientsResult> {
  const validation =
    recipeIngredientsSchema.safeParse(
      input,
    );

  if (
    !validation.success
  ) {
    console.error(
      "INGREDIENT VALIDATION ERROR:",
      validation.error.flatten(),
    );

    return {
      success:
        false,

      message:
        "Hay datos de ingredientes que no son válidos.",
    };
  }

  const normalized =
    normalizeRecipeIngredients(
      validation.data,
    );

  try {
    await replaceRecipeIngredients(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Ingredientes guardados correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE INGREDIENTS ERROR:",
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


/* =========================================================
   STEPS
========================================================= */

export type UpdateRecipeStepsResult = {
  success:
    boolean;

  message?:
    string;
};


export async function updateRecipeStepsAction(
  recipeId: string,
  input: RecipeStepsFormData,
): Promise<UpdateRecipeStepsResult> {
  const validation =
    recipeStepsSchema.safeParse(
      input,
    );

  if (
    !validation.success
  ) {
    console.error(
      "STEP VALIDATION ERROR:",
      validation.error.flatten(),
    );

    return {
      success:
        false,

      message:
        "Hay datos de elaboración que no son válidos.",
    };
  }

  const normalized =
    normalizeRecipeSteps(
      validation.data,
    );

  try {
    await replaceRecipeSteps(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Elaboración guardada correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE STEPS ERROR:",
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


/* =========================================================
   ADDITIONAL INFO
========================================================= */

export type UpdateRecipeAdditionalInfoResult = {
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


export async function updateRecipeAdditionalInfoAction(
  recipeId: string,
  input:
    RecipeAdditionalInfoFormData,
): Promise<UpdateRecipeAdditionalInfoResult> {
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

  try {
    await updateRecipeAdditionalInfo(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Información adicional guardada correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE ADDITIONAL INFO ERROR:",
      error,
    );

    return {
      success:
        false,

      message:
        "No se pudo guardar la información adicional.",
    };
  }
}


/* =========================================================
   ALLERGENS
========================================================= */

export type UpdateRecipeAllergensResult = {
  success:
    boolean;

  message?:
    string;
};


export async function updateRecipeAllergensAction(
  recipeId: string,
  input: RecipeAllergensFormData,
): Promise<UpdateRecipeAllergensResult> {
  const validation =
    recipeAllergensSchema.safeParse(
      input,
    );

  if (
    !validation.success
  ) {
    console.error(
      "ALLERGEN VALIDATION ERROR:",
      validation.error.flatten(),
    );

    return {
      success:
        false,

      message:
        "Los datos de alérgenos no son válidos.",
    };
  }

  const normalized =
    normalizeRecipeAllergens(
      validation.data,
    );

  try {
    await replaceRecipeAllergens(
      recipeId,
      normalized,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success:
        true,

      message:
        "Alérgenos guardados correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE ALLERGENS ERROR:",
      error,
    );

    return {
      success:
        false,

      message:
        "No se pudieron guardar los alérgenos.",
    };
  }
}


/* =========================================================
   PUBLICATION STATUS
========================================================= */

export type UpdateRecipeStatusResult = {
  success:
    boolean;

  message?:
    string;
};


export async function updateRecipeStatusAction(
  recipeId: string,
  status: RecipeStatus,
): Promise<UpdateRecipeStatusResult> {
  const validation =
    recipeStatusSchema.safeParse(
      status,
    );

  if (
    !validation.success
  ) {
    return {
      success:
        false,

      message:
        "El estado solicitado no es válido.",
    };
  }

  try {
    await updateRecipeStatus(
      recipeId,
      validation.data,
    );

    revalidatePath(
      `/admin/recipes/${recipeId}/edit`,
    );

    revalidatePath(
      "/admin/recipes",
    );

    revalidatePath(
      "/recipes",
    );

    return {
      success:
        true,

      message:
        validation.data ===
        "published"
          ? "Receta publicada correctamente."
          : validation.data ===
              "archived"
            ? "Receta archivada correctamente."
            : "La receta ha vuelto a borrador.",
    };
  } catch (error) {
    console.error(
      "UPDATE RECIPE STATUS ERROR:",
      error,
    );

    return {
      success:
        false,

      message:
        "No se pudo cambiar el estado de la receta.",
    };
  }
}


/* =========================================================
   DELETE RECIPE
========================================================= */

export type DeleteRecipeResult = {
  success:
    boolean;

  message?:
    string;
};


export async function deleteRecipeAction(
  recipeId: string,
  confirmationTitle: string,
): Promise<DeleteRecipeResult> {
  if (
    confirmationTitle.trim() ===
    ""
  ) {
    return {
      success:
        false,

      message:
        "Debes escribir el título de la receta para confirmar.",
    };
  }


  try {
    const result =
      await deleteRecipe(
        recipeId,
        confirmationTitle,
      );


    revalidatePath(
      "/admin/recipes",
    );

    revalidatePath(
      "/recipes",
    );


    return {
      success:
        true,

      message:
        result.storageCleanupWarning
          ? "La receta se eliminó, pero no se pudo limpiar completamente su imagen de Storage."
          : "Receta eliminada correctamente.",
    };
  } catch (error) {
    console.error(
      "DELETE RECIPE ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo eliminar la receta. Comprueba que no esté publicada y que el título de confirmación sea exacto.",
    };
  }
}