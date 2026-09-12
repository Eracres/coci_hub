import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      2,
      "El nombre debe tener al menos 2 caracteres.",
    )
    .max(
      80,
      "El nombre no puede superar los 80 caracteres.",
    ),

  description: z
    .string()
    .trim()
    .max(
      500,
      "La descripción no puede superar los 500 caracteres.",
    ),
});

export type CategoryFormData =
  z.infer<typeof categorySchema>;

export type CategoryData = {
  name: string;
  description: string | null;
};

export function normalizeCategory(
  data: CategoryFormData,
): CategoryData {
  return {
    name: data.name,

    description:
      data.description === ""
        ? null
        : data.description,
  };
}