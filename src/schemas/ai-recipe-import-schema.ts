import {
  z,
} from "zod";


export const aiRecipeDifficultySchema =
  z.enum(
    [
      "easy",
      "medium",
      "hard",
    ],
  );


export const aiRecipeAllergenPresenceSchema =
  z.enum(
    [
      "present",
      "possible",
    ],
  );


export const aiRecipeSourceTypeSchema =
  z.enum(
    [
      "own",
      "family",
      "book",
      "magazine",
      "web",
      "handwritten",
      "other",
    ],
  );


export const aiRecipeConfidenceSchema =
  z.enum(
    [
      "high",
      "medium",
      "low",
    ],
  );


export const aiRecipeIngredientSchema =
  z
    .object(
      {
        quantity:
          z
            .number()
            .nonnegative()
            .nullable(),

        unit:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        name:
          z
            .string()
            .trim()
            .min(
              1,
            ),

        notes:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        scalable:
          z.boolean(),
      },
    )
    .strict();


export const aiRecipeIngredientGroupSchema =
  z
    .object(
      {
        name:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        ingredients:
          z.array(
            aiRecipeIngredientSchema,
          ),
      },
    )
    .strict();


export const aiRecipeStepSchema =
  z
    .object(
      {
        title:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        instructions:
          z
            .string()
            .trim()
            .min(
              1,
            ),

        durationMinutes:
          z
            .number()
            .int()
            .nonnegative()
            .nullable(),

        tip:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),
      },
    )
    .strict();


export const aiRecipeAllergenSchema =
  z
    .object(
      {
        name:
          z
            .string()
            .trim()
            .min(
              1,
            ),

        presence:
          aiRecipeAllergenPresenceSchema,

        explicitlyMentioned:
          z.boolean(),
      },
    )
    .strict();


export const aiRecipeSourceSchema =
  z
    .object(
      {
        type:
          aiRecipeSourceTypeSchema.nullable(),

        title:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        author:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        page:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        url:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        notes:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),
      },
    )
    .strict();


export const aiRecipeClassificationSchema =
  z
    .object(
      {
        recipeType:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        categories:
          z.array(
            z
              .string()
              .trim()
              .min(
                1,
              ),
          ),

        tags:
          z.array(
            z
              .string()
              .trim()
              .min(
                1,
              ),
          ),
      },
    )
    .strict();


export const aiRecipeImportSchema =
  z
    .object(
      {
        version:
          z.literal(
            1,
          ),

        title:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        shortDescription:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        introduction:
          z
            .string()
            .trim()
            .min(
              1,
            )
            .nullable(),

        baseServings:
          z
            .number()
            .int()
            .positive()
            .nullable(),

        difficulty:
          aiRecipeDifficultySchema.nullable(),

        preparationMinutes:
          z
            .number()
            .int()
            .nonnegative()
            .nullable(),

        cookingMinutes:
          z
            .number()
            .int()
            .nonnegative()
            .nullable(),

        additionalMinutes:
          z
            .number()
            .int()
            .nonnegative()
            .nullable(),

        ingredientGroups:
          z.array(
            aiRecipeIngredientGroupSchema,
          ),

        steps:
          z.array(
            aiRecipeStepSchema,
          ),

        allergens:
          z.array(
            aiRecipeAllergenSchema,
          ),

        classification:
          aiRecipeClassificationSchema,

        source:
          aiRecipeSourceSchema,

        rawText:
          z
            .string()
            .trim()
            .nullable(),

        confidence:
          aiRecipeConfidenceSchema,

        uncertainFields:
          z.array(
            z
              .string()
              .trim()
              .min(
                1,
              ),
          ),

        warnings:
          z.array(
            z
              .string()
              .trim()
              .min(
                1,
              ),
          ),
      },
    )
    .strict();


export type AiRecipeImport =
  z.infer<
    typeof aiRecipeImportSchema
  >;


export type AiRecipeIngredient =
  z.infer<
    typeof aiRecipeIngredientSchema
  >;


export type AiRecipeIngredientGroup =
  z.infer<
    typeof aiRecipeIngredientGroupSchema
  >;


export type AiRecipeStep =
  z.infer<
    typeof aiRecipeStepSchema
  >;


export type AiRecipeAllergen =
  z.infer<
    typeof aiRecipeAllergenSchema
  >;


export type AiRecipeClassification =
  z.infer<
    typeof aiRecipeClassificationSchema
  >;


export type AiRecipeSource =
  z.infer<
    typeof aiRecipeSourceSchema
  >;