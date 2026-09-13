import {
  createClient,
} from "@/lib/supabase/server";

import type {
  RecipeAdditionalInfoData,
  RecipeSourceType,
} from "@/schemas/recipe-additional-info-schema";

import type {
  RecipeAllergensData,
  RecipeAllergensFormData,
} from "@/schemas/recipe-allergens-schema";

import type {
  RecipeBasicInfoData,
} from "@/schemas/recipe-basic-info-schema";

import type {
  RecipeClassificationData,
} from "@/schemas/recipe-classification-schema";

import type {
  RecipeIngredientsData,
  RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";

import type {
  RecipeStatus,
} from "@/schemas/recipe-publication-schema";

import type {
  RecipeServingsData,
} from "@/schemas/recipe-servings-schema";

import type {
  RecipeStepsData,
  RecipeStepsFormData,
} from "@/schemas/recipe-steps-schema";

import type {
  RecipeTimesData,
} from "@/schemas/recipe-times-schema";


export type RecipeDifficulty =
  | "easy"
  | "medium"
  | "hard";


export type AdminRecipeListItem = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  status: RecipeStatus;
  featured: boolean;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};


export type AdminRecipe = {
  id: string;
  author_id: string;

  title: string;
  slug: string;

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
    RecipeSourceType | null;

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


export type AllergenOption = {
  id: string;
  name: string;
  slug: string;
  position: number;
};


export type DeleteRecipeServiceResult = {
  storageCleanupWarning:
    boolean;
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
        .from("recipe_types")
        .select(
          "id, name, slug",
        )
        .order(
          "position",
        ),

      supabase
        .from("categories")
        .select(
          "id, name, slug",
        )
        .order(
          "name",
        ),

      supabase
        .from("tags")
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


/* =========================================================
   GET INGREDIENTS
========================================================= */

export async function getRecipeIngredients(
  recipeId: string,
): Promise<
  RecipeIngredientsFormData["groups"]
> {
  const supabase =
    await createClient();

  const {
    data: groups,
    error: groupsError,
  } =
    await supabase
      .from(
        "ingredient_groups",
      )
      .select(`
        id,
        name,
        position
      `)
      .eq(
        "recipe_id",
        recipeId,
      )
      .order(
        "position",
        {
          ascending:
            true,
        },
      );

  if (groupsError) {
    throw new Error(
      `No se pudieron obtener los grupos de ingredientes: ${groupsError.message}`,
    );
  }

  if (
    !groups ||
    groups.length === 0
  ) {
    return [];
  }

  const groupIds =
    groups.map(
      (group) =>
        group.id,
    );

  const {
    data: ingredients,
    error: ingredientsError,
  } =
    await supabase
      .from(
        "ingredients",
      )
      .select(`
        id,
        ingredient_group_id,
        name,
        quantity,
        unit,
        notes,
        scalable,
        position
      `)
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
    ingredientsError
  ) {
    throw new Error(
      `No se pudieron obtener los ingredientes: ${ingredientsError.message}`,
    );
  }

  return groups.map(
    (group) => ({
      name:
        group.name,

      ingredients:
        (
          ingredients ??
          []
        )
          .filter(
            (ingredient) =>
              ingredient
                .ingredient_group_id ===
              group.id,
          )
          .map(
            (ingredient) => ({
              name:
                ingredient.name,

              quantity:
                ingredient.quantity ===
                null
                  ? ""
                  : String(
                      ingredient.quantity,
                    ),

              unit:
                ingredient.unit ??
                "",

              notes:
                ingredient.notes ??
                "",

              scalable:
                ingredient.scalable,
            }),
          ),
    }),
  );
}


/* =========================================================
   REPLACE INGREDIENTS
========================================================= */

export async function replaceRecipeIngredients(
  recipeId: string,
  input: RecipeIngredientsData,
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "replace_recipe_ingredients",
      {
        p_recipe_id:
          recipeId,

        p_groups:
          input.groups,
      },
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   GET STEPS
========================================================= */

export async function getRecipeSteps(
  recipeId: string,
): Promise<
  RecipeStepsFormData["steps"]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "recipe_steps",
      )
      .select(`
        id,
        title,
        instructions,
        duration_minutes,
        tip,
        position
      `)
      .eq(
        "recipe_id",
        recipeId,
      )
      .order(
        "position",
        {
          ascending:
            true,
        },
      );

  if (error) {
    throw new Error(
      `No se pudieron obtener los pasos: ${error.message}`,
    );
  }

  return (
    data ??
    []
  ).map(
    (step) => ({
      title:
        step.title ??
        "",

      instructions:
        step.instructions,

      durationMinutes:
        step.duration_minutes ===
        null
          ? ""
          : String(
              step.duration_minutes,
            ),

      tip:
        step.tip ??
        "",
    }),
  );
}


/* =========================================================
   REPLACE STEPS
========================================================= */

export async function replaceRecipeSteps(
  recipeId: string,
  input: RecipeStepsData,
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "replace_recipe_steps",
      {
        p_recipe_id:
          recipeId,

        p_steps:
          input.steps,
      },
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   UPDATE ADDITIONAL INFO
========================================================= */

export async function updateRecipeAdditionalInfo(
  recipeId: string,
  input: RecipeAdditionalInfoData,
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
        tips:
          input.tips,

        substitutions:
          input.substitutions,

        storage:
          input.storage,

        freezing:
          input.freezing,

        reheating:
          input.reheating,

        source_type:
          input.sourceType,

        source_title:
          input.sourceTitle,

        source_author:
          input.sourceAuthor,

        source_page:
          input.sourcePage,

        source_url:
          input.sourceUrl,

        source_notes:
          input.sourceNotes,
      })
      .eq(
        "id",
        recipeId,
      )
      .select(`
        id,
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
        updated_at
      `)
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* =========================================================
   ALLERGEN CATALOG
========================================================= */

export async function getAllergenOptions(): Promise<
  AllergenOption[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("allergens")
      .select(`
        id,
        name,
        slug,
        position
      `)
      .order(
        "position",
        {
          ascending:
            true,
        },
      );

  if (error) {
    throw new Error(
      `No se pudo obtener el catálogo de alérgenos: ${error.message}`,
    );
  }

  return data ?? [];
}


/* =========================================================
   CURRENT RECIPE ALLERGENS
========================================================= */

export async function getRecipeAllergens(
  recipeId: string,
): Promise<
  RecipeAllergensFormData["allergens"]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from(
        "recipe_allergens",
      )
      .select(`
        allergen_id,
        presence
      `)
      .eq(
        "recipe_id",
        recipeId,
      );

  if (error) {
    throw new Error(
      `No se pudieron obtener los alérgenos de la receta: ${error.message}`,
    );
  }

  return (
    data ??
    []
  ).map(
    (allergen) => ({
      allergenId:
        allergen.allergen_id,

      presence:
        allergen.presence,
    }),
  );
}


/* =========================================================
   REPLACE RECIPE ALLERGENS
========================================================= */

export async function replaceRecipeAllergens(
  recipeId: string,
  input: RecipeAllergensData,
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "replace_recipe_allergens",
      {
        p_recipe_id:
          recipeId,

        p_allergens:
          input.allergens,
      },
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   UPDATE RECIPE STATUS
========================================================= */

export async function updateRecipeStatus(
  recipeId: string,
  status: RecipeStatus,
) {
  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "set_recipe_status",
      {
        p_recipe_id:
          recipeId,

        p_status:
          status,
      },
    );

  if (error) {
    throw error;
  }
}


/* =========================================================
   DELETE RECIPE
========================================================= */

export async function deleteRecipe(
  recipeId: string,
  confirmationTitle: string,
): Promise<DeleteRecipeServiceResult> {
  const supabase =
    await createClient();


  /*
   * Guardamos la ruta antes de borrar la receta.
   * Después del DELETE ya no podremos recuperarla.
   */
  const {
    data: recipe,
    error: recipeError,
  } =
    await supabase
      .from("recipes")
      .select(`
        id,
        image_path
      `)
      .eq(
        "id",
        recipeId,
      )
      .single();


  if (recipeError) {
    throw new Error(
      `No se pudo obtener la receta antes de eliminarla: ${recipeError.message}`,
    );
  }


  const {
    error: deleteError,
  } =
    await supabase.rpc(
      "delete_recipe",
      {
        p_recipe_id:
          recipeId,

        p_confirmation_title:
          confirmationTitle,
      },
    );


  if (deleteError) {
    throw deleteError;
  }


  let storageCleanupWarning =
    false;


  /*
   * La eliminación de PostgreSQL ya ha terminado.
   *
   * Ahora limpiamos la imagen principal de Storage.
   * Si Storage falla no restauramos la receta:
   * simplemente registramos el fichero huérfano
   * para poder limpiarlo posteriormente.
   */
  if (
    recipe.image_path
  ) {
    const {
      error: storageError,
    } =
      await supabase.storage
        .from(
          "recipe-images",
        )
        .remove([
          recipe.image_path,
        ]);


    if (
      storageError
    ) {
      storageCleanupWarning =
        true;

      console.error(
        "DELETE RECIPE STORAGE CLEANUP ERROR:",
        storageError,
      );
    }
  }


  return {
    storageCleanupWarning,
  };
}