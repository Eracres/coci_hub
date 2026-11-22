import {
  z,
} from "zod";


export const recipeBasicInfoSchema =
  z.object({
    title:
      z
        .string()
        .trim()
        .min(
          3,
          "El título debe tener al menos 3 caracteres.",
        )
        .max(
          120,
          "El título no puede superar los 120 caracteres.",
        ),

    slug:
      z
        .string()
        .trim()
        .min(
          3,
          "La dirección debe tener al menos 3 caracteres.",
        )
        .max(
          140,
          "La dirección no puede superar los 140 caracteres.",
        )
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "La dirección solo puede contener letras minúsculas, números y guiones.",
        ),

    shortDescription:
      z
        .string()
        .trim()
        .min(
          1,
          "La descripción corta es obligatoria.",
        )
        .max(
          180,
          "La descripción corta no puede superar los 180 caracteres.",
        ),

    introduction:
      z
        .string()
        .trim()
        .max(
          1500,
          "La introducción no puede superar los 1500 caracteres.",
        ),
  });


export type RecipeBasicInfoFormData =
  z.infer<
    typeof recipeBasicInfoSchema
  >;


/*
 * Tipo normalizado que utilizaremos
 * para guardar en PostgreSQL.
 */
export type RecipeBasicInfoData = {
  title:
    string;

  slug:
    string;

  shortDescription:
    string;

  introduction:
    string | null;
};


/*
 * Convierte los strings vacíos opcionales
 * en NULL antes de persistirlos.
 */
export function normalizeRecipeBasicInfo(
  data:
    RecipeBasicInfoFormData,
): RecipeBasicInfoData {
  return {
    title:
      data.title,

    slug:
      data.slug,

    shortDescription:
      data.shortDescription,

    introduction:
      data.introduction ===
      ""
        ? null
        : data.introduction,
  };
}