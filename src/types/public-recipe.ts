export type PublicRecipeDifficulty =
  | "easy"
  | "medium"
  | "hard";


export type PublicRecipeAllergenPresence =
  | "present"
  | "possible";


export type PublicRecipeSourceType =
  | "own"
  | "family"
  | "book"
  | "magazine"
  | "web"
  | "handwritten"
  | "other";


export type PublicRecipeListItem = {
  id: string;

  title: string;

  slug: string;

  shortDescription:
    string | null;

  imagePath:
    string | null;

  imageUrl:
    string | null;

  difficulty:
    PublicRecipeDifficulty | null;

  baseServings:
    number | null;

  preparationMinutes:
    number | null;

  cookingMinutes:
    number | null;

  additionalMinutes:
    number | null;

  totalMinutes:
    number;

  featured:
    boolean;

  publishedAt:
    string | null;
};


export type PublicRecipeType = {
  id: string;

  name: string;

  slug: string;
};


export type PublicRecipeCategory = {
  id: string;

  name: string;

  slug: string;
};


export type PublicRecipeTag = {
  id: string;

  name: string;

  slug: string;
};


export type PublicRecipeIngredient = {
  id: string;

  quantity:
    number | null;

  unit:
    string | null;

  name:
    string;

  notes:
    string | null;

  scalable:
    boolean;

  position:
    number;
};


export type PublicRecipeIngredientGroup = {
  id: string;

  name:
    string | null;

  position:
    number;

  ingredients:
    PublicRecipeIngredient[];
};


export type PublicRecipeStep = {
  id: string;

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
};


export type PublicRecipeAllergen = {
  id: string;

  name: string;

  slug: string;

  presence:
    PublicRecipeAllergenPresence;
};


export type PublicRecipeDetail =
  PublicRecipeListItem & {
    introduction:
      string | null;

    imageAlt:
      string | null;

    recipeType:
      PublicRecipeType | null;

    categories:
      PublicRecipeCategory[];

    tags:
      PublicRecipeTag[];

    ingredientGroups:
      PublicRecipeIngredientGroup[];

    steps:
      PublicRecipeStep[];

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
      PublicRecipeSourceType | null;

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

    allergens:
      PublicRecipeAllergen[];
  };