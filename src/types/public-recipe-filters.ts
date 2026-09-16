import type {
  PublicRecipeDifficulty,
  PublicRecipeListItem,
} from "@/types/public-recipe";


export type PublicRecipeOrder =
  | "featured"
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc"
  | "time-asc"
  | "time-desc";


export type PublicRecipeFilters = {
  search: string;

  category: string;

  recipeType: string;

  difficulty:
    PublicRecipeDifficulty | "";

  tag: string;

  order:
    PublicRecipeOrder;
};


export type PublicRecipeFilterOption = {
  id: string;

  name: string;

  slug: string;
};


export type PublicRecipeFilterOptions = {
  categories:
    PublicRecipeFilterOption[];

  recipeTypes:
    PublicRecipeFilterOption[];

  tags:
    PublicRecipeFilterOption[];
};


export type PublicRecipeSearchResult = {
  recipes:
    PublicRecipeListItem[];

  total:
    number;
};