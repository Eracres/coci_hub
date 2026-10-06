import {
  createClient,
} from "@/lib/supabase/server";

import type {
  RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

import type {
  RecipeServingsData,
} from "@/schemas/recipe-servings-schema";


export type CommunityRecipeStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived";


export type CommunityRecipeEditorRecord = {
  id:
    string;

  author_id:
    string;

  title:
    string;

  slug:
    string;

  short_description:
    string | null;

  introduction:
    string | null;

  base_servings:
    number | null;

  status:
    CommunityRecipeStatus;

  review_notes:
    string | null;

  created_at:
    string;

  updated_at:
    string;
};


/* =========================================================
   GET OWN RECIPE FOR EDITOR
========================================================= */

export async function getMyRecipeForEditor(
  recipeId:
    string,

  userId:
    string,
): Promise<
  CommunityRecipeEditorRecord | null
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
      .select(`
        id,
        author_id,
        title,
        slug,
        short_description,
        introduction,
        base_servings,
        status,
        review_notes,
        created_at,
        updated_at
      `)
      .eq(
        "id",
        recipeId,
      )
      .eq(
        "author_id",
        userId,
      )
      .maybeSingle();


  if (error) {
    throw new Error(
      `No se pudo obtener la receta: ${error.message}`,
    );
  }


  return (
    data as
      CommunityRecipeEditorRecord | null
  );
}


/* =========================================================
   UPDATE OWN BASIC INFO
========================================================= */

export async function updateMyRecipeBasicInfo(
  recipeId:
    string,

  input:
    RecipeBasicInfoFormData,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "update_my_recipe_basic_info",
      {
        p_recipe_id:
          recipeId,

        p_title:
          input.title,

        p_slug:
          input.slug,

        p_short_description:
          input.shortDescription,

        p_introduction:
          input.introduction,
      },
    );


  if (error) {
    throw error;
  }
}


/* =========================================================
   UPDATE OWN SERVINGS
========================================================= */

export async function updateMyRecipeServings(
  recipeId:
    string,

  input:
    RecipeServingsData,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "update_my_recipe_servings",
      {
        p_recipe_id:
          recipeId,

        p_base_servings:
          input.baseServings,
      },
    );


  if (error) {
    throw error;
  }
}
