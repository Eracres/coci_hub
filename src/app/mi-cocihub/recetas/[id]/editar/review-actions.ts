"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  getAppOrigin,
} from "@/lib/auth/email-confirmation";

import {
  sendRecipeSubmittedToAdminNotification,
} from "@/lib/email/recipe-notifications";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  createClient,
} from "@/lib/supabase/server";


export type SubmitRecipeReviewResult = {
  success:
    boolean;

  message?:
    string;
};


/* =========================================================
   NOTIFY ADMIN
========================================================= */

async function notifyAdminAboutSubmittedRecipe(
  recipeId:
    string,

  userId:
    string,
) {
  const supabase =
    await createClient();


  const [
    {
      data:
        recipe,

      error:
        recipeError,
    },

    {
      data:
        profile,

      error:
        profileError,
    },
  ] =
    await Promise.all([
      supabase
        .from(
          "recipes",
        )
        .select(
          "id, title",
        )
        .eq(
          "id",
          recipeId,
        )
        .eq(
          "author_id",
          userId,
        )
        .single(),

      supabase
        .from(
          "profiles",
        )
        .select(
          "display_name, username",
        )
        .eq(
          "id",
          userId,
        )
        .single(),
    ]);


  if (
    recipeError ||
    !recipe
  ) {
    throw new Error(
      `Could not load submitted recipe for email notification: ${
        recipeError?.message ??
        "recipe not found"
      }`,
    );
  }


  if (
    profileError ||
    !profile
  ) {
    throw new Error(
      `Could not load recipe author for email notification: ${
        profileError?.message ??
        "profile not found"
      }`,
    );
  }


  const origin =
    await getAppOrigin();


  await sendRecipeSubmittedToAdminNotification({
    recipeId,

    recipeTitle:
      recipe.title,

    authorDisplayName:
      profile.display_name ??
      profile.username ??
      "Usuario de CociHub",

    authorUsername:
      profile.username,

    adminRecipeUrl:
      `${origin}/admin/recipes/${recipeId}/edit`,
  });
}


/* =========================================================
   SUBMIT COMMUNITY RECIPE FOR REVIEW
========================================================= */

export async function submitMyRecipeForReviewAction(
  recipeId:
    string,
): Promise<
  SubmitRecipeReviewResult
> {
  const supabase =
    await createClient();


  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase
      .auth
      .getClaims();


  const userId =
    claimsData
      ?.claims
      ?.sub;


  if (
    claimsError ||
    !userId
  ) {
    return {
      success:
        false,

      message:
        "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }


  const {
    error,
  } =
    await supabase.rpc(
      "submit_my_recipe_for_review",
      {
        p_recipe_id:
          recipeId,
      },
    );


  if (
    error
  ) {
    if (
      errorHasCode(
        error,
        "42501",
      )
    ) {
      return {
        success:
          false,

        message:
          "No tienes permiso para enviar esta receta a revisión.",
      };
    }


    if (
      errorHasCode(
        error,
        "P0002",
      )
    ) {
      return {
        success:
          false,

        message:
          "No se encontró la receta.",
      };
    }


    if (
      errorHasCode(
        error,
        "22023",
      )
    ) {
      return {
        success:
          false,

        message:
          "La receta todavía no cumple todos los requisitos para enviarse a revisión.",
      };
    }


    console.error(
      "SUBMIT COMMUNITY RECIPE REVIEW ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo enviar la receta a revisión.",
    };
  }


  /*
   * El correo NO forma parte de la operación funcional.
   *
   * Si falla Resend, la receta debe seguir correctamente
   * enviada a revisión.
   */

  try {
    await notifyAdminAboutSubmittedRecipe(
      recipeId,
      userId,
    );
  } catch (
    notificationError
  ) {
    console.error(
      "RECIPE REVIEW ADMIN EMAIL ERROR:",
      notificationError,
    );
  }


  revalidatePath(
    `/mi-cocihub/recetas/${recipeId}/editar`,
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    "/mi-cocihub",
  );


  return {
    success:
      true,

    message:
      "La receta se ha enviado a revisión.",
  };
}