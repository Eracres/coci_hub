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

  submissionType:
    | "new"
    | "resubmission",
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

    submissionType,
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


  // =======================================================
  // DETECT FIRST SUBMISSION OR RESUBMISSION
  // =======================================================
  //
  // submit_my_recipe_for_review() clears review_notes.
  //
  // Therefore we must inspect them BEFORE calling the RPC.
  //
  // If review_notes contains data, the draft came from
  // a previous moderation return and is being submitted
  // again after corrections.
  // =======================================================

  const {
    data:
      recipeBeforeSubmission,

    error:
      recipeBeforeSubmissionError,
  } =
    await supabase
      .from(
        "recipes",
      )
      .select(
        "review_notes",
      )
      .eq(
        "id",
        recipeId,
      )
      .eq(
        "author_id",
        userId,
      )
      .maybeSingle();


  if (
    recipeBeforeSubmissionError
  ) {
    console.error(
      "GET RECIPE REVIEW HISTORY ERROR:",
      recipeBeforeSubmissionError,
    );
  }


  const submissionType:
    | "new"
    | "resubmission" =
      recipeBeforeSubmission
        ?.review_notes
        ?.trim()
        ? "resubmission"
        : "new";


  // =======================================================
  // SUBMIT RECIPE
  // =======================================================

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


  // =======================================================
  // ADMIN NOTIFICATION
  // =======================================================
  //
  // Email delivery is intentionally independent from the
  // functional state change.
  //
  // If Resend fails, the recipe must remain correctly
  // submitted for review.
  // =======================================================

  try {
    await notifyAdminAboutSubmittedRecipe(
      recipeId,
      userId,
      submissionType,
    );

  } catch (
    notificationError
  ) {
    console.error(
      "RECIPE REVIEW ADMIN EMAIL ERROR:",
      notificationError,
    );
  }


  // =======================================================
  // CACHE
  // =======================================================

  revalidatePath(
    `/mi-cocihub/recetas/${recipeId}/editar`,
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    "/mi-cocihub",
  );


  // =======================================================
  // RESULT
  // =======================================================

  return {
    success:
      true,

    message:
      submissionType ===
        "resubmission"
        ? "La receta corregida se ha enviado de nuevo a revisión."
        : "La receta se ha enviado a revisión.",
  };
}