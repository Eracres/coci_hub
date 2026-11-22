"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


function getRecipeId(
  formData:
    FormData,
) {
  const value =
    formData.get(
      "recipeId",
    );


  if (
    typeof value !==
      "string"
  ) {
    return null;
  }


  const recipeId =
    value.trim();


  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      recipeId,
    )
  ) {
    return null;
  }


  return recipeId;
}


export async function reopenPublishedRecipeForEditing(
  formData:
    FormData,
) {
  const recipeId =
    getRecipeId(
      formData,
    );


  if (
    !recipeId
  ) {
    redirect(
      "/mi-cocihub/recetas?error=invalid-recipe",
    );
  }


  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "reopen_my_published_recipe_for_editing",
      {
        p_recipe_id:
          recipeId,
      },
    );


  if (
    error
  ) {
    console.error(
      "REOPEN PUBLISHED COMMUNITY RECIPE ERROR:",
      error,
    );


    redirect(
      "/mi-cocihub/recetas?error=reopen-failed",
    );
  }


  revalidatePath(
    "/mi-cocihub",
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    `/recipes`,
  );


  redirect(
    `/mi-cocihub/recetas/${recipeId}/editar`,
  );
}
