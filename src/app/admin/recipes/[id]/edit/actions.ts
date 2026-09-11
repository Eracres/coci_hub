"use server";

import { revalidatePath } from "next/cache";

import {
    updateRecipeImagePath,
} from "@/services/recipes/recipe-service";

import {
    normalizeRecipeBasicInfo,
    recipeBasicInfoSchema,
    type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

import {
    updateRecipeBasicInfo,
} from "@/services/recipes/recipe-service";

import {
  normalizeRecipeClassification,
  recipeClassificationSchema,
  type RecipeClassificationFormData,
} from "@/schemas/recipe-classification-schema";

import {
  updateRecipeClassification,
} from "@/services/recipes/recipe-service";

export type UpdateBasicInfoResult = {
    success: boolean;
    message?: string;

    fieldErrors?: {
        title?: string[];
        slug?: string[];
        shortDescription?: string[];
        introduction?: string[];
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

    if (!validation.success) {
        return {
            success: false,

            fieldErrors:
                validation.error.flatten()
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
            success: true,
            message:
                "Información básica guardada.",
        };
    } catch (error) {
        console.error(
            "UPDATE RECIPE BASIC INFO ERROR:",
            error,
        );

        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            return {
                success: false,

                fieldErrors: {
                    slug: [
                        "Ya existe otra receta con este slug.",
                    ],
                },
            };
        }

        return {
            success: false,
            message:
                "No se pudieron guardar los cambios.",
        };
    }
}

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
        !imagePath.startsWith(`recipes/${recipeId}/`)
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

    revalidatePath("/admin/recipes");
}

export type UpdateClassificationResult = {
  success: boolean;
  message?: string;
};

export async function updateRecipeClassificationAction(
  recipeId: string,
  input: RecipeClassificationFormData,
): Promise<UpdateClassificationResult> {
  const validation =
    recipeClassificationSchema.safeParse(
      input,
    );

  if (!validation.success) {
    return {
      success: false,
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
      success: true,
      message:
        "Clasificación guardada correctamente.",
    };
  } catch (error) {
    console.error(
      "UPDATE CLASSIFICATION ERROR:",
      error,
    );

    return {
      success: false,
      message:
        "No se pudo guardar la clasificación.",
    };
  }
}