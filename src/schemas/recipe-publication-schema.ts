import {
  z,
} from "zod";


export const recipeStatusSchema =
  z.enum([
    "draft",
    "published",
    "archived",
  ]);


export type RecipeStatus =
  z.infer<
    typeof recipeStatusSchema
  >;