"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
  errorMessageIncludes,
} from "@/lib/errors/supabase-error";

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
   REVALIDATION
========================================================= */

function revalidateRecipeAdminPaths(
  recipeId: string,
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
}


/* =========================================================
   COMMON ERROR MAPPING
========================================================= */

function getCommonRecipeErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (
    errorHasCode(
      error,
      "42501",
    ) ||
    errorMessageIncludes(
      error,
      "not authorized",
    )
  ) {
    return "No tienes permisos para realizar esta operación.";
  }


  if (
    errorHasCode(
      error,
      "P0002",
    ) ||
    errorMessageIncludes(
      error,
      "recipe not found",
    )
  ) {
    return "La receta ya no existe.";
  }


  return fallback;
}


/* =========================================================
   PUBLICATION ERROR MAPPING
========================================================= */

function getPublicationErrorMessage(
  error: unknown,
) {
  if (
    errorMessageIncludes(
      error,
      "recipe title is required",
    )
  ) {
    return "Falta el título de la receta.";
  }


  if (
    errorMessageIncludes(
      error,
      "recipe slug is required",
    )
  ) {
    return "Falta el slug de la receta.";
  }


  if (
    errorMessageIncludes(
      error,
      "short description is required",
    )
  ) {
    return "Falta la descripción corta de la receta.";
  }


  if (
    errorMessageIncludes(
      error,
      "main image is required",
    )
  ) {
    return "Falta la imagen principal de la receta.";
  }


  if (
    errorMessageIncludes(
      error,
      "recipe type is required",
    )
  ) {
    return "Falta seleccionar el tipo de receta.";
  }


  if (
    errorMessageIncludes(
      error,
      "difficulty is required",
    )
  ) {
    return "Falta indicar la dificultad de la receta.";
  }


  if (
    errorMessageIncludes(
      error,
      "base servings are required",
    )
  ) {
    return "Falta indicar las raciones base.";
  }


  if (
    errorMessageIncludes(
      error,
      "preparation time must be greater than zero",
    )
  ) {
    return "El tiempo de preparación debe ser mayor que cero.";
  }


  if (
    errorMessageIncludes(
      error,
      "at least one category is required",
    )
  ) {
    return "Falta al menos una categoría para poder publicar.";
  }


  if (
    errorMessageIncludes(
      error,
      "at least one ingredient is required",
    )
  ) {
    return "Falta al menos un ingrediente para poder publicar.";
  }


  if (
    errorMessageIncludes(
      error,
      "at least one recipe step is required",
    )
  ) {
    return "Falta al menos un paso de elaboración para poder publicar.";
  }


  if (
    errorMessageIncludes(
      error,
      "invalid recipe status",
    )
  ) {
    return "El estado solicitado para la receta no es válido.";
  }


  return getCommonRecipeErrorMessage(
    error,
    "No se pudo cambiar el estado de la receta.",
  );
}


/* =========================================================
   DELETE ERROR MAPPING
========================================================= */

function getDeleteRecipeErrorMessage(
  error: unknown,
) {
  if (
    errorMessageIncludes(
      error,
      "published recipes cannot be deleted",
    )
  ) {
    return "No puedes eliminar directamente una receta publicada. Despublícala o archívala primero.";
  }


  if (
    errorMessageIncludes(
      error,
      "recipe title confirmation does not match",
    )
  ) {
    return "El título de confirmación no coincide exactamente con el título de la receta.";
  }


  return getCommonRecipeErrorMessage(
    error,
    "No se pudo eliminar la receta.",
  );
}


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


  try {
    await updateRecipeImagePath(
      recipeId,
      imagePath,
    );


    revalidateRecipeAdminPaths(
      recipeId,
    );
  } catch (error) {
    console.error(
      "UPDATE RECIPE IMAGE ERROR:",
      error,
    );


    throw new Error(
      getCommonRecipeErrorMessage(
        error,
        "No se pudo actualizar la imagen principal.",
      ),
    );
  }
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


    revalidateRecipeAdminPaths(
      recipeId,
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
            "Ya existe otra receta con este slug.",
          ],
        },
      };
    }


    return {
      success:
        false,

      message:
        getCommonRecipeErrorMessage(
          error,
          "No se pudieron guardar los cambios.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudo guardar la clasificación.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudieron guardar las raciones.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudieron guardar los tiempos.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudieron guardar los ingredientes.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudo guardar la elaboración.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudo guardar la información adicional.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getCommonRecipeErrorMessage(
          error,
          "No se pudieron guardar los alérgenos.",
        ),
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


    revalidateRecipeAdminPaths(
      recipeId,
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
        getPublicationErrorMessage(
          error,
        ),
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
        getDeleteRecipeErrorMessage(
          error,
        ),
    };
  }
}