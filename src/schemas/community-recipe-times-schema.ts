import {
  z,
} from "zod";


const minuteFieldSchema =
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
    )
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
            0 &&
          minutes <=
            10080
        );
      },
      {
        message:
          "El tiempo debe estar entre 0 y 10080 minutos.",
      },
    );


export const communityRecipeTimesSchema =
  z.object({
    preparationMinutes:
      minuteFieldSchema,

    additionalMinutes:
      minuteFieldSchema,
  });


export type CommunityRecipeTimesFormData =
  z.infer<
    typeof communityRecipeTimesSchema
  >;


export type CommunityRecipeTimesData = {
  preparationMinutes:
    number;

  additionalMinutes:
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

    additionalMinutes:
      Number(
        data.additionalMinutes,
      ),
  };
}
