"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  deleteAdminRecipeComment,
  setAdminRecipeCommentHidden,
} from "@/services/recipes/admin-recipe-comment-service";


export type AdminCommentActionResult = {
  success:
    boolean;

  warning?:
    boolean;

  message:
    string;
};


function getAdminCommentErrorMessage(
  error:
    unknown,
) {
  if (
    errorHasCode(
      error,
      "42501",
    )
  ) {
    return "No tienes permisos para moderar comentarios.";
  }


  if (
    errorHasCode(
      error,
      "P0002",
    )
  ) {
    return "El comentario ya no existe.";
  }


  return "No se pudo completar la operación.";
}


function revalidateCommentPaths(
  recipeSlug:
    string,
) {
  revalidatePath(
    "/admin/comments",
  );


  if (
    recipeSlug
  ) {
    revalidatePath(
      `/recipes/${recipeSlug}`,
    );
  }
}


/* =========================================================
   HIDE / RESTORE
========================================================= */

export async function setAdminRecipeCommentHiddenAction(
  commentId:
    string,

  hidden:
    boolean,

  recipeSlug:
    string,
): Promise<AdminCommentActionResult> {
  if (
    !commentId.trim()
  ) {
    return {
      success:
        false,

      message:
        "El comentario no es válido.",
    };
  }


  try {
    await setAdminRecipeCommentHidden(
      commentId,
      hidden,
    );


    revalidateCommentPaths(
      recipeSlug,
    );


    return {
      success:
        true,

      message:
        hidden
          ? "Comentario ocultado."
          : "Comentario restaurado.",
    };

  } catch (
    error
  ) {
    console.error(
      "SET ADMIN RECIPE COMMENT HIDDEN ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getAdminCommentErrorMessage(
          error,
        ),
    };
  }
}


/* =========================================================
   DELETE
========================================================= */

export async function deleteAdminRecipeCommentAction(
  commentId:
    string,

  recipeSlug:
    string,
): Promise<AdminCommentActionResult> {
  if (
    !commentId.trim()
  ) {
    return {
      success:
        false,

      message:
        "El comentario no es válido.",
    };
  }


  try {
    const result =
      await deleteAdminRecipeComment(
        commentId,
      );


    revalidateCommentPaths(
      recipeSlug,
    );


    if (
      result.storageCleanupFailed
    ) {
      return {
        success:
          true,

        warning:
          true,

        message:
          result.deletedImageCount ===
          1
            ? "Comentario eliminado, pero no se pudo limpiar su imagen de Storage."
            : `Comentario eliminado, pero no se pudieron limpiar sus ${result.deletedImageCount} imágenes de Storage.`,
      };
    }


    return {
      success:
        true,

      warning:
        false,

      message:
        result.deletedImageCount >
        0
          ? "Comentario e imágenes eliminados definitivamente."
          : "Comentario eliminado definitivamente.",
    };

  } catch (
    error
  ) {
    console.error(
      "DELETE ADMIN RECIPE COMMENT ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getAdminCommentErrorMessage(
          error,
        ),
    };
  }
}