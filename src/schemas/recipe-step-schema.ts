import { z } from "zod";

export const recipeStepSchema = z.object({
  id: z.string().optional(),

  title: z
    .string()
    .trim()
    .max(
      120,
      "El título no puede superar los 120 caracteres.",
    )
    .nullable(),

  instructions: z
    .string()
    .trim()
    .min(
      10,
      "La explicación debe tener al menos 10 caracteres.",
    )
    .max(
      2500,
      "La explicación es demasiado larga.",
    ),

  durationMinutes: z
    .number()
    .int()
    .nonnegative(
      "La duración no puede ser negativa.",
    )
    .nullable(),

  tip: z
    .string()
    .trim()
    .max(
      800,
      "El consejo no puede superar los 800 caracteres.",
    )
    .nullable(),

  imageUrl: z
    .string()
    .url(
      "La imagen debe tener una URL válida.",
    )
    .nullable(),

  position: z
    .number()
    .int()
    .nonnegative(),
});

export type RecipeStepFormData =
  z.infer<typeof recipeStepSchema>;