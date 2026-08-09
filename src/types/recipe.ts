export type RecipeStatus =
  | "draft"
  | "published"
  | "archived";

export type RecipeDifficulty =
  | "easy"
  | "medium"
  | "hard";

export type AllergenPresence =
  | "present"
  | "possible";

export type RecipeSourceType =
  | "own"
  | "family"
  | "book"
  | "magazine"
  | "web"
  | "handwritten"
  | "other";

export type RecipeIngredient = {
  id?: string;

  name: string;

  quantity: number | null;

  unit: string | null;

  notes: string | null;

  scalable: boolean;

  position: number;
};

export type RecipeIngredientGroup = {
  id?: string;

  name: string;

  position: number;

  ingredients: RecipeIngredient[];
};

export type RecipeStep = {
  id?: string;

  title: string | null;

  instructions: string;

  durationMinutes: number | null;

  tip: string | null;

  imageUrl: string | null;

  position: number;
};

export type RecipeAllergen = {
  allergenId: string;

  presence: AllergenPresence;
};

export type RecipeSource = {
  type: RecipeSourceType | null;

  title: string | null;

  author: string | null;

  page: string | null;

  url: string | null;

  notes: string | null;
};

export type Recipe = {
  id?: string;

  title: string;

  slug: string;

  shortDescription: string | null;

  introduction: string | null;

  imageUrl: string | null;

  imageAlt: string | null;

  status: RecipeStatus;

  difficulty: RecipeDifficulty | null;

  baseServings: number | null;

  preparationMinutes: number | null;

  cookingMinutes: number | null;

  additionalMinutes: number | null;

  recipeTypeId: string | null;

  categoryIds: string[];

  tagIds: string[];

  featured: boolean;

  ingredientGroups: RecipeIngredientGroup[];

  steps: RecipeStep[];

  tips: string | null;

  substitutions: string | null;

  storage: string | null;

  freezing: string | null;

  reheating: string | null;

  source: RecipeSource;

  allergens: RecipeAllergen[];
};