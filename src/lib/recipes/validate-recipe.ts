import {
  publishedRecipeSchema,
  recipeSchema,
} from "@/schemas/recipe-schema";

export function validateDraftRecipe(
  data: unknown,
) {
  return recipeSchema.safeParse(
    data,
  );
}

export function validatePublishedRecipe(
  data: unknown,
) {
  return publishedRecipeSchema.safeParse(
    data,
  );
}

