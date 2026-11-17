"use server";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  addRecipeComment,
  deleteRecipeComment,
  updateRecipeComment,
} from "@/services/recipes/recipe-comment-service";


export type RecipeCommentActionResult = {
  success:
    boolean;

  message:
    string;
};


function normalizeCommentBody(
  body:
    string,
) {
  return body.trim();
}


function validateCommentBody(
  body:
    string,
): string | null {
  if (
    body.length ===
    0
  ) {
    return "Escribe un comentario antes de publicarlo.";
  }


  if (
    body.length >
    2000
  ) {
    return "El comentario no puede superar los 2000 caracteres.";
  }


  return null;
}


function getCommentErrorMessage(
  error:
    unknown,
) {
  if (
    errorHasCode(
      error,
      "42501",
    )
  ) {
    return "No tienes permisos para realizar esta acción.";
  }


  if (
    errorHasCode(
      error,
      "P0002",
    )
  ) {
    return "No se encontró la receta, el comentario o tu perfil.";
  }


  if (
    errorHasCode(
      error,
      "22023",
    )
  ) {
    return "El comentario no es válido.";
  }


  return "No se pudo completar la operación.";
}


/* =========================================================
   ADD COMMENT
========================================================= */

export async function addRecipeCommentAction(
  recipeId:
    string,

  body:
    string,
): Promise<RecipeCommentActionResult> {
  const normalizedBody =
    normalizeCommentBody(
      body,
    );


  const validationError =
    validateCommentBody(
      normalizedBody,
    );


  if (
    validationError
  ) {
    return {
      success:
        false,

      message:
        validationError,
    };
  }


  try {
    await addRecipeComment(
      recipeId,
      normalizedBody,
    );


    return {
      success:
        true,

      message:
        "Comentario publicado.",
    };

  } catch (
    error
  ) {
    console.error(
      "ADD RECIPE COMMENT ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getCommentErrorMessage(
          error,
        ),
    };
  }
}


/* =========================================================
   UPDATE COMMENT
========================================================= */

export async function updateRecipeCommentAction(
  commentId:
    string,

  body:
    string,
): Promise<RecipeCommentActionResult> {
  const normalizedBody =
    normalizeCommentBody(
      body,
    );


  const validationError =
    validateCommentBody(
      normalizedBody,
    );


  if (
    validationError
  ) {
    return {
      success:
        false,

      message:
        validationError,
    };
  }


  try {
    await updateRecipeComment(
      commentId,
      normalizedBody,
    );


    return {
      success:
        true,

      message:
        "Comentario actualizado.",
    };

  } catch (
    error
  ) {
    console.error(
      "UPDATE RECIPE COMMENT ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getCommentErrorMessage(
          error,
        ),
    };
  }
}


/* =========================================================
   DELETE COMMENT
========================================================= */

export async function deleteRecipeCommentAction(
  commentId:
    string,
): Promise<RecipeCommentActionResult> {
  try {
    await deleteRecipeComment(
      commentId,
    );


    return {
      success:
        true,

      message:
        "Comentario eliminado.",
    };

  } catch (
    error
  ) {
    console.error(
      "DELETE RECIPE COMMENT ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        getCommentErrorMessage(
          error,
        ),
    };
  }
}
