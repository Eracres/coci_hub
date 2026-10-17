"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


export type SaveFoodCatalogItemInput = {
  foodItemId:
    string | null;

  name:
    string;

  slug:
    string;

  aliases:
    string[];

  allergenIds:
    string[];

  isActive:
    boolean;

  markAllergensReviewed:
    boolean;
};


export type SaveFoodCatalogItemResult =
  | {
      success:
        true;

      foodItemId:
        string;

      message:
        string;
    }
  | {
      success:
        false;

      message:
        string;
    };


function getFoodCatalogErrorMessage(
  error:
    unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error ===
            "object" &&
          error !==
            null &&
          "message" in
            error &&
          typeof (
            error as {
              message?:
                unknown;
            }
          ).message ===
            "string"
        ? (
            error as {
              message:
                string;
            }
          ).message
        : "";


  if (
    message.includes(
      "Food canonical name already exists",
    )
  ) {
    return "Ya existe un alimento con ese nombre canónico.";
  }


  if (
    message.includes(
      "Food slug already exists",
    )
  ) {
    return "Ya existe un alimento con ese slug.";
  }


  if (
    message.includes(
      "Food canonical name conflicts with an existing alias",
    )
  ) {
    return "Ese nombre ya está registrado como alias de otro alimento.";
  }


  if (
    message.includes(
      "Food alias conflicts with another canonical food",
    )
  ) {
    return "Uno de los alias coincide con el nombre canónico de otro alimento.";
  }


  if (
    message.includes(
      "Food alias already belongs to another food",
    )
  ) {
    return "Uno de los alias ya pertenece a otro alimento del catálogo.";
  }


  if (
    message.includes(
      "Food aliases contain duplicates",
    )
  ) {
    return "Hay alias duplicados.";
  }


  if (
    message.includes(
      "A food alias cannot duplicate its canonical name",
    )
  ) {
    return "El nombre canónico no debe repetirse también como alias.";
  }


  if (
    message.includes(
      "One or more allergens do not exist",
    )
  ) {
    return "Uno o varios alérgenos seleccionados ya no existen.";
  }


  if (
    message.includes(
      "Not authorized",
    )
  ) {
    return "No tienes permisos para modificar el catálogo de alimentos.";
  }


  return "No se pudo guardar el alimento del catálogo.";
}


export async function saveFoodCatalogItemAction(
  input:
    SaveFoodCatalogItemInput,
): Promise<SaveFoodCatalogItemResult> {
  const name =
    input.name.trim();

  const slug =
    input.slug.trim();

  const aliases =
    Array.from(
      new Set(
        input.aliases
          .map(
            (
              alias,
            ) =>
              alias.trim(),
          )
          .filter(
            Boolean,
          ),
      ),
    );

  const allergenIds =
    Array.from(
      new Set(
        input.allergenIds,
      ),
    );


  if (
    !name
  ) {
    return {
      success:
        false,

      message:
        "Indica el nombre canónico del alimento.",
    };
  }


  if (
    !slug
  ) {
    return {
      success:
        false,

      message:
        "Indica el slug del alimento.",
    };
  }


  const supabase =
    await createClient();


  const {
    data:
      isAdmin,

    error:
      adminError,
  } =
    await supabase.rpc(
      "is_admin",
    );


  if (
    adminError ||
    isAdmin !==
      true
  ) {
    return {
      success:
        false,

      message:
        "No tienes permisos para modificar el catálogo de alimentos.",
    };
  }


  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "admin_save_food_catalog_item",
        {
          p_name:
            name,

          p_slug:
            slug,

          p_aliases:
            aliases,

          p_allergen_ids:
            allergenIds,

          p_food_item_id:
            input.foodItemId,

          p_is_active:
            input.isActive,

          p_mark_allergens_reviewed:
            input.markAllergensReviewed,
        },
      );


    if (
      error
    ) {
      throw error;
    }


    if (
      typeof data !==
        "string" ||
      !data
    ) {
      throw new Error(
        "Food item id was not returned",
      );
    }


    revalidatePath(
      "/admin",
    );

    revalidatePath(
      "/admin/ingredients",
    );

    revalidatePath(
      "/admin/recipes",
    );


    return {
      success:
        true,

      foodItemId:
        data,

      message:
        input.foodItemId
          ? "Ingrediente actualizado correctamente."
          : "Ingrediente añadido al catálogo correctamente.",
    };

  } catch (
    error
  ) {
    console.error(
      "SAVE FOOD CATALOG ITEM ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getFoodCatalogErrorMessage(
          error,
        ),
    };
  }
}
