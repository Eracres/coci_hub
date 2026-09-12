import { z } from "zod";

export const recipeServingsSchema = z.object({
  baseServings: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" ||
        /^\d+$/.test(value),
      {
        message:
          "Las raciones deben ser un número entero.",
      },
    )
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }

        const servings =
          Number(value);

        return (
          servings >= 1 &&
          servings <= 100
        );
      },
      {
        message:
          "Las raciones deben estar entre 1 y 100.",
      },
    ),
});

export type RecipeServingsFormData =
  z.infer<typeof recipeServingsSchema>;

export type RecipeServingsData = {
  baseServings: number | null;
};

export function normalizeRecipeServings(
  data: RecipeServingsFormData,
): RecipeServingsData {
  return {
    baseServings:
      data.baseServings === ""
        ? null
        : Number(
            data.baseServings,
          ),
  };
}