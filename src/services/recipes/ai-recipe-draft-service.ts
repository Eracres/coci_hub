import "server-only";

import {
  createClient,
} from "@/lib/supabase/server";

import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";

import type {
  AiRecipeDraftUnmatchedCatalogs,
} from "@/types/ai-recipe-draft-api";


type SupabaseServerClient =
  Awaited<
    ReturnType<
      typeof createClient
    >
  >;


type CatalogRow = {
  id:
    string;

  name:
    string;

  slug:
    string;
};


type ResolvedCatalogs = {
  recipeTypeId:
    string | null;

  categoryIds:
    string[];

  tagIds:
    string[];

  allergens:
    {
      allergenId:
        string;

      presence:
        "present" |
        "possible";
    }[];

  unmatched:
    AiRecipeDraftUnmatchedCatalogs;
};


export type CreateAiRecipeDraftResult = {
  recipeId:
    string;

  slug:
    string;

  unmatched:
    AiRecipeDraftUnmatchedCatalogs;
};


function normalizeCatalogValue(
  value:
    string,
) {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /\p{Diacritic}/gu,
      "",
    )
    .trim()
    .toLocaleLowerCase(
      "es-ES",
    );
}


function createBaseSlug(
  value:
    string,
) {
  const slug =
    value
      .normalize(
        "NFD",
      )
      .replace(
        /\p{Diacritic}/gu,
        "",
      )
      .toLocaleLowerCase(
        "es-ES",
      )
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );


  return (
    slug ||
    "receta-importada"
  );
}


function getIngredientGroupName(
  name:
    string | null,

  groupIndex:
    number,

  totalGroups:
    number,
) {
  const normalizedName =
    name?.trim();


  if (
    normalizedName
  ) {
    return normalizedName;
  }


  if (
    totalGroups ===
    1
  ) {
    return "Ingredientes";
  }


  return `Ingredientes ${groupIndex + 1}`;
}


function findCatalogItem(
  catalog:
    CatalogRow[],

  suggestion:
    string | null,
) {
  if (
    !suggestion
  ) {
    return null;
  }


  const normalizedSuggestion =
    normalizeCatalogValue(
      suggestion,
    );


  return (
    catalog.find(
      (
        item,
      ) =>
        normalizeCatalogValue(
          item.name,
        ) ===
          normalizedSuggestion ||
        normalizeCatalogValue(
          item.slug,
        ) ===
          normalizedSuggestion,
    ) ??
    null
  );
}


function uniqueStrings(
  values:
    string[],
) {
  return [
    ...new Set(
      values,
    ),
  ];
}


async function createUniqueSlug(
  supabase:
    SupabaseServerClient,

  title:
    string,
) {
  const baseSlug =
    createBaseSlug(
      title,
    );


  let candidate =
    baseSlug;

  let suffix =
    2;


  while (
    true
  ) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "recipes",
        )
        .select(
          "id",
        )
        .eq(
          "slug",
          candidate,
        )
        .maybeSingle();


    if (
      error
    ) {
      throw error;
    }


    if (
      !data
    ) {
      return candidate;
    }


    candidate =
      `${baseSlug}-${suffix}`;

    suffix +=
      1;
  }
}


async function getCatalogs(
  supabase:
    SupabaseServerClient,
) {
  const [
    recipeTypesResult,
    categoriesResult,
    tagsResult,
    allergensResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "recipe_types",
        )
        .select(
          "id, name, slug",
        ),

      supabase
        .from(
          "categories",
        )
        .select(
          "id, name, slug",
        ),

      supabase
        .from(
          "tags",
        )
        .select(
          "id, name, slug",
        ),

      supabase
        .from(
          "allergens",
        )
        .select(
          "id, name, slug",
        ),
    ]);


  const errors =
    [
      recipeTypesResult.error,
      categoriesResult.error,
      tagsResult.error,
      allergensResult.error,
    ].filter(
      Boolean,
    );


  if (
    errors.length >
    0
  ) {
    console.error(
      "AI RECIPE CATALOG LOAD ERROR:",
      errors,
    );


    throw new Error(
      "No se pudieron cargar los catálogos de CociHub.",
    );
  }


  return {
    recipeTypes:
      (
        recipeTypesResult.data ??
        []
      ) as CatalogRow[],

    categories:
      (
        categoriesResult.data ??
        []
      ) as CatalogRow[],

    tags:
      (
        tagsResult.data ??
        []
      ) as CatalogRow[],

    allergens:
      (
        allergensResult.data ??
        []
      ) as CatalogRow[],
  };
}


async function resolveCatalogs(
  supabase:
    SupabaseServerClient,

  recipe:
    AiRecipeImport,
): Promise<
  ResolvedCatalogs
> {
  const catalogs =
    await getCatalogs(
      supabase,
    );


  const recipeType =
    findCatalogItem(
      catalogs.recipeTypes,
      recipe.classification
        .recipeType,
    );


  const categoryIds:
    string[] =
    [];


  const unmatchedCategories:
    string[] =
    [];


  recipe.classification
    .categories
    .forEach(
      (
        category,
      ) => {
        const match =
          findCatalogItem(
            catalogs.categories,
            category,
          );


        if (
          match
        ) {
          categoryIds.push(
            match.id,
          );
        } else {
          unmatchedCategories.push(
            category,
          );
        }
      },
    );


  const tagIds:
    string[] =
    [];


  const unmatchedTags:
    string[] =
    [];


  recipe.classification
    .tags
    .forEach(
      (
        tag,
      ) => {
        const match =
          findCatalogItem(
            catalogs.tags,
            tag,
          );


        if (
          match
        ) {
          tagIds.push(
            match.id,
          );
        } else {
          unmatchedTags.push(
            tag,
          );
        }
      },
    );


  const resolvedAllergens =
    new Map<
      string,
      {
        allergenId:
          string;

        presence:
          "present" |
          "possible";
      }
    >();


  const unmatchedAllergens:
    string[] =
    [];


  recipe.allergens.forEach(
    (
      allergen,
    ) => {
      const match =
        findCatalogItem(
          catalogs.allergens,
          allergen.name,
        );


      if (
        !match
      ) {
        unmatchedAllergens.push(
          allergen.name,
        );

        return;
      }


      const current =
        resolvedAllergens.get(
          match.id,
        );


      if (
        !current ||
        allergen.presence ===
          "present"
      ) {
        resolvedAllergens.set(
          match.id,
          {
            allergenId:
              match.id,

            presence:
              allergen.presence,
          },
        );
      }
    },
  );


  return {
    recipeTypeId:
      recipeType?.id ??
      null,

    categoryIds:
      uniqueStrings(
        categoryIds,
      ),

    tagIds:
      uniqueStrings(
        tagIds,
      ),

    allergens:
      [
        ...resolvedAllergens.values(),
      ],

    unmatched: {
      recipeType:
        recipe.classification
          .recipeType &&
        !recipeType
          ? recipe.classification
              .recipeType
          : null,

      categories:
        uniqueStrings(
          unmatchedCategories,
        ),

      tags:
        uniqueStrings(
          unmatchedTags,
        ),

      allergens:
        uniqueStrings(
          unmatchedAllergens,
        ),
    },
  };
}


async function cleanupFailedRecipe(
  supabase:
    SupabaseServerClient,

  recipeId:
    string,
) {
  const {
    error,
  } =
    await supabase
      .from(
        "recipes",
      )
      .delete()
      .eq(
        "id",
        recipeId,
      );


  if (
    error
  ) {
    console.error(
      "AI RECIPE ROLLBACK ERROR:",
      error,
    );
  }
}


export async function createAiRecipeDraft(
  recipe:
    AiRecipeImport,

  authorId:
    string,
): Promise<
  CreateAiRecipeDraftResult
> {
  const supabase =
    await createClient();


  const title =
    recipe.title?.trim() ||
    "Receta importada";


  const slug =
    await createUniqueSlug(
      supabase,
      title,
    );


  const catalogs =
    await resolveCatalogs(
      supabase,
      recipe,
    );


  const {
    data:
      createdRecipe,

    error:
      recipeError,
  } =
    await supabase
      .from(
        "recipes",
      )
      .insert(
        {
          author_id:
            authorId,

          recipe_type_id:
            catalogs.recipeTypeId,

          title,

          slug,

          short_description:
            recipe.shortDescription,

          introduction:
            recipe.introduction,

          image_path:
            null,

          image_alt:
            null,

          status:
            "draft",

          difficulty:
            recipe.difficulty,

          base_servings:
            recipe.baseServings,

          preparation_minutes:
            recipe.preparationMinutes,

          cooking_minutes:
            recipe.cookingMinutes,

          additional_minutes:
            recipe.additionalMinutes,

          featured:
            false,

          tips:
            null,

          substitutions:
            null,

          storage:
            null,

          freezing:
            null,

          reheating:
            null,

          source_type:
            recipe.source.type,

          source_title:
            recipe.source.title,

          source_author:
            recipe.source.author,

          source_page:
            recipe.source.page,

          source_url:
            recipe.source.url,

          source_notes:
            recipe.source.notes,

          published_at:
            null,
        },
      )
      .select(
        "id, slug",
      )
      .single();


  if (
    recipeError ||
    !createdRecipe
  ) {
    console.error(
      "AI CREATE RECIPE ERROR:",
      recipeError,
    );


    throw new Error(
      "No se pudo crear el borrador de la receta.",
    );
  }


  const recipeId =
    createdRecipe.id;


  try {
    if (
      catalogs.categoryIds.length >
      0
    ) {
      const {
        error,
      } =
        await supabase
          .from(
            "recipe_categories",
          )
          .insert(
            catalogs.categoryIds.map(
              (
                categoryId,
              ) => ({
                recipe_id:
                  recipeId,

                category_id:
                  categoryId,
              }),
            ),
          );


      if (
        error
      ) {
        throw error;
      }
    }


    if (
      catalogs.tagIds.length >
      0
    ) {
      const {
        error,
      } =
        await supabase
          .from(
            "recipe_tags",
          )
          .insert(
            catalogs.tagIds.map(
              (
                tagId,
              ) => ({
                recipe_id:
                  recipeId,

                tag_id:
                  tagId,
              }),
            ),
          );


      if (
        error
      ) {
        throw error;
      }
    }


    for (
      const [
        groupIndex,
        group,
      ] of
        recipe.ingredientGroups.entries()
    ) {
      const groupName =
        getIngredientGroupName(
          group.name,
          groupIndex,
          recipe.ingredientGroups.length,
        );


      const {
        data:
          createdGroup,

        error:
          groupError,
      } =
        await supabase
          .from(
            "ingredient_groups",
          )
          .insert(
            {
              recipe_id:
                recipeId,

              name:
                groupName,

              position:
                groupIndex +
                1,
            },
          )
          .select(
            "id",
          )
          .single();


      if (
        groupError ||
        !createdGroup
      ) {
        throw (
          groupError ??
          new Error(
            "No se pudo crear un grupo de ingredientes.",
          )
        );
      }


      if (
        group.ingredients.length ===
        0
      ) {
        continue;
      }


      const {
        error:
          ingredientsError,
      } =
        await supabase
          .from(
            "ingredients",
          )
          .insert(
            group.ingredients.map(
              (
                ingredient,
                ingredientIndex,
              ) => ({
                ingredient_group_id:
                  createdGroup.id,

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
                  ingredientIndex +
                  1,
              }),
            ),
          );


      if (
        ingredientsError
      ) {
        throw ingredientsError;
      }
    }


    if (
      recipe.steps.length >
      0
    ) {
      const {
        error:
          stepsError,
      } =
        await supabase
          .from(
            "recipe_steps",
          )
          .insert(
            recipe.steps.map(
              (
                step,
                stepIndex,
              ) => ({
                recipe_id:
                  recipeId,

                title:
                  step.title,

                instructions:
                  step.instructions,

                duration_minutes:
                  step.durationMinutes,

                tip:
                  step.tip,

                position:
                  stepIndex +
                  1,
              }),
            ),
          );


      if (
        stepsError
      ) {
        throw stepsError;
      }
    }


    if (
      catalogs.allergens.length >
      0
    ) {
      const {
        error:
          allergensError,
      } =
        await supabase
          .from(
            "recipe_allergens",
          )
          .insert(
            catalogs.allergens.map(
              (
                allergen,
              ) => ({
                recipe_id:
                  recipeId,

                allergen_id:
                  allergen.allergenId,

                presence:
                  allergen.presence,
              }),
            ),
          );


      if (
        allergensError
      ) {
        throw allergensError;
      }
    }


    return {
      recipeId,

      slug:
        createdRecipe.slug,

      unmatched:
        catalogs.unmatched,
    };
  } catch (
    error
  ) {
    console.error(
      "AI RECIPE DRAFT POPULATION ERROR:",
      error,
    );


    await cleanupFailedRecipe(
      supabase,
      recipeId,
    );


    throw new Error(
      "No se pudo completar el borrador importado.",
    );
  }
}