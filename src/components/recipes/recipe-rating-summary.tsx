import {
  RecipeRatingControl,
} from "@/components/recipes/recipe-rating-control";

import {
  getRecipeRatingSummary,
} from "@/services/recipes/recipe-rating-service";


type RecipeRatingSummaryProps = {
  recipeId:
    string;
};


export async function RecipeRatingSummary({
  recipeId,
}: RecipeRatingSummaryProps) {
  const summary =
    await getRecipeRatingSummary(
      recipeId,
    );


  return (
    <RecipeRatingControl
      recipeId={
        recipeId
      }
      ratingCount={
        summary.ratingCount
      }
      averageRating={
        summary.averageRating
      }
      currentUserRating={
        summary.currentUserRating
      }
      isAuthenticated={
        summary.isAuthenticated
      }
    />
  );
}