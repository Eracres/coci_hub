import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";


export type AiRecipeImportSuccessResponse = {
  success:
    true;

  recipe:
    AiRecipeImport;
};


export type AiRecipeImportErrorResponse = {
  success:
    false;

  error:
    string;
};


export type AiRecipeImportApiResponse =
  | AiRecipeImportSuccessResponse
  | AiRecipeImportErrorResponse;