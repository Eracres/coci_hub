import { z } from "zod";


const quantitySchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      /^\d+(?:[.,]\d{1,3})?$/.test(
        value,
      ),
    {
      message:
        "La cantidad debe ser un número con un máximo de 3 decimales.",
    },
  )
  .refine(
    (value) => {
      if (value === "") {
        return true;
      }

      const quantity =
        Number(
          value.replace(
            ",",
            ".",
          ),
        );

      return (
        Number.isFinite(
          quantity,
        ) &&
        quantity >= 0 &&
        quantity <
          10_000_000
      );
    },
    {
      message:
        "La cantidad indicada no es válida.",
    },
  );


export const recipeIngredientSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        "El nombre del ingrediente es obligatorio.",
      )
      .max(
        120,
        "El nombre no puede superar los 120 caracteres.",
      ),

    quantity:
      quantitySchema,

    unit: z
      .string()
      .trim()
      .max(
        40,
        "La unidad no puede superar los 40 caracteres.",
      ),

    notes: z
      .string()
      .trim()
      .max(
        250,
        "Las notas no pueden superar los 250 caracteres.",
      ),

    scalable:
      z.boolean(),
  });


export const recipeIngredientGroupSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        1,
        "El nombre del grupo es obligatorio.",
      )
      .max(
        100,
        "El nombre del grupo no puede superar los 100 caracteres.",
      ),

    ingredients:
      z.array(
        recipeIngredientSchema,
      ),
  });


export const recipeIngredientsSchema =
  z.object({
    groups:
      z.array(
        recipeIngredientGroupSchema,
      ),
  });


export type RecipeIngredientFormData =
  z.infer<
    typeof recipeIngredientSchema
  >;


export type RecipeIngredientsFormData =
  z.infer<
    typeof recipeIngredientsSchema
  >;


export type RecipeIngredientsData = {
  groups: Array<{
    name: string;
    position: number;

    ingredients: Array<{
      name: string;

      quantity:
        number | null;

      unit:
        string | null;

      notes:
        string | null;

      scalable:
        boolean;

      position:
        number;
    }>;
  }>;
};


export function normalizeRecipeIngredients(
  data: RecipeIngredientsFormData,
): RecipeIngredientsData {
  return {
    groups:
      data.groups.map(
        (
          group,
          groupIndex,
        ) => ({
          name:
            group.name.trim(),

          position:
            groupIndex,

          ingredients:
            group.ingredients.map(
              (
                ingredient,
                ingredientIndex,
              ) => ({
                name:
                  ingredient.name.trim(),

                quantity:
                  ingredient.quantity ===
                  ""
                    ? null
                    : Number(
                        ingredient.quantity.replace(
                          ",",
                          ".",
                        ),
                      ),

                unit:
                  ingredient.unit ===
                  ""
                    ? null
                    : ingredient.unit,

                notes:
                  ingredient.notes ===
                  ""
                    ? null
                    : ingredient.notes,

                scalable:
                  ingredient.scalable,

                position:
                  ingredientIndex,
              }),
            ),
        }),
      ),
  };
}