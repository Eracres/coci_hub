import { z } from "zod";


export const recipeSourceTypes = [
  "",
  "own",
  "family",
  "book",
  "magazine",
  "web",
  "handwritten",
  "other",
] as const;


export const recipeSourceTypeSchema =
  z.enum(
    recipeSourceTypes,
  );


function optionalText(
  maxLength: number,
  message: string,
) {
  return z
    .string()
    .trim()
    .max(
      maxLength,
      message,
    );
}


function isValidWebUrl(
  value: string,
) {
  if (value === "") {
    return true;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol ===
        "http:" ||
      url.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
}


export const recipeAdditionalInfoSchema =
  z.object({
    tips:
      optionalText(
        2500,
        "Los consejos no pueden superar los 2500 caracteres.",
      ),

    substitutions:
      optionalText(
        2500,
        "Las sustituciones no pueden superar los 2500 caracteres.",
      ),

    storage:
      optionalText(
        2500,
        "La información de conservación no puede superar los 2500 caracteres.",
      ),

    freezing:
      optionalText(
        2500,
        "La información de congelación no puede superar los 2500 caracteres.",
      ),

    reheating:
      optionalText(
        2500,
        "La información de recalentado no puede superar los 2500 caracteres.",
      ),

    sourceType:
      recipeSourceTypeSchema,

    sourceTitle:
      optionalText(
        180,
        "El título de la fuente no puede superar los 180 caracteres.",
      ),

    sourceAuthor:
      optionalText(
        120,
        "El autor no puede superar los 120 caracteres.",
      ),

    sourcePage:
      optionalText(
        30,
        "La página no puede superar los 30 caracteres.",
      ),

    sourceUrl: z
      .string()
      .trim()
      .max(
        2000,
        "La URL es demasiado larga.",
      )
      .refine(
        isValidWebUrl,
        {
          message:
            "Introduce una URL válida que empiece por http:// o https://.",
        },
      ),

    sourceNotes:
      optionalText(
        1500,
        "Las notas de la fuente no pueden superar los 1500 caracteres.",
      ),
  });


export type RecipeAdditionalInfoFormData =
  z.infer<
    typeof recipeAdditionalInfoSchema
  >;


export type RecipeSourceType =
  Exclude<
    RecipeAdditionalInfoFormData["sourceType"],
    ""
  >;


export type RecipeAdditionalInfoData = {
  tips:
    string | null;

  substitutions:
    string | null;

  storage:
    string | null;

  freezing:
    string | null;

  reheating:
    string | null;

  sourceType:
    RecipeSourceType | null;

  sourceTitle:
    string | null;

  sourceAuthor:
    string | null;

  sourcePage:
    string | null;

  sourceUrl:
    string | null;

  sourceNotes:
    string | null;
};


function emptyToNull(
  value: string,
) {
  return value === ""
    ? null
    : value;
}


export function normalizeRecipeAdditionalInfo(
  data:
    RecipeAdditionalInfoFormData,
): RecipeAdditionalInfoData {
  return {
    tips:
      emptyToNull(
        data.tips,
      ),

    substitutions:
      emptyToNull(
        data.substitutions,
      ),

    storage:
      emptyToNull(
        data.storage,
      ),

    freezing:
      emptyToNull(
        data.freezing,
      ),

    reheating:
      emptyToNull(
        data.reheating,
      ),

    sourceType:
      data.sourceType === ""
        ? null
        : data.sourceType,

    sourceTitle:
      emptyToNull(
        data.sourceTitle,
      ),

    sourceAuthor:
      emptyToNull(
        data.sourceAuthor,
      ),

    sourcePage:
      emptyToNull(
        data.sourcePage,
      ),

    sourceUrl:
      emptyToNull(
        data.sourceUrl,
      ),

    sourceNotes:
      emptyToNull(
        data.sourceNotes,
      ),
  };
}