import { z } from "zod";

export const ingredientSchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .trim()
    .min(1, "El ingrediente necesita un nombre.")
    .max(
      120,
      "El nombre no puede superar los 120 caracteres.",
    ),

  quantity: z
    .number()
    .nonnegative(
      "La cantidad no puede ser negativa.",
    )
    .nullable(),

  unit: z
    .string()
    .trim()
    .max(
      40,
      "La unidad no puede superar los 40 caracteres.",
    )
    .nullable(),

  notes: z
    .string()
    .trim()
    .max(
      250,
      "Las notas no pueden superar los 250 caracteres.",
    )
    .nullable(),

  scalable: z.boolean(),

  position: z
    .number()
    .int()
    .nonnegative(),
});

export const ingredientGroupSchema = z.object({
  id: z.string().optional(),

  name: z
    .string()
    .trim()
    .min(
      1,
      "El grupo necesita un nombre.",
    )
    .max(
      100,
      "El nombre del grupo no puede superar los 100 caracteres.",
    ),

  position: z
    .number()
    .int()
    .nonnegative(),

  ingredients: z
    .array(ingredientSchema),
});

export type IngredientFormData =
  z.infer<typeof ingredientSchema>;

export type IngredientGroupFormData =
  z.infer<typeof ingredientGroupSchema>;