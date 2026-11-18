import {
  RecipeCommentsPanel,
} from "@/components/recipes/recipe-comments-panel";

import {
  getRecipeComments,
} from "@/services/recipes/recipe-comment-service";


type RecipeCommentsSectionProps = {
  recipeId:
    string;
};


export async function RecipeCommentsSection({
  recipeId,
}: RecipeCommentsSectionProps) {
  const {
    comments,
    isAuthenticated,
  } =
    await getRecipeComments(
      recipeId,
    );


  return (
    <RecipeCommentsPanel
      recipeId={
        recipeId
      }
      comments={
        comments
      }
      isAuthenticated={
        isAuthenticated
      }
    />
  );
}
