import {
  createClient,
} from "@/lib/supabase/server";

import type {
  RecipeBasicInfoData,
} from "@/schemas/recipe-basic-info-schema";

import type {
  RecipeClassificationData,
} from "@/schemas/recipe-classification-schema";

import type {
  RecipeServingsData,
} from "@/schemas/recipe-servings-schema";

import type {
  RecipeTimesData,
} from "@/schemas/recipe-times-schema";


export type RecipeStatus =
  | "draft"
  | "published"
  | "archived";


export type RecipeDifficulty =
  | "easy"
  | "medium"
  | "hard";


export type AdminRecipeListItem = {
  id: string;

  title: string;
  slug: string;

  short_description:
    string | null;

  status:
    RecipeStatus;

  featured:
    boolean;

  image_path:
    string | null;

  created_at:
    string;

  updated_at:
    string;

  published_at:
    string | null;
};


export type AdminRecipe = {
  id: string;

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

  recipe_type_id:
    string | null;

  difficulty:
    RecipeDifficulty | null;

  base_servings:
    number | null;

  preparation_minutes:
    number | null;

  cooking_minutes:
    number | null;

  additional_minutes:
    number | null;

  status:
    RecipeStatus;

  image_path:
    string | null;

  image_alt:
    string | null;

  featured:
    boolean;

  created_at:
    string;

  updated_at:
    string;

  published_at:
    string | null;
};


export type RecipeTypeOption = {
  id: string;
  name: string;
  slug: string;
};


export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};


export type TagOption = {
  id: string;
  name: string;
  slug: string;
};


export type RecipeClassificationOptions = {
  recipeTypes:
    RecipeTypeOption[];

  categories:
    CategoryOption[];

  tags:
    TagOption[];
};


type CreateRecipeDraftInput = {
  title: string;
  slug: string;
};


/* =========================================================
   CREATE DRAFT
========================================================= */

export async function createRecipeDraft(
  input: CreateRecipeDraftInput,
) {
  const supabase =
    await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } =
    await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError ||
    !userId
  ) {
    throw new Error(
      "No existe una sesión válida.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .insert({
        author_id:
          userId,

        title:
          input.title.trim(),

        slug:
          input.slug.trim(),

        status:
          "draft",

        featured:
          false,
      })
      .select(`
        id,
        title,
        slug,
        status
      `)
      .single();

  if (error) {
    throw new Error(
      `No se pudo crear la receta: ${error.message}`,
    );
  }

  return data;
}


/* =========================================================
   ADMIN RECIPE LIST
========================================================= */

export async function getAdminRecipes(): Promise<
  AdminRecipeListItem[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .select(`
        id,
        title,
        slug,
        short_description,
        status,
        featured,
        image_path,
        created_at,
        updated_at,
        published_at
      `)
      .order(
        "updated_at",
        {
          ascending:
            false,
        },
      );

  if (error) {
    throw new Error(
      `No se pudieron obtener las recetas: ${error.message}`,
    );
  }

  return data ?? [];
}


/* =========================================================
   GET SINGLE ADMIN RECIPE
========================================================= */

export async function getAdminRecipeById(
  recipeId: string,
): Promise<AdminRecipe | null> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .select(`
        id,
        author_id,
        title,
        slug,
        short_description,
        introduction,
        recipe_type_id,
        difficulty,
        base_servings,
        preparation_minutes,
        cooking_minutes,
        additional_minutes,
        status,
        image_path,
        image_alt,
        featured,
        created_at,
        updated_at,
        published_at
      `)
      .eq(
        "id",
        recipeId,
      )
      .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo obtener la receta: ${error.message}`,
    );
  }

  return data;
}


/* =========================================================
   UPDATE BASIC INFO
========================================================= */

export async function updateRecipeBasicInfo(
  recipeId: string,
  input: RecipeBasicInfoData,
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .update({
        title:
          input.title,

        slug:
          input.slug,

        short_description:
          input.shortDescription,

        introduction:
          input.introduction,
      })
      .eq(
        "id",
        recipeId,
      )
      .select(`
        id,
        title,
        slug,
        short_description,
        introduction,
        updated_at
      `)
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   UPDATE IMAGE PATH
========================================================= */

export async function updateRecipeImagePath(
  recipeId: string,
  imagePath: string | null,
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .update({
        image_path:
          imagePath,
      })
      .eq(
        "id",
        recipeId,
      )
      .select(`
        id,
        image_path,
        updated_at
      `)
      .single();

  if (error) {
    throw new Error(
      `No se pudo actualizar la imagen de la receta: ${error.message}`,
    );
  }

  return data;
}


/* =========================================================
   CLASSIFICATION OPTIONS
========================================================= */

export async function getRecipeClassificationOptions():
Promise<RecipeClassificationOptions> {
  const supabase =
    await createClient();

  const [
    recipeTypesResult,
    categoriesResult,
    tagsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "recipe_types",
        )
        .select(
          "id, name, slug",
        )
        .order(
          "position",
        ),

      supabase
        .from(
          "categories",
        )
        .select(
          "id, name, slug",
        )
        .order(
          "name",
        ),

      supabase
        .from(
          "tags",
        )
        .select(
          "id, name, slug",
        )
        .order(
          "name",
        ),
    ]);

  if (
    recipeTypesResult.error
  ) {
    throw new Error(
      `No se pudieron obtener los tipos: ${recipeTypesResult.error.message}`,
    );
  }

  if (
    categoriesResult.error
  ) {
    throw new Error(
      `No se pudieron obtener las categorías: ${categoriesResult.error.message}`,
    );
  }

  if (
    tagsResult.error
  ) {
    throw new Error(
      `No se pudieron obtener las etiquetas: ${tagsResult.error.message}`,
    );
  }

  return {
    recipeTypes:
      recipeTypesResult.data ??
      [],

    categories:
      categoriesResult.data ??
      [],

    tags:
      tagsResult.data ??
      [],
  };
}


/* =========================================================
   CURRENT CLASSIFICATION RELATIONS
========================================================= */

export async function getRecipeClassificationRelations(
  recipeId: string,
) {
  const supabase =
    await createClient();

  const [
    categoriesResult,
    tagsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "recipe_categories",
        )
        .select(
          "category_id",
        )
        .eq(
          "recipe_id",
          recipeId,
        ),

      supabase
        .from(
          "recipe_tags",
        )
        .select(
          "tag_id",
        )
        .eq(
          "recipe_id",
          recipeId,
        ),
    ]);

  if (
    categoriesResult.error
  ) {
    throw new Error(
      `No se pudieron obtener las categorías de la receta: ${categoriesResult.error.message}`,
    );
  }

  if (
    tagsResult.error
  ) {
    throw new Error(
      `No se pudieron obtener las etiquetas de la receta: ${tagsResult.error.message}`,
    );
  }

  return {
    categoryIds:
      categoriesResult.data.map(
        (item) =>
          item.category_id,
      ),

    tagIds:
      tagsResult.data.map(
        (item) =>
          item.tag_id,
      ),
  };
}


/* =========================================================
   UPDATE CLASSIFICATION
========================================================= */

export async function updateRecipeClassification(
  recipeId: string,
  input: RecipeClassificationData,
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "update_recipe_classification",
      {
        p_recipe_id:
          recipeId,

        p_recipe_type_id:
          input.recipeTypeId,

        p_difficulty:
          input.difficulty,

        p_featured:
          input.featured,

        p_category_ids:
          input.categoryIds,

        p_tag_ids:
          input.tagIds,
      },
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   UPDATE SERVINGS
========================================================= */

export async function updateRecipeServings(
  recipeId: string,
  input: RecipeServingsData,
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .update({
        base_servings:
          input.baseServings,
      })
      .eq(
        "id",
        recipeId,
      )
      .select(`
        id,
        base_servings,
        updated_at
      `)
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   UPDATE TIMES
========================================================= */

export async function updateRecipeTimes(
  recipeId: string,
  input: RecipeTimesData,
) {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("recipes")
      .update({
        preparation_minutes:
          input.preparationMinutes,

        cooking_minutes:
          input.cookingMinutes,

        additional_minutes:
          input.additionalMinutes,
      })
      .eq(
        "id",
        recipeId,
      )
      .select(`
        id,
        preparation_minutes,
        cooking_minutes,
        additional_minutes,
        updated_at
      `)
      .single();

  if (error) {
    throw error;
  }

  return data;
}