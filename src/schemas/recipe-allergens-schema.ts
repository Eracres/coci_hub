import { z } from "zod";


export const allergenPresenceSchema =
  z.enum([
    "present",
    "possible",
  ]);


export type AllergenPresence =
  z.infer<
    typeof allergenPresenceSchema
  >;


export const recipeAllergenSchema =
  z.object({
    allergenId: z
      .string()
      .uuid(
        "El identificador del alérgeno no es válido.",
      ),

    presence:
      allergenPresenceSchema,
  });


export const recipeAllergensSchema =
  z
    .object({
      allergens:
        z.array(
          recipeAllergenSchema,
        ),
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        const seen =
          new Set<string>();

        data.allergens.forEach(
          (
            allergen,
            index,
          ) => {
            if (
              seen.has(
                allergen.allergenId,
              )
            ) {
              context.addIssue({
                code:
                  "custom",

                message:
                  "Un mismo alérgeno no puede aparecer más de una vez.",

                path: [
                  "allergens",
                  index,
                  "allergenId",
                ],
              });
            }

            seen.add(
              allergen.allergenId,
            );
          },
        );
      },
    );


export type RecipeAllergenFormData =
  z.infer<
    typeof recipeAllergenSchema
  >;


export type RecipeAllergensFormData =
  z.infer<
    typeof recipeAllergensSchema
  >;


export type RecipeAllergensData = {
  allergens: Array<{
    allergenId:
      string;

    presence:
      AllergenPresence;
  }>;
};


export function normalizeRecipeAllergens(
  data: RecipeAllergensFormData,
): RecipeAllergensData {
  return {
    allergens:
      data.allergens.map(
        (allergen) => ({
          allergenId:
            allergen.allergenId,

          presence:
            allergen.presence,
        }),
      ),
  };
}