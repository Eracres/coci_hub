import {
  z,
} from "zod";


const integerMinutesSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "Indica el tiempo en minutos.",
    )
    .refine(
      (
        value,
      ) =>
        /^\d+$/.test(
          value,
        ),
      {
        message:
          "El tiempo debe ser un número entero.",
      },
    );


const preparationMinutesSchema =
  integerMinutesSchema
    .refine(
      (
        value,
      ) => {
        const minutes =
          Number(
            value,
          );


        return (
          minutes >=
            1 &&
          minutes <=
            10080
        );
      },
      {
        message:
          "El tiempo de preparación debe estar entre 1 y 10080 minutos.",
      },
    );


export const communityRecipeTimesSchema =
  z.object({
    preparationMinutes:
      preparationMinutesSchema,
  });


export type CommunityRecipeTimesFormData =
  z.infer<
    typeof communityRecipeTimesSchema
  >;


export type CommunityRecipeTimesData = {
  preparationMinutes:
    number;
};


export function normalizeCommunityRecipeTimes(
  data:
    CommunityRecipeTimesFormData,
): CommunityRecipeTimesData {
  return {
    preparationMinutes:
      Number(
        data.preparationMinutes,
      ),
  };
}
