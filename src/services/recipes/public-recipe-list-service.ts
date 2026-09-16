import {
  createClient,
} from "@/lib/supabase/server";

import {
  getPublishedRecipes,
} from "@/services/recipes/public-recipe-service";

import type {
  PublicRecipeListItem,
} from "@/types/public-recipe";

import type {
  PublicRecipeFilterOption,
  PublicRecipeFilterOptions,
  PublicRecipeFilters,
  PublicRecipeSearchResult,
} from "@/types/public-recipe-filters";


type RelationRow = {
  recipe_id: string;
};


type RecipeTypeIdRow = {
  id: string;
};


function normalizeText(
  value: string,
) {
  return value
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
    .trim();
}


function filterByRecipeIds(
  recipes:
    PublicRecipeListItem[],

  recipeIds:
    Set<string>,
) {
  return recipes.filter(
    (
      recipe,
    ) =>
      recipeIds.has(
        recipe.id,
      ),
  );
}


function comparePublishedDates(
  first:
    PublicRecipeListItem,

  second:
    PublicRecipeListItem,
) {
  const firstTime =
    first.publishedAt
      ? new Date(
          first.publishedAt,
        ).getTime()
      : 0;


  const secondTime =
    second.publishedAt
      ? new Date(
          second.publishedAt,
        ).getTime()
      : 0;


  return {
    firstTime,
    secondTime,
  };
}


function sortRecipes(
  recipes:
    PublicRecipeListItem[],

  order:
    PublicRecipeFilters["order"],
) {
  const sorted =
    [
      ...recipes,
    ];


  switch (
    order
  ) {
    case "newest":
      return sorted.sort(
        (
          first,
          second,
        ) => {
          const {
            firstTime,
            secondTime,
          } =
            comparePublishedDates(
              first,
              second,
            );


          return (
            secondTime -
            firstTime
          );
        },
      );


    case "oldest":
      return sorted.sort(
        (
          first,
          second,
        ) => {
          const {
            firstTime,
            secondTime,
          } =
            comparePublishedDates(
              first,
              second,
            );


          return (
            firstTime -
            secondTime
          );
        },
      );


    case "title-asc":
      return sorted.sort(
        (
          first,
          second,
        ) =>
          first.title.localeCompare(
            second.title,
            "es",
            {
              sensitivity:
                "base",
            },
          ),
      );


    case "title-desc":
      return sorted.sort(
        (
          first,
          second,
        ) =>
          second.title.localeCompare(
            first.title,
            "es",
            {
              sensitivity:
                "base",
            },
          ),
      );


    case "time-asc":
      return sorted.sort(
        (
          first,
          second,
        ) =>
          first.totalMinutes -
          second.totalMinutes,
      );


    case "time-desc":
      return sorted.sort(
        (
          first,
          second,
        ) =>
          second.totalMinutes -
          first.totalMinutes,
      );


    case "featured":
    default:
      return sorted.sort(
        (
          first,
          second,
        ) => {
          if (
            first.featured !==
            second.featured
          ) {
            return first.featured
              ? -1
              : 1;
          }


          const {
            firstTime,
            secondTime,
          } =
            comparePublishedDates(
              first,
              second,
            );


          return (
            secondTime -
            firstTime
          );
        },
      );
  }
}


async function getRecipeTypeIdBySlug(
  slug: string,
) {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "recipe_types",
      )
      .select(
        "id",
      )
      .eq(
        "slug",
        slug,
      )
      .maybeSingle();


  if (error) {
    console.error(
      "GET PUBLIC RECIPE TYPE FILTER ERROR:",
      error,
    );


    throw new Error(
      "No se pudo aplicar el filtro por tipo de receta.",
    );
  }


  return (
    data as RecipeTypeIdRow | null
  );
}


async function getCategoryRecipeIds(
  categorySlug: string,
) {
  const supabase =
    await createClient();


  const {
    data:
      category,

    error:
      categoryError,
  } =
    await supabase
      .from(
        "categories",
      )
      .select(
        "id",
      )
      .eq(
        "slug",
        categorySlug,
      )
      .maybeSingle();


  if (
    categoryError
  ) {
    console.error(
      "GET PUBLIC CATEGORY FILTER ERROR:",
      categoryError,
    );


    throw new Error(
      "No se pudo aplicar el filtro por categoría.",
    );
  }


  if (!category) {
    return new Set<
      string
    >();
  }


  const {
    data:
      relations,

    error:
      relationError,
  } =
    await supabase
      .from(
        "recipe_categories",
      )
      .select(
        "recipe_id",
      )
      .eq(
        "category_id",
        category.id,
      );


  if (
    relationError
  ) {
    console.error(
      "GET PUBLIC CATEGORY RELATIONS ERROR:",
      relationError,
    );


    throw new Error(
      "No se pudieron cargar las recetas de la categoría.",
    );
  }


  return new Set(
    (
      relations ??
      []
    )
      .map(
        (
          relation,
        ) =>
          (
            relation as RelationRow
          ).recipe_id,
      ),
  );
}


async function getTagRecipeIds(
  tagSlug: string,
) {
  const supabase =
    await createClient();


  const {
    data:
      tag,

    error:
      tagError,
  } =
    await supabase
      .from(
        "tags",
      )
      .select(
        "id",
      )
      .eq(
        "slug",
        tagSlug,
      )
      .maybeSingle();


  if (
    tagError
  ) {
    console.error(
      "GET PUBLIC TAG FILTER ERROR:",
      tagError,
    );


    throw new Error(
      "No se pudo aplicar el filtro por etiqueta.",
    );
  }


  if (!tag) {
    return new Set<
      string
    >();
  }


  const {
    data:
      relations,

    error:
      relationError,
  } =
    await supabase
      .from(
        "recipe_tags",
      )
      .select(
        "recipe_id",
      )
      .eq(
        "tag_id",
        tag.id,
      );


  if (
    relationError
  ) {
    console.error(
      "GET PUBLIC TAG RELATIONS ERROR:",
      relationError,
    );


    throw new Error(
      "No se pudieron cargar las recetas de la etiqueta.",
    );
  }


  return new Set(
    (
      relations ??
      []
    )
      .map(
        (
          relation,
        ) =>
          (
            relation as RelationRow
          ).recipe_id,
      ),
  );
}


export async function getPublicRecipeFilterOptions(): Promise<
  PublicRecipeFilterOptions
> {
  const supabase =
    await createClient();


  const [
    categoriesResult,
    recipeTypesResult,
    tagsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "categories",
        )
        .select(
          "id, name, slug",
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "recipe_types",
        )
        .select(
          "id, name, slug",
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
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
          {
            ascending:
              true,
          },
        ),
    ]);


  const errors = [
    categoriesResult.error,
    recipeTypesResult.error,
    tagsResult.error,
  ].filter(
    Boolean,
  );


  if (
    errors.length >
    0
  ) {
    console.error(
      "GET PUBLIC RECIPE FILTER OPTIONS ERROR:",
      errors,
    );


    throw new Error(
      "No se pudieron cargar los filtros de recetas.",
    );
  }


  return {
    categories:
      (
        categoriesResult.data ??
        []
      ) as PublicRecipeFilterOption[],

    recipeTypes:
      (
        recipeTypesResult.data ??
        []
      ) as PublicRecipeFilterOption[],

    tags:
      (
        tagsResult.data ??
        []
      ) as PublicRecipeFilterOption[],
  };
}


export async function searchPublishedRecipes(
  filters:
    PublicRecipeFilters,
): Promise<
  PublicRecipeSearchResult
> {
  let recipes =
    await getPublishedRecipes();


  if (
    filters.search
  ) {
    const normalizedSearch =
      normalizeText(
        filters.search,
      );


    recipes =
      recipes.filter(
        (
          recipe,
        ) => {
          const searchableText =
            normalizeText(
              [
                recipe.title,
                recipe.shortDescription ??
                  "",
              ].join(
                " ",
              ),
            );


          return searchableText.includes(
            normalizedSearch,
          );
        },
      );
  }


  if (
    filters.difficulty
  ) {
    recipes =
      recipes.filter(
        (
          recipe,
        ) =>
          recipe.difficulty ===
          filters.difficulty,
      );
  }


  if (
    filters.recipeType
  ) {
    const recipeType =
      await getRecipeTypeIdBySlug(
        filters.recipeType,
      );


    if (!recipeType) {
      recipes =
        [];
    } else if (
      recipes.length >
      0
    ) {
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
            "id",
          )
          .eq(
            "status",
            "published",
          )
          .eq(
            "recipe_type_id",
            recipeType.id,
          )
          .in(
            "id",
            recipes.map(
              (
                recipe,
              ) =>
                recipe.id,
            ),
          );


      if (error) {
        console.error(
          "FILTER PUBLIC RECIPES BY TYPE ERROR:",
          error,
        );


        throw new Error(
          "No se pudo aplicar el filtro por tipo.",
        );
      }


      const allowedIds =
        new Set(
          (
            data ??
            []
          ).map(
            (
              row,
            ) =>
              row.id,
          ),
        );


      recipes =
        filterByRecipeIds(
          recipes,
          allowedIds,
        );
    }
  }


  if (
    filters.category
  ) {
    const recipeIds =
      await getCategoryRecipeIds(
        filters.category,
      );


    recipes =
      filterByRecipeIds(
        recipes,
        recipeIds,
      );
  }


  if (
    filters.tag
  ) {
    const recipeIds =
      await getTagRecipeIds(
        filters.tag,
      );


    recipes =
      filterByRecipeIds(
        recipes,
        recipeIds,
      );
  }


  const sortedRecipes =
    sortRecipes(
      recipes,
      filters.order,
    );


  return {
    recipes:
      sortedRecipes,

    total:
      sortedRecipes.length,
  };
}