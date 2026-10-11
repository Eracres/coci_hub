"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  getAppOrigin,
} from "@/lib/auth/email-confirmation";

import {
  sendRecipeApprovedToAuthorNotification,
  sendRecipeReturnedToAuthorNotification,
} from "@/lib/email/recipe-notifications";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  createClient,
} from "@/lib/supabase/server";


export type RecipeReviewActionResult = {
  success:
    boolean;

  message?:
    string;
};


type RecipeNotificationContext = {
  recipe_id:
    string;

  recipe_title:
    string;

  recipe_slug:
    string;

  author_id:
    string;

  author_email:
    string | null;

  author_display_name:
    string | null;

  author_username:
    string | null;
};


/* =========================================================
   REVALIDATION
========================================================= */

function revalidateReviewPaths(
  recipeId:
    string,
) {
  revalidatePath(
    "/admin/recipes",
  );


  revalidatePath(
    `/admin/recipes/${recipeId}/edit`,
  );


  revalidatePath(
    `/admin/recipes/${recipeId}/preview`,
  );


  revalidatePath(
    "/mi-cocihub",
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    "/recipes",
  );
}


/* =========================================================
   ERROR MAPPING
========================================================= */

function getReviewErrorMessage(
  error:
    unknown,

  fallback:
    string,
) {
  if (
    errorHasCode(
      error,
      "42501",
    )
  ) {
    return "No tienes permisos para moderar esta receta.";
  }


  if (
    errorHasCode(
      error,
      "P0002",
    )
  ) {
    return "La receta ya no existe.";
  }


  if (
    errorHasCode(
      error,
      "22023",
    )
  ) {
    return "La receta ya no se encuentra pendiente de revisión o los datos enviados no son válidos.";
  }


  return fallback;
}


/* =========================================================
   NOTIFICATION CONTEXT
========================================================= */

async function getRecipeNotificationContext(
  recipeId:
    string,
): Promise<
  RecipeNotificationContext
> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .rpc(
        "get_recipe_notification_context",
        {
          p_recipe_id:
            recipeId,
        },
      )
      .single();


  if (
    error ||
    !data
  ) {
    throw new Error(
      `Could not obtain recipe notification context: ${
        error?.message ??
        "recipe context not found"
      }`,
    );
  }


  return (
    data as
      RecipeNotificationContext
  );
}


/* =========================================================
   NOTIFY AUTHOR: RETURNED
========================================================= */

async function notifyAuthorAboutReturnedRecipe(
  recipeId:
    string,

  reviewNotes:
    string,
) {
  const context =
    await getRecipeNotificationContext(
      recipeId,
    );


  if (
    !context.author_email
  ) {
    throw new Error(
      "Recipe author does not have an email address.",
    );
  }


  const origin =
    await getAppOrigin();


  await sendRecipeReturnedToAuthorNotification({
    authorEmail:
      context.author_email,

    authorDisplayName:
      context.author_display_name ??
      context.author_username ??
      "cocinero de CociHub",

    recipeTitle:
      context.recipe_title,

    reviewNotes,

    editRecipeUrl:
      `${origin}/mi-cocihub/recetas/${recipeId}/editar`,
  });
}


/* =========================================================
   NOTIFY AUTHOR: APPROVED
========================================================= */

async function notifyAuthorAboutApprovedRecipe(
  recipeId:
    string,
) {
  const context =
    await getRecipeNotificationContext(
      recipeId,
    );


  if (
    !context.author_email
  ) {
    throw new Error(
      "Recipe author does not have an email address.",
    );
  }


  const origin =
    await getAppOrigin();


  await sendRecipeApprovedToAuthorNotification({
    authorEmail:
      context.author_email,

    authorDisplayName:
      context.author_display_name ??
      context.author_username ??
      "cocinero de CociHub",

    recipeTitle:
      context.recipe_title,

    publicRecipeUrl:
      `${origin}/recipes/${context.recipe_slug}`,
  });
}


/* =========================================================
   APPROVE
========================================================= */

export async function approveRecipeReviewAction(
  recipeId:
    string,
): Promise<
  RecipeReviewActionResult
> {
  const supabase =
    await createClient();


  try {
    const {
      error,
    } =
      await supabase.rpc(
        "approve_recipe_review",
        {
          p_recipe_id:
            recipeId,
        },
      );


    if (
      error
    ) {
      throw error;
    }

  } catch (
    error
  ) {
    console.error(
      "APPROVE RECIPE REVIEW ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getReviewErrorMessage(
          error,
          "No se pudo aprobar la receta.",
        ),
    };
  }


  /*
   * Email is intentionally outside the moderation
   * operation. A delivery failure must never undo or
   * invalidate an already approved recipe.
   */

  try {
    await notifyAuthorAboutApprovedRecipe(
      recipeId,
    );
  } catch (
    notificationError
  ) {
    console.error(
      "RECIPE APPROVED AUTHOR EMAIL ERROR:",
      notificationError,
    );
  }


  revalidateReviewPaths(
    recipeId,
  );


  return {
    success:
      true,

    message:
      "Receta aprobada y publicada correctamente.",
  };
}


/* =========================================================
   RETURN FOR CHANGES
========================================================= */

export async function returnRecipeReviewAction(
  recipeId:
    string,

  reviewNotes:
    string,
): Promise<
  RecipeReviewActionResult
> {
  const normalizedNotes =
    reviewNotes.trim();


  if (
    normalizedNotes.length ===
    0
  ) {
    return {
      success:
        false,

      message:
        "Debes indicar al autor qué cambios necesita realizar.",
    };
  }


  if (
    normalizedNotes.length >
    1500
  ) {
    return {
      success:
        false,

      message:
        "Las observaciones no pueden superar los 1500 caracteres.",
    };
  }


  const supabase =
    await createClient();


  try {
    const {
      error,
    } =
      await supabase.rpc(
        "return_recipe_review",
        {
          p_recipe_id:
            recipeId,

          p_review_notes:
            normalizedNotes,
        },
      );


    if (
      error
    ) {
      throw error;
    }

  } catch (
    error
  ) {
    console.error(
      "RETURN RECIPE REVIEW ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getReviewErrorMessage(
          error,
          "No se pudo devolver la receta.",
        ),
    };
  }


  /*
   * Same rule as approval:
   *
   * the database operation has already succeeded.
   * Email delivery is best-effort and cannot revert it.
   */

  try {
    await notifyAuthorAboutReturnedRecipe(
      recipeId,
      normalizedNotes,
    );
  } catch (
    notificationError
  ) {
    console.error(
      "RECIPE RETURNED AUTHOR EMAIL ERROR:",
      notificationError,
    );
  }


  revalidateReviewPaths(
    recipeId,
  );


  return {
    success:
      true,

    message:
      "La receta ha sido devuelta al autor con las observaciones indicadas.",
  };
}