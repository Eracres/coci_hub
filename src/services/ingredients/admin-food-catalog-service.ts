import {
  createClient,
} from "@/lib/supabase/server";


export type AdminFoodCatalogItem = {
  id:
    string;

  name:
    string;

  slug:
    string;

  isActive:
    boolean;

  allergenReviewedAt:
    string | null;

  updatedAt:
    string;

  aliases:
    string[];

  allergenIds:
    string[];
};


export type AdminFoodAllergenOption = {
  id:
    string;

  name:
    string;

  slug:
    string;

  position:
    number;
};


export type AdminFoodCatalogData = {
  items:
    AdminFoodCatalogItem[];

  allergens:
    AdminFoodAllergenOption[];
};


export async function getAdminFoodCatalogData(): Promise<AdminFoodCatalogData> {
  const supabase =
    await createClient();


  const [
    foodItemsResult,
    aliasesResult,
    foodAllergensResult,
    allergensResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "food_items",
        )
        .select(`
          id,
          name,
          slug,
          is_active,
          allergen_reviewed_at,
          updated_at
        `)
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "food_aliases",
        )
        .select(`
          food_item_id,
          alias
        `)
        .order(
          "alias",
          {
            ascending:
              true,
          },
        ),

      supabase
        .from(
          "food_allergens",
        )
        .select(`
          food_item_id,
          allergen_id
        `),

      supabase
        .from(
          "allergens",
        )
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
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),
    ]);


  if (
    foodItemsResult.error
  ) {
    throw new Error(
      `No se pudo cargar el catálogo de alimentos: ${foodItemsResult.error.message}`,
    );
  }


  if (
    aliasesResult.error
  ) {
    throw new Error(
      `No se pudieron cargar los alias del catálogo: ${aliasesResult.error.message}`,
    );
  }


  if (
    foodAllergensResult.error
  ) {
    throw new Error(
      `No se pudieron cargar las relaciones de alérgenos: ${foodAllergensResult.error.message}`,
    );
  }


  if (
    allergensResult.error
  ) {
    throw new Error(
      `No se pudo cargar el catálogo de alérgenos: ${allergensResult.error.message}`,
    );
  }


  const aliasesByFoodItem =
    new Map<
      string,
      string[]
    >();


  for (
    const aliasRow
    of aliasesResult.data ??
      []
  ) {
    const current =
      aliasesByFoodItem.get(
        aliasRow.food_item_id,
      ) ??
      [];


    current.push(
      aliasRow.alias,
    );


    aliasesByFoodItem.set(
      aliasRow.food_item_id,
      current,
    );
  }


  const allergensByFoodItem =
    new Map<
      string,
      string[]
    >();


  for (
    const relation
    of foodAllergensResult.data ??
      []
  ) {
    const current =
      allergensByFoodItem.get(
        relation.food_item_id,
      ) ??
      [];


    current.push(
      relation.allergen_id,
    );


    allergensByFoodItem.set(
      relation.food_item_id,
      current,
    );
  }


  const items:
    AdminFoodCatalogItem[] =
      (
        foodItemsResult.data ??
        []
      ).map(
        (
          food,
        ) => ({
          id:
            food.id,

          name:
            food.name,

          slug:
            food.slug,

          isActive:
            food.is_active ===
            true,

          allergenReviewedAt:
            food.allergen_reviewed_at,

          updatedAt:
            food.updated_at,

          aliases:
            aliasesByFoodItem.get(
              food.id,
            ) ??
            [],

          allergenIds:
            allergensByFoodItem.get(
              food.id,
            ) ??
            [],
        }),
      );


  const allergens:
    AdminFoodAllergenOption[] =
      (
        allergensResult.data ??
        []
      ).map(
        (
          allergen,
        ) => ({
          id:
            allergen.id,

          name:
            allergen.name,

          slug:
            allergen.slug,

          position:
            allergen.position,
        }),
      );


  return {
    items,
    allergens,
  };
}
