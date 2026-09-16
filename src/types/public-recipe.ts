export type PublicRecipeDifficulty =
  | "easy"
  | "medium"
  | "hard";


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