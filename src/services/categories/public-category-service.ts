import {
  createClient,
} from "@/lib/supabase/server";

import {
  searchPublishedRecipes,
} from "@/services/recipes/public-recipe-list-service";

import {
  getPublishedRecipes,
} from "@/services/recipes/public-recipe-service";

import type {
  PublicCategoryDetail,
  PublicCategorySummary,
} from "@/types/public-category";


type CategoryRow = {
  id: string;

  name: string;

  slug: string;
};


type RecipeCategoryRow = {
  recipe_id: string;

  category_id: string;
};


export async function getPublicCategories(): Promise<
  PublicCategorySummary[]
> {
  const supabase =
    await createClient();


  const {
    data:
      categoriesData,

    error:
      categoriesError,
  } =
    await supabase
      .from(
        "categories",
      )
      .select(
        `
          id,
          name,
          slug
        `,
      )
      .order(
        "name",
        {
          ascending:
            true,
        },
      );


  if (
    categoriesError
  ) {
    console.error(
      "GET PUBLIC CATEGORIES ERROR:",
      categoriesError,
    );


    throw new Error(
      "No se pudieron cargar las categorías.",
    );
  }


  const categories =
    (
      categoriesData ??
      []
    ) as CategoryRow[];


  if (
    categories.length ===
    0
  ) {
    return [];
  }


  const publishedRecipes =
    await getPublishedRecipes();


  if (
    publishedRecipes.length ===
    0
  ) {
    return categories.map(
      (
        category,
      ) => ({
        id:
          category.id,

        name:
          category.name,

        slug:
          category.slug,

        recipeCount:
          0,
      }),
    );
  }


  const publishedRecipeIds =
    publishedRecipes.map(
      (
        recipe,
      ) =>
        recipe.id,
    );


  const {
    data:
      relationsData,

    error:
      relationsError,
  } =
    await supabase
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
        publishedRecipeIds,
      );


  if (
    relationsError
  ) {
    console.error(
      "GET PUBLIC CATEGORY RELATIONS ERROR:",
      relationsError,
    );


    throw new Error(
      "No se pudieron cargar las relaciones de categorías.",
    );
  }


  const relations =
    (
      relationsData ??
      []
    ) as RecipeCategoryRow[];


  const counts =
    new Map<
      string,
      number
    >();


  relations.forEach(
    (
      relation,
    ) => {
      const currentCount =
        counts.get(
          relation.category_id,
        ) ??
        0;


      counts.set(
        relation.category_id,
        currentCount +
          1,
      );
    },
  );


  return categories.map(
    (
      category,
    ) => ({
      id:
        category.id,

      name:
        category.name,

      slug:
        category.slug,

      recipeCount:
        counts.get(
          category.id,
        ) ??
        0,
    }),
  );
}


export async function getPublicCategoryBySlug(
  slug: string,
): Promise<
  PublicCategoryDetail | null
> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "categories",
      )
      .select(
        `
          id,
          name,
          slug
        `,
      )
      .eq(
        "slug",
        slug,
      )
      .maybeSingle();


  if (error) {
    console.error(
      "GET PUBLIC CATEGORY BY SLUG ERROR:",
      error,
    );


    throw new Error(
      "No se pudo cargar la categoría.",
    );
  }


  if (!data) {
    return null;
  }


  const category =
    data as CategoryRow;


  const result =
    await searchPublishedRecipes(
      {
        search:
          "",

        category:
          category.slug,

        recipeType:
          "",

        difficulty:
          "",

        tag:
          "",

        order:
          "featured",
      },
    );


  return {
    category: {
      id:
        category.id,

      name:
        category.name,

      slug:
        category.slug,

      recipeCount:
        result.total,
    },

    recipes:
      result.recipes,

    total:
      result.total,
  };
}