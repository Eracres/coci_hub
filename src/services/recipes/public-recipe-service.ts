import {
  cache,
} from "react";

import {
  createClient,
} from "@/lib/supabase/server";

import type {
  PublicRecipeAllergen,
  PublicRecipeAllergenPresence,
  PublicRecipeCategory,
  PublicRecipeDetail,
  PublicRecipeDifficulty,
  PublicRecipeIngredient,
  PublicRecipeIngredientGroup,
  PublicRecipeListItem,
  PublicRecipeSourceType,
  PublicRecipeStep,
  PublicRecipeTag,
  PublicRecipeType,
} from "@/types/public-recipe";


const RECIPE_IMAGES_BUCKET =
  "recipe-images";


type PublishedRecipeRow = {
  id: string;

  title: string;

  slug: string;

  short_description:
    string | null;

  introduction:
    string | null;

  image_path:
    string | null;

  image_alt:
    string | null;

  difficulty:
    PublicRecipeDifficulty | null;

  base_servings:
    number | null;

  preparation_minutes:
    number | null;

  cooking_minutes:
    number | null;

  additional_minutes:
    number | null;

  recipe_type_id:
    string | null;

  featured:
    boolean;

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

  source_type:
    PublicRecipeSourceType | null;

  source_title:
    string | null;

  source_author:
    string | null;

  source_page:
    string | null;

  source_url:
    string | null;

  source_notes:
    string | null;

  published_at:
    string | null;
};


type RecipeTypeRow = {
  id: string;

  name: string;

  slug: string;
};


type CategoryRelationRow = {
  category_id:
    string;

  categories:
    RecipeTypeRow | null;
};


type TagRelationRow = {
  tag_id:
    string;

  tags:
    RecipeTypeRow | null;
};


type IngredientGroupRow = {
  id: string;

  name:
    string | null;

  position:
    number;
};


type IngredientRow = {
  id: string;

  ingredient_group_id:
    string;

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


type RecipeStepRow = {
  id: string;

  title:
    string | null;

  instructions:
    string;

  duration_minutes:
    number | null;

  tip:
    string | null;

  position:
    number;
};


type AllergenRelationRow = {
  presence:
    PublicRecipeAllergenPresence;

  allergens:
    RecipeTypeRow | null;
};


function calculateTotalMinutes(
  recipe: Pick<
    PublishedRecipeRow,
    | "preparation_minutes"
    | "cooking_minutes"
    | "additional_minutes"
  >,
) {
  return (
    (
      recipe.preparation_minutes ??
      0
    ) +
    (
      recipe.cooking_minutes ??
      0
    ) +
    (
      recipe.additional_minutes ??
      0
    )
  );
}


function getPublicRecipeImageUrl(
  imagePath: string | null,
  supabase: Awaited<
    ReturnType<
      typeof createClient
    >
  >,
) {
  if (!imagePath) {
    return null;
  }


  const {
    data,
  } =
    supabase.storage
      .from(
        RECIPE_IMAGES_BUCKET,
      )
      .getPublicUrl(
        imagePath,
      );


  return (
    data.publicUrl ??
    null
  );
}


function mapRecipeListItem(
  recipe: PublishedRecipeRow,
  imageUrl: string | null,
): PublicRecipeListItem {
  return {
    id:
      recipe.id,

    title:
      recipe.title,

    slug:
      recipe.slug,

    shortDescription:
      recipe.short_description,

    imagePath:
      recipe.image_path,

    imageUrl,

    difficulty:
      recipe.difficulty,

    baseServings:
      recipe.base_servings,

    preparationMinutes:
      recipe.preparation_minutes,

    cookingMinutes:
      recipe.cooking_minutes,

    additionalMinutes:
      recipe.additional_minutes,

    totalMinutes:
      calculateTotalMinutes(
        recipe,
      ),

    featured:
      recipe.featured,

    publishedAt:
      recipe.published_at,
  };
}


export async function getPublishedRecipes(): Promise<
  PublicRecipeListItem[]
> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "recipes",
      )
      .select(
        `
          id,
          title,
          slug,
          short_description,
          introduction,
          image_path,
          image_alt,
          difficulty,
          base_servings,
          preparation_minutes,
          cooking_minutes,
          additional_minutes,
          recipe_type_id,
          featured,
          tips,
          substitutions,
          storage,
          freezing,
          reheating,
          source_type,
          source_title,
          source_author,
          source_page,
          source_url,
          source_notes,
          published_at
        `,
      )
      .eq(
        "status",
        "published",
      )
      .order(
        "featured",
        {
          ascending:
            false,
        },
      )
      .order(
        "published_at",
        {
          ascending:
            false,
        },
      );


  if (error) {
    console.error(
      "GET PUBLISHED RECIPES ERROR:",
      error,
    );


    throw new Error(
      "No se pudieron cargar las recetas publicadas.",
    );
  }


  const recipes =
    (
      data ??
      []
    ) as PublishedRecipeRow[];


  return recipes.map(
    (
      recipe,
    ) =>
      mapRecipeListItem(
        recipe,
        getPublicRecipeImageUrl(
          recipe.image_path,
          supabase,
        ),
      ),
  );
}


export const getPublishedRecipeBySlug =
  cache(
    async (
      slug: string,
    ): Promise<
      PublicRecipeDetail | null
    > => {
      const supabase =
        await createClient();


      const {
        data:
          recipeData,

        error:
          recipeError,
      } =
        await supabase
          .from(
            "recipes",
          )
          .select(
            `
              id,
              title,
              slug,
              short_description,
              introduction,
              image_path,
              image_alt,
              difficulty,
              base_servings,
              preparation_minutes,
              cooking_minutes,
              additional_minutes,
              recipe_type_id,
              featured,
              tips,
              substitutions,
              storage,
              freezing,
              reheating,
              source_type,
              source_title,
              source_author,
              source_page,
              source_url,
              source_notes,
              published_at
            `,
          )
          .eq(
            "slug",
            slug,
          )
          .eq(
            "status",
            "published",
          )
          .maybeSingle();


      if (recipeError) {
        console.error(
          "GET PUBLISHED RECIPE ERROR:",
          recipeError,
        );


        throw new Error(
          "No se pudo cargar la receta.",
        );
      }


      if (!recipeData) {
        return null;
      }


      const recipe =
        recipeData as PublishedRecipeRow;


      const [
        recipeTypeResult,
        categoriesResult,
        tagsResult,
        ingredientGroupsResult,
        stepsResult,
        allergensResult,
      ] =
        await Promise.all([
          recipe.recipe_type_id
            ? supabase
                .from(
                  "recipe_types",
                )
                .select(
                  "id, name, slug",
                )
                .eq(
                  "id",
                  recipe.recipe_type_id,
                )
                .maybeSingle()
            : Promise.resolve({
                data:
                  null,

                error:
                  null,
              }),

          supabase
            .from(
              "recipe_categories",
            )
            .select(
              `
                category_id,
                categories (
                  id,
                  name,
                  slug
                )
              `,
            )
            .eq(
              "recipe_id",
              recipe.id,
            ),

          supabase
            .from(
              "recipe_tags",
            )
            .select(
              `
                tag_id,
                tags (
                  id,
                  name,
                  slug
                )
              `,
            )
            .eq(
              "recipe_id",
              recipe.id,
            ),

          supabase
            .from(
              "ingredient_groups",
            )
            .select(
              `
                id,
                name,
                position
              `,
            )
            .eq(
              "recipe_id",
              recipe.id,
            )
            .order(
              "position",
              {
                ascending:
                  true,
              },
            ),

          supabase
            .from(
              "recipe_steps",
            )
            .select(
              `
                id,
                title,
                instructions,
                duration_minutes,
                tip,
                position
              `,
            )
            .eq(
              "recipe_id",
              recipe.id,
            )
            .order(
              "position",
              {
                ascending:
                  true,
              },
            ),

          supabase
            .from(
              "recipe_allergens",
            )
            .select(
              `
                presence,
                allergens (
                  id,
                  name,
                  slug
                )
              `,
            )
            .eq(
              "recipe_id",
              recipe.id,
            ),
        ]);


      const relationErrors = [
        recipeTypeResult.error,
        categoriesResult.error,
        tagsResult.error,
        ingredientGroupsResult.error,
        stepsResult.error,
        allergensResult.error,
      ].filter(
        Boolean,
      );


      if (
        relationErrors.length >
        0
      ) {
        console.error(
          "GET PUBLISHED RECIPE RELATIONS ERROR:",
          relationErrors,
        );


        throw new Error(
          "No se pudieron cargar todos los datos de la receta.",
        );
      }


      const ingredientGroups =
        (
          ingredientGroupsResult.data ??
          []
        ) as IngredientGroupRow[];


      let ingredients:
        IngredientRow[] =
        [];


      if (
        ingredientGroups.length >
        0
      ) {
        const groupIds =
          ingredientGroups.map(
            (
              group,
            ) =>
              group.id,
          );


        const {
          data:
            ingredientData,

          error:
            ingredientError,
        } =
          await supabase
            .from(
              "ingredients",
            )
            .select(
              `
                id,
                ingredient_group_id,
                quantity,
                unit,
                name,
                notes,
                scalable,
                position
              `,
            )
            .in(
              "ingredient_group_id",
              groupIds,
            )
            .order(
              "position",
              {
                ascending:
                  true,
              },
            );


        if (
          ingredientError
        ) {
          console.error(
            "GET PUBLISHED RECIPE INGREDIENTS ERROR:",
            ingredientError,
          );


          throw new Error(
            "No se pudieron cargar los ingredientes de la receta.",
          );
        }


        ingredients =
          (
            ingredientData ??
            []
          ) as IngredientRow[];
      }


      const publicGroups:
        PublicRecipeIngredientGroup[] =
        ingredientGroups.map(
          (
            group,
          ) => ({
            id:
              group.id,

            name:
              group.name,

            position:
              group.position,

            ingredients:
              ingredients
                .filter(
                  (
                    ingredient,
                  ) =>
                    ingredient
                      .ingredient_group_id ===
                    group.id,
                )
                .map(
                  (
                    ingredient,
                  ): PublicRecipeIngredient => ({
                    id:
                      ingredient.id,

                    quantity:
                      ingredient.quantity,

                    unit:
                      ingredient.unit,

                    name:
                      ingredient.name,

                    notes:
                      ingredient.notes,

                    scalable:
                      ingredient.scalable,

                    position:
                      ingredient.position,
                  }),
                ),
          }),
        );


      const categories =
        (
          categoriesResult.data ??
          []
        ) as unknown as CategoryRelationRow[];


      const publicCategories:
        PublicRecipeCategory[] =
        categories
          .map(
            (
              relation,
            ) =>
              relation.categories,
          )
          .filter(
            (
              category,
            ): category is RecipeTypeRow =>
              category !==
              null,
          )
          .map(
            (
              category,
            ) => ({
              id:
                category.id,

              name:
                category.name,

              slug:
                category.slug,
            }),
          );


      const tags =
        (
          tagsResult.data ??
          []
        ) as unknown as TagRelationRow[];


      const publicTags:
        PublicRecipeTag[] =
        tags
          .map(
            (
              relation,
            ) =>
              relation.tags,
          )
          .filter(
            (
              tag,
            ): tag is RecipeTypeRow =>
              tag !==
              null,
          )
          .map(
            (
              tag,
            ) => ({
              id:
                tag.id,

              name:
                tag.name,

              slug:
                tag.slug,
            }),
          );


      const steps =
        (
          stepsResult.data ??
          []
        ) as RecipeStepRow[];


      const publicSteps:
        PublicRecipeStep[] =
        steps.map(
          (
            step,
          ) => ({
            id:
              step.id,

            title:
              step.title,

            instructions:
              step.instructions,

            durationMinutes:
              step.duration_minutes,

            tip:
              step.tip,

            position:
              step.position,
          }),
        );


      const allergens =
        (
          allergensResult.data ??
          []
        ) as unknown as AllergenRelationRow[];


      const publicAllergens:
        PublicRecipeAllergen[] =
        allergens
          .filter(
            (
              relation,
            ) =>
              relation.allergens !==
              null,
          )
          .map(
            (
              relation,
            ) => {
              const allergen =
                relation.allergens as RecipeTypeRow;


              return {
                id:
                  allergen.id,

                name:
                  allergen.name,

                slug:
                  allergen.slug,

                presence:
                  relation.presence,
              };
            },
          );


      const recipeType:
        PublicRecipeType | null =
        recipeTypeResult.data
          ? {
              id:
                (
                  recipeTypeResult.data as RecipeTypeRow
                ).id,

              name:
                (
                  recipeTypeResult.data as RecipeTypeRow
                ).name,

              slug:
                (
                  recipeTypeResult.data as RecipeTypeRow
                ).slug,
            }
          : null;


      const listItem =
        mapRecipeListItem(
          recipe,
          getPublicRecipeImageUrl(
            recipe.image_path,
            supabase,
          ),
        );


      return {
        ...listItem,

        introduction:
          recipe.introduction,

        imageAlt:
          recipe.image_alt,

        recipeType,

        categories:
          publicCategories,

        tags:
          publicTags,

        ingredientGroups:
          publicGroups,

        steps:
          publicSteps,

        tips:
          recipe.tips,

        substitutions:
          recipe.substitutions,

        storage:
          recipe.storage,

        freezing:
          recipe.freezing,

        reheating:
          recipe.reheating,

        sourceType:
          recipe.source_type,

        sourceTitle:
          recipe.source_title,

        sourceAuthor:
          recipe.source_author,

        sourcePage:
          recipe.source_page,

        sourceUrl:
          recipe.source_url,

        sourceNotes:
          recipe.source_notes,

        allergens:
          publicAllergens,
      };
    },
  );