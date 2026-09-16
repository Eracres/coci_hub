import {
  createClient,
} from "@/lib/supabase/server";

import type {
  PublicRecipeDifficulty,
  PublicRecipeListItem,
} from "@/types/public-recipe";


const RECIPE_IMAGES_BUCKET =
  "recipe-images";


type PublishedRecipeRow = {
  id: string;

  title: string;

  slug: string;

  short_description:
    string | null;

  image_path:
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

  featured:
    boolean;

  published_at:
    string | null;
};


function calculateTotalMinutes(
  recipe: PublishedRecipeRow,
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
          image_path,
          difficulty,
          base_servings,
          preparation_minutes,
          cooking_minutes,
          additional_minutes,
          featured,
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
    ): PublicRecipeListItem => ({
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

      imageUrl:
        getPublicRecipeImageUrl(
          recipe.image_path,
          supabase,
        ),

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
    }),
  );
}