"use server";

import { revalidatePath } from "next/cache";

import {
  updateRecipeImagePath,
} from "@/services/recipes/recipe-service";

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