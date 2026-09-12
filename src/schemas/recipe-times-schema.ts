import { z } from "zod";


const optionalMinutesSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      /^\d+$/.test(value),
    {
      message:
        "El tiempo debe ser un número entero de minutos.",
    },
  );


export const recipeTimesSchema = z.object({
  preparationMinutes:
    optionalMinutesSchema,

  cookingMinutes:
    optionalMinutesSchema,

  additionalMinutes:
    optionalMinutesSchema,
});


export type RecipeTimesFormData =
  z.infer<
    typeof recipeTimesSchema
  >;


export type RecipeTimesData = {
  preparationMinutes:
    number | null;

  cookingMinutes:
    number | null;

  additionalMinutes:
    number | null;
};


export function normalizeRecipeTimes(
  data: RecipeTimesFormData,
): RecipeTimesData {
  return {
    preparationMinutes:
      data.preparationMinutes === ""
        ? null
        : Number(
            data.preparationMinutes,
          ),

    cookingMinutes:
      data.cookingMinutes === ""
        ? null
        : Number(
            data.cookingMinutes,
          ),

    additionalMinutes:
      data.additionalMinutes === ""
        ? null
        : Number(
            data.additionalMinutes,
          ),
  };
}