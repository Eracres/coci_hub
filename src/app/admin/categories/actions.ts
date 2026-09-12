"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  categorySchema,
  normalizeCategory,
} from "@/schemas/category-schema";

import {
  createCategory,
  deleteCategory,
} from "@/services/categories/category-service";


export type CategoryActionResult = {
  success: boolean;

  message?: string;

  fieldErrors?: {
    name?: string[];
    description?: string[];
  };
};


export async function createCategoryAction(
  formData: FormData,
): Promise<CategoryActionResult> {
  const validation =
    categorySchema.safeParse({
      name:
        formData.get("name"),

      description:
        formData.get(
          "description",
        ),
    });

  if (!validation.success) {
    return {
      success: false,

      fieldErrors:
        validation.error
          .flatten()
          .fieldErrors,
    };
  }

  const normalized =
    normalizeCategory(
      validation.data,
    );

  try {
    await createCategory(
      normalized,
    );

    revalidatePath(
      "/admin/categories",
    );

    revalidatePath(
      "/admin/recipes",
    );

    return {
      success: true,
      message:
        "Categoría creada correctamente.",
    };
  } catch (error) {
    console.error(
      "CREATE CATEGORY ERROR:",
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
          name: [
            "Ya existe una categoría con ese nombre o slug.",
          ],
        },
      };
    }

    return {
      success: false,
      message:
        "No se pudo crear la categoría.",
    };
  }
}


export async function deleteCategoryAction(
  categoryId: string,
): Promise<void> {
  if (!categoryId) {
    return;
  }

  try {
    await deleteCategory(
      categoryId,
    );

    revalidatePath(
      "/admin/categories",
    );
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error,
    );
  }
}