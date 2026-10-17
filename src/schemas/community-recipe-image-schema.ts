import {
  z,
} from "zod";


export const communityRecipeImageSchema =
  z.object({
    imageAlt:
      z
        .string()
        .trim()
        .min(
          3,
          "Describe brevemente qué aparece en la imagen.",
        )
        .max(
          180,
          "El texto alternativo no puede superar los 180 caracteres.",
        ),
  });


export type CommunityRecipeImageFormData =
  z.infer<
    typeof communityRecipeImageSchema
  >;
