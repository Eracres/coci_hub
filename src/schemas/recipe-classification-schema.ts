import { z } from "zod";

export const recipeClassificationSchema = z.object({
  recipeTypeId: z.string(),

  difficulty: z.enum([
    "",
    "easy",
    "medium",
    "hard",
  ]),

  categoryIds: z.array(
    z.string().uuid(),
  ),

  tagIds: z
    .array(
      z.string().uuid(),
    )
    .max(
      10,
      "No puedes seleccionar más de 10 etiquetas.",
    ),

  featured: z.boolean(),
});

export type RecipeClassificationFormData =
  z.infer<typeof recipeClassificationSchema>;

export type RecipeClassificationData = {
  recipeTypeId: string | null;

  difficulty:
    | "easy"
    | "medium"
    | "hard"
    | null;

  categoryIds: string[];

  tagIds: string[];

  featured: boolean;
};

export function normalizeRecipeClassification(
  data: RecipeClassificationFormData,
): RecipeClassificationData {
  return {
    recipeTypeId:
      data.recipeTypeId === ""
        ? null
        : data.recipeTypeId,

    difficulty:
      data.difficulty === ""
        ? null
        : data.difficulty,

    categoryIds:
      data.categoryIds,

    tagIds:
      data.tagIds,

    featured:
      data.featured,
  };
}
