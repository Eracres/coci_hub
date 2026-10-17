import {
  z,
} from "zod";


const DIFFICULTIES = [
  "easy",
  "medium",
  "hard",
] as const;


export type CommunityRecipeDifficulty =
  (
    typeof DIFFICULTIES
  )[number];


export const communityRecipeClassificationSchema =
  z.object({
    recipeTypeId:
      z
        .string()
        .trim()
        .min(
          1,
          "Selecciona un tipo de receta.",
        ),

    difficulty:
      z
        .string()
        .trim()
        .refine(
          (
            value,
          ) =>
            DIFFICULTIES.includes(
              value as
                CommunityRecipeDifficulty,
            ),
          {
            message:
              "Selecciona una dificultad.",
          },
        ),

    categoryIds:
      z
        .array(
          z.string().uuid(),
        )
        .min(
          1,
          "Selecciona al menos una categoría.",
        ),

    tagIds:
      z
        .array(
          z.string().uuid(),
        )
        .max(
          10,
          "Puedes seleccionar como máximo 10 etiquetas.",
        ),
  });


export type CommunityRecipeClassificationFormData =
  z.infer<
    typeof communityRecipeClassificationSchema
  >;


export type CommunityRecipeClassificationData = {
  recipeTypeId:
    string;

  difficulty:
    CommunityRecipeDifficulty;

  categoryIds:
    string[];

  tagIds:
    string[];
};


export function normalizeCommunityRecipeClassification(
  data:
    CommunityRecipeClassificationFormData,
): CommunityRecipeClassificationData {
  return {
    recipeTypeId:
      data.recipeTypeId,

    difficulty:
      data.difficulty as
        CommunityRecipeDifficulty,

    categoryIds:
      [
        ...new Set(
          data.categoryIds,
        ),
      ],

    tagIds:
      [
        ...new Set(
          data.tagIds,
        ),
      ],
  };
}