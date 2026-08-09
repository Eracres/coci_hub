import { z } from "zod";

import {
  ingredientGroupSchema,
} from "@/schemas/ingredient-schema";

import {
  recipeStepSchema,
} from "@/schemas/recipe-step-schema";


export const recipeStatusSchema = z.enum([
  "draft",
  "published",
  "archived",
]);

export const recipeDifficultySchema = z.enum([
  "easy",
  "medium",
  "hard",
]);

export const allergenPresenceSchema = z.enum([
  "present",
  "possible",
]);

export const recipeSourceTypeSchema = z.enum([
  "own",
  "family",
  "book",
  "magazine",
  "web",
  "handwritten",
  "other",
]);


/* =========================================================
   SOURCE
========================================================= */

export const recipeSourceSchema = z.object({
  type: recipeSourceTypeSchema.nullable(),

  title: z
    .string()
    .trim()
    .max(
      180,
      "La referencia no puede superar los 180 caracteres.",
    )
    .nullable(),

  author: z
    .string()
    .trim()
    .max(
      120,
      "El autor no puede superar los 120 caracteres.",
    )
    .nullable(),

  page: z
    .string()
    .trim()
    .max(
      30,
      "La página o referencia es demasiado larga.",
    )
    .nullable(),

  url: z
    .string()
    .url(
      "Introduce una URL válida.",
    )
    .nullable(),

  notes: z
    .string()
    .trim()
    .max(
      1000,
      "Las notas no pueden superar los 1000 caracteres.",
    )
    .nullable(),
});


/* =========================================================
   ALLERGEN
========================================================= */

export const recipeAllergenSchema = z.object({
  allergenId: z
    .string()
    .min(
      1,
      "El alérgeno necesita un identificador.",
    ),

  presence: allergenPresenceSchema,
});


/* =========================================================
   DRAFT / BASE RECIPE
========================================================= */

export const recipeSchema = z.object({
  id: z
    .string()
    .optional(),

  title: z
    .string()
    .trim()
    .min(
      1,
      "La receta necesita un título.",
    )
    .max(
      120,
      "El título no puede superar los 120 caracteres.",
    ),

  slug: z
    .string()
    .trim()
    .min(
      1,
      "La receta necesita un slug.",
    )
    .max(
      140,
      "El slug no puede superar los 140 caracteres.",
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El slug solo puede contener letras minúsculas, números y guiones.",
    ),

  shortDescription: z
    .string()
    .trim()
    .max(
      180,
      "La descripción no puede superar los 180 caracteres.",
    )
    .nullable(),

  introduction: z
    .string()
    .trim()
    .max(
      1500,
      "La introducción no puede superar los 1500 caracteres.",
    )
    .nullable(),

  imageUrl: z
    .string()
    .url(
      "La imagen debe tener una URL válida.",
    )
    .nullable(),

  imageAlt: z
    .string()
    .trim()
    .max(
      180,
      "El texto alternativo no puede superar los 180 caracteres.",
    )
    .nullable(),

  status: recipeStatusSchema,

  difficulty:
    recipeDifficultySchema.nullable(),

  baseServings: z
    .number()
    .int(
      "Las raciones deben ser un número entero.",
    )
    .min(
      1,
      "La receta debe tener al menos una ración.",
    )
    .max(
      100,
      "El número máximo de raciones base es 100.",
    )
    .nullable(),

  preparationMinutes: z
    .number()
    .int(
      "El tiempo debe indicarse en minutos completos.",
    )
    .nonnegative(
      "El tiempo no puede ser negativo.",
    )
    .nullable(),

  cookingMinutes: z
    .number()
    .int(
      "El tiempo debe indicarse en minutos completos.",
    )
    .nonnegative(
      "El tiempo no puede ser negativo.",
    )
    .nullable(),

  additionalMinutes: z
    .number()
    .int(
      "El tiempo debe indicarse en minutos completos.",
    )
    .nonnegative(
      "El tiempo no puede ser negativo.",
    )
    .nullable(),

  recipeTypeId: z
    .string()
    .nullable(),

  categoryIds: z
    .array(
      z.string().min(1),
    ),

  tagIds: z
    .array(
      z.string().min(1),
    )
    .max(
      10,
      "No puedes seleccionar más de 10 etiquetas.",
    ),

  featured:
    z.boolean(),

  ingredientGroups:
    z.array(
      ingredientGroupSchema,
    ),

  steps:
    z.array(
      recipeStepSchema,
    ),

  tips: z
    .string()
    .trim()
    .max(1200)
    .nullable(),

  substitutions: z
    .string()
    .trim()
    .max(1200)
    .nullable(),

  storage: z
    .string()
    .trim()
    .max(1000)
    .nullable(),

  freezing: z
    .string()
    .trim()
    .max(1000)
    .nullable(),

  reheating: z
    .string()
    .trim()
    .max(1000)
    .nullable(),

  source:
    recipeSourceSchema,

  allergens:
    z.array(
      recipeAllergenSchema,
    ),
});


/* =========================================================
   PUBLISHED RECIPE
========================================================= */

export const publishedRecipeSchema =
  recipeSchema.superRefine(
    (recipe, context) => {

      if (
        !recipe.shortDescription ||
        recipe.shortDescription.length < 10
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "shortDescription",
          ],
          message:
            "Añade una descripción de al menos 10 caracteres antes de publicar.",
        });
      }


      if (!recipe.imageUrl) {
        context.addIssue({
          code: "custom",
          path: [
            "imageUrl",
          ],
          message:
            "Añade una imagen principal antes de publicar.",
        });
      }


      if (!recipe.recipeTypeId) {
        context.addIssue({
          code: "custom",
          path: [
            "recipeTypeId",
          ],
          message:
            "Selecciona un tipo de receta antes de publicar.",
        });
      }


      if (!recipe.difficulty) {
        context.addIssue({
          code: "custom",
          path: [
            "difficulty",
          ],
          message:
            "Selecciona una dificultad antes de publicar.",
        });
      }


      if (
        recipe.baseServings === null
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "baseServings",
          ],
          message:
            "Indica las raciones base antes de publicar.",
        });
      }


      if (
        recipe.preparationMinutes === null
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "preparationMinutes",
          ],
          message:
            "Indica el tiempo de preparación antes de publicar.",
        });
      }


      if (
        recipe.categoryIds.length === 0
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "categoryIds",
          ],
          message:
            "Selecciona al menos una categoría antes de publicar.",
        });
      }


      const totalIngredients =
        recipe.ingredientGroups.reduce(
          (
            total,
            group,
          ) =>
            total +
            group.ingredients.length,
          0,
        );

      if (
        totalIngredients === 0
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "ingredientGroups",
          ],
          message:
            "Añade al menos un ingrediente antes de publicar.",
        });
      }


      if (
        recipe.steps.length === 0
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "steps",
          ],
          message:
            "Añade al menos un paso de elaboración antes de publicar.",
        });
      }


      const duplicatedAllergens =
        recipe.allergens.filter(
          (
            allergen,
            index,
            allergens,
          ) =>
            allergens.findIndex(
              (candidate) =>
                candidate.allergenId ===
                allergen.allergenId,
            ) !== index,
        );

      if (
        duplicatedAllergens.length >
        0
      ) {
        context.addIssue({
          code: "custom",
          path: [
            "allergens",
          ],
          message:
            "Un mismo alérgeno no puede aparecer más de una vez.",
        });
      }
    },
  );


export type RecipeFormData =
  z.infer<typeof recipeSchema>;

export type PublishedRecipeData =
  z.infer<
    typeof publishedRecipeSchema
  >;