import { z } from "zod";


const durationMinutesSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      /^\d+$/.test(value),
    {
      message:
        "La duración debe ser un número entero de minutos.",
    },
  );


export const recipeStepSchema =
  z.object({
    title: z
      .string()
      .trim()
      .max(
        120,
        "El título no puede superar los 120 caracteres.",
      ),

    instructions: z
      .string()
      .trim()
      .min(
        10,
        "Las instrucciones deben tener al menos 10 caracteres.",
      )
      .max(
        2500,
        "Las instrucciones no pueden superar los 2500 caracteres.",
      ),

    durationMinutes:
      durationMinutesSchema,

    tip: z
      .string()
      .trim()
      .max(
        800,
        "El consejo no puede superar los 800 caracteres.",
      ),
  });


export const recipeStepsSchema =
  z.object({
    steps:
      z.array(
        recipeStepSchema,
      ),
  });


export type RecipeStepFormData =
  z.infer<
    typeof recipeStepSchema
  >;


export type RecipeStepsFormData =
  z.infer<
    typeof recipeStepsSchema
  >;


export type RecipeStepsData = {
  steps: Array<{
    title:
      string | null;

    instructions:
      string;

    durationMinutes:
      number | null;

    tip:
      string | null;

    position:
      number;
  }>;
};


export function normalizeRecipeSteps(
  data: RecipeStepsFormData,
): RecipeStepsData {
  return {
    steps:
      data.steps.map(
        (
          step,
          index,
        ) => ({
          title:
            step.title === ""
              ? null
              : step.title,

          instructions:
            step.instructions,

          durationMinutes:
            step.durationMinutes ===
            ""
              ? null
              : Number(
                  step.durationMinutes,
                ),

          tip:
            step.tip === ""
              ? null
              : step.tip,

          position:
            index,
        }),
      ),
  };
}