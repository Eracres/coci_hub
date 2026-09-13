import {
  createClient,
} from "@/lib/supabase/server";

import {
  getAdminRecipeById,
  getAllergenOptions,
  getRecipeAllergens,
  getRecipeClassificationOptions,
  getRecipeClassificationRelations,
  getRecipeIngredients,
  getRecipeSteps,
} from "@/services/recipes/recipe-service";


export async function getRecipePreview(
  recipeId: string,
) {
  const [
    recipe,
    classificationOptions,
    classificationRelations,
    ingredientGroups,
    steps,
    allergenOptions,
    recipeAllergens,
  ] =
    await Promise.all([
      getAdminRecipeById(
        recipeId,
      ),

      getRecipeClassificationOptions(),

      getRecipeClassificationRelations(
        recipeId,
      ),

      getRecipeIngredients(
        recipeId,
      ),

      getRecipeSteps(
        recipeId,
      ),

      getAllergenOptions(),

      getRecipeAllergens(
        recipeId,
      ),
    ]);


  if (!recipe) {
    return null;
  }


  /* =====================================================
     IMAGE
  ===================================================== */

  let imageUrl:
    string | null = null;


  if (
    recipe.image_path
  ) {
    const supabase =
      await createClient();


    const {
      data,
    } =
      supabase.storage
        .from(
          "recipe-images",
        )
        .getPublicUrl(
          recipe.image_path,
        );


    imageUrl =
      data.publicUrl;
  }


  /* =====================================================
     CLASSIFICATION
  ===================================================== */

  const recipeType =
    classificationOptions
      .recipeTypes
      .find(
        (type) =>
          type.id ===
          recipe.recipe_type_id,
      ) ??
    null;


  const categories =
    classificationOptions
      .categories
      .filter(
        (category) =>
          classificationRelations
            .categoryIds
            .includes(
              category.id,
            ),
      );


  const tags =
    classificationOptions
      .tags
      .filter(
        (tag) =>
          classificationRelations
            .tagIds
            .includes(
              tag.id,
            ),
      );


  /* =====================================================
     ALLERGENS
  ===================================================== */

  const allergens =
    recipeAllergens
      .map(
        (
          recipeAllergen,
        ) => {
          const allergen =
            allergenOptions.find(
              (option) =>
                option.id ===
                recipeAllergen
                  .allergenId,
            );


          if (!allergen) {
            return null;
          }


          return {
            id:
              allergen.id,

            name:
              allergen.name,

            slug:
              allergen.slug,

            presence:
              recipeAllergen
                .presence,
          };
        },
      )
      .filter(
        (
          allergen,
        ): allergen is NonNullable<
          typeof allergen
        > =>
          allergen !==
          null,
      );


  return {
    recipe,

    imageUrl,

    recipeType,

    categories,

    tags,

    ingredientGroups,

    steps,

    allergens,
  };
}