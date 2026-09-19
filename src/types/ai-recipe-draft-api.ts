export type AiRecipeDraftUnmatchedCatalogs = {
  recipeType:
    string | null;

  categories:
    string[];

  tags:
    string[];

  allergens:
    string[];
};


export type AiRecipeDraftSuccessResponse = {
  success:
    true;

  recipeId:
    string;

  slug:
    string;

  unmatched:
    AiRecipeDraftUnmatchedCatalogs;
};


export type AiRecipeDraftErrorResponse = {
  success:
    false;

  error:
    string;

  validationErrors?:
    string[];
};


export type AiRecipeDraftApiResponse =
  | AiRecipeDraftSuccessResponse
  | AiRecipeDraftErrorResponse;