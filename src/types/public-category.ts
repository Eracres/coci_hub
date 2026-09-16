import type {
  PublicRecipeListItem,
} from "@/types/public-recipe";


export type PublicCategorySummary = {
  id: string;

  name: string;

  slug: string;

  recipeCount: number;
};


export type PublicCategoryDetail = {
  category:
    PublicCategorySummary;

  recipes:
    PublicRecipeListItem[];

  total:
    number;
};