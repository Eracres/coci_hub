"use server";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  addRecipeComment,
  createRecipeCommentImageUpload,
  deleteRecipeComment,
  removeRecipeCommentImages,
  setRecipeCommentImages,
  updateRecipeComment,
} from "@/services/recipes/recipe-comment-service";


export type RecipeCommentActionResult = {
  success:
    boolean;

  message:
    string;

  commentId?:
    string;
};


export type RecipeCommentImageUploadActionResult = {
  success:
    boolean;

  message:
    string;

  path?:
    string;

  token?:
    string;
};


const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


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
    return "Los datos enviados no son válidos.";
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
    const commentId =
      await addRecipeComment(
        recipeId,
        normalizedBody,
      );


    return {
      success:
        true,

      message:
        "Comentario publicado.",

      commentId,
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
   CREATE SIGNED IMAGE UPLOAD
========================================================= */

export async function createRecipeCommentImageUploadAction(
  commentId:
    string,

  mimeType:
    string,
): Promise<RecipeCommentImageUploadActionResult> {
  const normalizedCommentId =
    commentId.trim();


  if (
    !normalizedCommentId
  ) {
    return {
      success:
        false,

      message:
        "El comentario no es válido.",
    };
  }


  if (
    !ALLOWED_IMAGE_TYPES.has(
      mimeType,
    )
  ) {
    return {
      success:
        false,

      message:
        "La foto debe ser JPG, PNG o WebP.",
    };
  }


  try {
    const upload =
      await createRecipeCommentImageUpload(
        normalizedCommentId,
        mimeType,
      );


    return {
      success:
        true,

      message:
        "Subida preparada.",

      path:
        upload.path,

      token:
        upload.token,
    };

  } catch (
    error
  ) {
    console.error(
      "CREATE RECIPE COMMENT IMAGE UPLOAD ERROR:",
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
   REMOVE COMMENT IMAGES
========================================================= */

export async function removeRecipeCommentImagesAction(
  imagePaths:
    string[],
): Promise<RecipeCommentActionResult> {
  const normalizedImagePaths =
    imagePaths
      .map(
        (
          imagePath,
        ) =>
          imagePath.trim(),
      )
      .filter(
        Boolean,
      );


  if (
    normalizedImagePaths.length ===
    0
  ) {
    return {
      success:
        true,

      message:
        "No hay fotos que eliminar.",
    };
  }


  if (
    normalizedImagePaths.length >
    3
  ) {
    return {
      success:
        false,

      message:
        "La petición contiene demasiadas fotos.",
    };
  }


  try {
    await removeRecipeCommentImages(
      normalizedImagePaths,
    );


    return {
      success:
        true,

      message:
        "Fotos eliminadas.",
    };

  } catch (
    error
  ) {
    console.error(
      "REMOVE RECIPE COMMENT IMAGES ERROR:",
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
   SET COMMENT IMAGES
========================================================= */

export async function setRecipeCommentImagesAction(
  commentId:
    string,

  imagePaths:
    string[],
): Promise<RecipeCommentActionResult> {
  const normalizedCommentId =
    commentId.trim();


  if (
    !normalizedCommentId
  ) {
    return {
      success:
        false,

      message:
        "El comentario no es válido.",
    };
  }


  if (
    imagePaths.length >
    3
  ) {
    return {
      success:
        false,

      message:
        "Puedes adjuntar un máximo de 3 fotos.",
    };
  }


  const normalizedImagePaths =
    imagePaths.map(
      (
        imagePath,
      ) =>
        imagePath.trim(),
    );


  if (
    normalizedImagePaths.some(
      (
        imagePath,
      ) =>
        imagePath.length ===
        0,
    )
  ) {
    return {
      success:
        false,

      message:
        "Una de las imágenes no es válida.",
    };
  }


  if (
    new Set(
      normalizedImagePaths,
    ).size !==
    normalizedImagePaths.length
  ) {
    return {
      success:
        false,

      message:
        "Hay imágenes duplicadas.",
    };
  }


  try {
    await setRecipeCommentImages(
      normalizedCommentId,
      normalizedImagePaths,
    );


    return {
      success:
        true,

      message:
        "Fotos guardadas.",
    };

  } catch (
    error
  ) {
    console.error(
      "SET RECIPE COMMENT IMAGES ERROR:",
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