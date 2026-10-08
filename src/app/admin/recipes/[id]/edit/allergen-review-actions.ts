"use server";

import {
  createClient,
} from "@/lib/supabase/server";


export type AdminAllergenPresence =
  | "present"
  | "possible";


export type AdminRecipeAllergenReviewRow = {
  allergenId:
    string;

  presence:
    AdminAllergenPresence;

  manualPresence:
    AdminAllergenPresence | null;

  detectedPresent:
    boolean;
};


export type GetRecipeAllergenReviewStateResult =
  | {
      success:
        true;

      rows:
        AdminRecipeAllergenReviewRow[];
    }
  | {
      success:
        false;

      rows:
        [];

      message:
        string;
    };


export async function getRecipeAllergenReviewStateAction(
  recipeId:
    string,
): Promise<GetRecipeAllergenReviewStateResult> {
  const supabase =
    await createClient();


  /* =====================================================
     ADMIN CHECK
  ===================================================== */

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

      rows:
        [],

      message:
        "No tienes permisos para revisar los alérgenos de esta receta.",
    };
  }


  /* =====================================================
     ALLERGEN EVIDENCE
  ===================================================== */

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
        presence,
        manual_presence,
        detected_present
      `)
      .eq(
        "recipe_id",
        recipeId,
      );


  if (
    error
  ) {
    console.error(
      "GET RECIPE ALLERGEN REVIEW STATE ERROR:",
      error,
    );


    return {
      success:
        false,

      rows:
        [],

      message:
        "No se pudo obtener el estado detallado de los alérgenos.",
    };
  }


  const rows:
    AdminRecipeAllergenReviewRow[] =
      (
        data ??
        []
      ).map(
        (
          row,
        ) => ({
          allergenId:
            row.allergen_id,

          presence:
            row.presence as AdminAllergenPresence,

          manualPresence:
            row.manual_presence as
              | AdminAllergenPresence
              | null,

          detectedPresent:
            row.detected_present ===
            true,
        }),
      );


  return {
    success:
      true,

    rows,
  };
}
