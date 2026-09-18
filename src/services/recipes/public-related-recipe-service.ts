import {
  createClient,
} from "@/lib/supabase/server";

import {
  getPublishedRecipes,
} from "@/services/recipes/public-recipe-service";

import type {
  PublicRecipeDetail,
  PublicRecipeListItem,
} from "@/types/public-recipe";


type CandidateRecipeRow = {
  id: string;

  recipe_type_id:
    string | null;
};


type CategoryRelationRow = {
  recipe_id: string;

  category_id: string;
};


type TagRelationRow = {
  recipe_id: string;

  tag_id: string;
};


type ScoredRecipe = {
  recipe:
    PublicRecipeListItem;

  score:
    number;
};


function addRelationToMap(
  map:
    Map<
      string,
      Set<string>
    >,

  recipeId:
    string,

  relationId:
    string,
) {
  const current =
    map.get(
      recipeId,
    ) ??
    new Set<string>();


  current.add(
    relationId,
  );


  map.set(
    recipeId,
    current,
  );
}


function getPublishedTime(
  recipe:
    PublicRecipeListItem,
) {
  if (
    !recipe.publishedAt
  ) {
    return 0;
  }


  return new Date(
    recipe.publishedAt,
  ).getTime();
}


export async function getRelatedPublishedRecipes(
  recipe:
    PublicRecipeDetail,

  limit = 3,
): Promise<
  PublicRecipeListItem[]
> {
  const allPublishedRecipes =
    await getPublishedRecipes();


  const candidates =
    allPublishedRecipes.filter(
      (
        candidate,
      ) =>
        candidate.id !==
        recipe.id,
    );


  if (
    candidates.length ===
    0
  ) {
    return [];
  }


  const candidateIds =
    candidates.map(
      (
        candidate,
      ) =>
        candidate.id,
    );


  const supabase =
    await createClient();


  const [
    recipesResult,
    categoriesResult,
    tagsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "recipes",
        )
        .select(
          `
            id,
            recipe_type_id
          `,
        )
        .eq(
          "status",
          "published",
        )
        .in(
          "id",
          candidateIds,
        ),

      supabase
        .from(
          "recipe_categories",
        )
        .select(
          `
            recipe_id,
            category_id
          `,
        )
        .in(
          "recipe_id",
          candidateIds,
        ),

      supabase
        .from(
          "recipe_tags",
        )
        .select(
          `
            recipe_id,
            tag_id
          `,
        )
        .in(
          "recipe_id",
          candidateIds,
        ),
    ]);


  const errors = [
    recipesResult.error,
    categoriesResult.error,
    tagsResult.error,
  ].filter(
    Boolean,
  );


  if (
    errors.length >
    0
  ) {
    console.error(
      "GET RELATED PUBLIC RECIPES ERROR:",
      errors,
    );


    throw new Error(
      "No se pudieron cargar las recetas relacionadas.",
    );
  }


  const recipeRows =
    (
      recipesResult.data ??
      []
    ) as CandidateRecipeRow[];


  const categoryRows =
    (
      categoriesResult.data ??
      []
    ) as CategoryRelationRow[];


  const tagRows =
    (
      tagsResult.data ??
      []
    ) as TagRelationRow[];


  const recipeTypes =
    new Map<
      string,
      string | null
    >();


  recipeRows.forEach(
    (
      row,
    ) => {
      recipeTypes.set(
        row.id,
        row.recipe_type_id,
      );
    },
  );


  const categoriesByRecipe =
    new Map<
      string,
      Set<string>
    >();


  categoryRows.forEach(
    (
      row,
    ) => {
      addRelationToMap(
        categoriesByRecipe,
        row.recipe_id,
        row.category_id,
      );
    },
  );


  const tagsByRecipe =
    new Map<
      string,
      Set<string>
    >();


  tagRows.forEach(
    (
      row,
    ) => {
      addRelationToMap(
        tagsByRecipe,
        row.recipe_id,
        row.tag_id,
      );
    },
  );


  const currentCategoryIds =
    new Set(
      recipe.categories.map(
        (
          category,
        ) =>
          category.id,
      ),
    );


  const currentTagIds =
    new Set(
      recipe.tags.map(
        (
          tag,
        ) =>
          tag.id,
      ),
    );


  const scoredRecipes:
    ScoredRecipe[] =
    candidates.map(
      (
        candidate,
      ) => {
        let score =
          0;


        const candidateTypeId =
          recipeTypes.get(
            candidate.id,
          ) ??
          null;


        if (
          recipe.recipeType &&
          candidateTypeId ===
            recipe.recipeType.id
        ) {
          score +=
            3;
        }


        const candidateCategories =
          categoriesByRecipe.get(
            candidate.id,
          ) ??
          new Set<string>();


        candidateCategories.forEach(
          (
            categoryId,
          ) => {
            if (
              currentCategoryIds.has(
                categoryId,
              )
            ) {
              score +=
                2;
            }
          },
        );


        const candidateTags =
          tagsByRecipe.get(
            candidate.id,
          ) ??
          new Set<string>();


        candidateTags.forEach(
          (
            tagId,
          ) => {
            if (
              currentTagIds.has(
                tagId,
              )
            ) {
              score +=
                1;
            }
          },
        );


        return {
          recipe:
            candidate,

          score,
        };
      },
    );


  scoredRecipes.sort(
    (
      first,
      second,
    ) => {
      if (
        first.score !==
        second.score
      ) {
        return (
          second.score -
          first.score
        );
      }


      if (
        first.recipe.featured !==
        second.recipe.featured
      ) {
        return first.recipe
          .featured
          ? -1
          : 1;
      }


      return (
        getPublishedTime(
          second.recipe,
        ) -
        getPublishedTime(
          first.recipe,
        )
      );
    },
  );


  return scoredRecipes
    .slice(
      0,
      limit,
    )
    .map(
      (
        scoredRecipe,
      ) =>
        scoredRecipe.recipe,
    );
}