"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  communityRecipeImageSchema,
} from "@/schemas/community-recipe-image-schema";


const RECIPE_IMAGES_BUCKET =
  "recipe-images";


const MAX_IMAGE_SIZE =
  5 *
  1024 *
  1024;


type ImageKind = {
  extension:
    "jpg" | "png" | "webp";

  contentType:
    "image/jpeg" |
    "image/png" |
    "image/webp";
};


export type RecipeImageActionResult = {
  success:
    boolean;

  message?:
    string;

  fieldErrors?: {
    imageAlt?:
      string[];
  };
};


type EditableRecipeImageRow = {
  id:
    string;

  status:
    string;

  image_path:
    string | null;

  image_alt:
    string | null;
};


/* =========================================================
   DETECT REAL IMAGE TYPE
========================================================= */

async function detectImageKind(
  file:
    File,
): Promise<
  ImageKind | null
> {
  const bytes =
    new Uint8Array(
      await file
        .slice(
          0,
          12,
        )
        .arrayBuffer(),
    );


  // JPEG

  if (
    bytes.length >=
      3 &&
    bytes[0] ===
      0xff &&
    bytes[1] ===
      0xd8 &&
    bytes[2] ===
      0xff
  ) {
    return {
      extension:
        "jpg",

      contentType:
        "image/jpeg",
    };
  }


  // PNG

  if (
    bytes.length >=
      8 &&
    bytes[0] ===
      0x89 &&
    bytes[1] ===
      0x50 &&
    bytes[2] ===
      0x4e &&
    bytes[3] ===
      0x47 &&
    bytes[4] ===
      0x0d &&
    bytes[5] ===
      0x0a &&
    bytes[6] ===
      0x1a &&
    bytes[7] ===
      0x0a
  ) {
    return {
      extension:
        "png",

      contentType:
        "image/png",
    };
  }


  // WEBP:
  // RIFF....WEBP

  if (
    bytes.length >=
      12 &&
    bytes[0] ===
      0x52 &&
    bytes[1] ===
      0x49 &&
    bytes[2] ===
      0x46 &&
    bytes[3] ===
      0x46 &&
    bytes[8] ===
      0x57 &&
    bytes[9] ===
      0x45 &&
    bytes[10] ===
      0x42 &&
    bytes[11] ===
      0x50
  ) {
    return {
      extension:
        "webp",

      contentType:
        "image/webp",
    };
  }


  return null;
}


/* =========================================================
   LOAD EDITABLE RECIPE
========================================================= */

async function getEditableRecipe(
  recipeId:
    string,
) {
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
      supabase,
      recipe:
        null,
      error:
        "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "recipes",
      )
      .select(`
        id,
        status,
        image_path,
        image_alt
      `)
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
    error
  ) {
    console.error(
      "GET COMMUNITY RECIPE IMAGE ERROR:",
      error,
    );


    return {
      supabase,
      recipe:
        null,
      error:
        "No se pudo comprobar la receta.",
    };
  }


  const recipe =
    data as
      EditableRecipeImageRow | null;


  if (
    !recipe
  ) {
    return {
      supabase,
      recipe:
        null,
      error:
        "No se encontró la receta.",
    };
  }


  if (
    recipe.status !==
    "draft"
  ) {
    return {
      supabase,
      recipe:
        null,
      error:
        "Esta receta ya no puede editarse.",
    };
  }


  return {
    supabase,
    recipe,
    error:
      null,
  };
}


/* =========================================================
   REVALIDATE
========================================================= */

function revalidateRecipeImagePaths(
  recipeId:
    string,
) {
  revalidatePath(
    `/mi-cocihub/recetas/${recipeId}/editar`,
  );


  revalidatePath(
    "/mi-cocihub/recetas",
  );


  revalidatePath(
    "/mi-cocihub",
  );
}


/* =========================================================
   SAVE IMAGE
========================================================= */

export async function saveMyRecipeImageAction(
  recipeId:
    string,

  formData:
    FormData,
): Promise<
  RecipeImageActionResult
> {
  const imageAltValue =
    String(
      formData.get(
        "imageAlt",
      ) ??
      "",
    );


  const validation =
    communityRecipeImageSchema.safeParse({
      imageAlt:
        imageAltValue,
    });


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      fieldErrors:
        validation.error
          .flatten()
          .fieldErrors,
    };
  }


  const {
    supabase,
    recipe,
    error:
      recipeError,
  } =
    await getEditableRecipe(
      recipeId,
    );


  if (
    recipeError ||
    !recipe
  ) {
    return {
      success:
        false,

      message:
        recipeError ??
        "No se pudo comprobar la receta.",
    };
  }


  const entry =
    formData.get(
      "file",
    );


  const file =
    entry instanceof
      File &&
    entry.size >
      0
      ? entry
      : null;


  /*
   * Si no hay archivo nuevo,
   * conservamos la imagen actual
   * y únicamente actualizamos ALT.
   */

  if (
    !file
  ) {
    if (
      !recipe.image_path
    ) {
      return {
        success:
          false,

        message:
          "Selecciona una imagen antes de continuar.",
      };
    }


    const {
      error,
    } =
      await supabase.rpc(
        "update_my_recipe_image",
        {
          p_recipe_id:
            recipeId,

          p_image_path:
            recipe.image_path,

          p_image_alt:
            validation.data
              .imageAlt,
        },
      );


    if (
      error
    ) {
      console.error(
        "UPDATE COMMUNITY IMAGE ALT ERROR:",
        error,
      );


      return {
        success:
          false,

        message:
          "No se pudo guardar el texto alternativo de la imagen.",
      };
    }


    revalidateRecipeImagePaths(
      recipeId,
    );


    return {
      success:
        true,

      message:
        "Imagen guardada correctamente.",
    };
  }


  // =======================================================
  // FILE VALIDATION
  // =======================================================

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    return {
      success:
        false,

      message:
        "La imagen supera el límite máximo de 5 MB.",
    };
  }


  const imageKind =
    await detectImageKind(
      file,
    );


  if (
    !imageKind
  ) {
    return {
      success:
        false,

      message:
        "Formato no válido. Utiliza una imagen JPG, PNG o WebP.",
    };
  }


  const previousPath =
    recipe.image_path;


  const newPath =
    `recipes/${recipeId}/main.${imageKind.extension}`;


  // =======================================================
  // STORAGE UPLOAD
  // =======================================================

  const {
    error:
      uploadError,
  } =
    await supabase
      .storage
      .from(
        RECIPE_IMAGES_BUCKET,
      )
      .upload(
        newPath,
        file,
        {
          upsert:
            true,

          contentType:
            imageKind
              .contentType,

          cacheControl:
            "3600",
        },
      );


  if (
    uploadError
  ) {
    console.error(
      "COMMUNITY IMAGE UPLOAD ERROR:",
      uploadError,
    );


    return {
      success:
        false,

      message:
        "No se pudo subir la imagen.",
    };
  }


  // =======================================================
  // DATABASE
  // =======================================================

  const {
    error:
      databaseError,
  } =
    await supabase.rpc(
      "update_my_recipe_image",
      {
        p_recipe_id:
          recipeId,

        p_image_path:
          newPath,

        p_image_alt:
          validation.data
            .imageAlt,
      },
    );


  if (
    databaseError
  ) {
    console.error(
      "UPDATE COMMUNITY IMAGE ERROR:",
      databaseError,
    );


    /*
     * Si la extensión era distinta,
     * este objeto acaba de crearse.
     * Lo limpiamos para no dejar basura.
     */

    if (
      newPath !==
      previousPath
    ) {
      await supabase
        .storage
        .from(
          RECIPE_IMAGES_BUCKET,
        )
        .remove([
          newPath,
        ]);
    }


    return {
      success:
        false,

      message:
        "La imagen se subió, pero no pudo vincularse correctamente a la receta.",
    };
  }


  // =======================================================
  // OLD FILE CLEANUP
  // =======================================================

  let cleanupWarning =
    false;


  if (
    previousPath &&
    previousPath !==
      newPath
  ) {
    const {
      error:
        cleanupError,
    } =
      await supabase
        .storage
        .from(
          RECIPE_IMAGES_BUCKET,
        )
        .remove([
          previousPath,
        ]);


    if (
      cleanupError
    ) {
      cleanupWarning =
        true;


      console.error(
        "OLD COMMUNITY IMAGE CLEANUP ERROR:",
        cleanupError,
      );
    }
  }


  revalidateRecipeImagePaths(
    recipeId,
  );


  return {
    success:
      true,

    message:
      cleanupWarning
        ? "La imagen se guardó correctamente, aunque no se pudo limpiar el archivo anterior."
        : "Imagen guardada correctamente.",
  };
}


/* =========================================================
   DELETE IMAGE
========================================================= */

export async function deleteMyRecipeImageAction(
  recipeId:
    string,
): Promise<
  RecipeImageActionResult
> {
  const {
    supabase,
    recipe,
    error:
      recipeError,
  } =
    await getEditableRecipe(
      recipeId,
    );


  if (
    recipeError ||
    !recipe
  ) {
    return {
      success:
        false,

      message:
        recipeError ??
        "No se pudo comprobar la receta.",
    };
  }


  if (
    !recipe.image_path
  ) {
    return {
      success:
        true,

      message:
        "La receta ya no tiene imagen.",
    };
  }


  const pathToDelete =
    recipe.image_path;


  /*
   * Primero desligamos PostgreSQL.
   * Así la receta nunca queda apuntando
   * intencionadamente a un objeto eliminado.
   */

  const {
    error:
      databaseError,
  } =
    await supabase.rpc(
      "update_my_recipe_image",
      {
        p_recipe_id:
          recipeId,

        p_image_path:
          null,

        p_image_alt:
          null,
      },
    );


  if (
    databaseError
  ) {
    console.error(
      "DELETE COMMUNITY IMAGE DB ERROR:",
      databaseError,
    );


    return {
      success:
        false,

      message:
        "No se pudo retirar la imagen de la receta.",
    };
  }


  const {
    error:
      storageError,
  } =
    await supabase
      .storage
      .from(
        RECIPE_IMAGES_BUCKET,
      )
      .remove([
        pathToDelete,
      ]);


  revalidateRecipeImagePaths(
    recipeId,
  );


  if (
    storageError
  ) {
    console.error(
      "DELETE COMMUNITY IMAGE STORAGE ERROR:",
      storageError,
    );


    return {
      success:
        true,

      message:
        "La imagen se retiró de la receta, aunque no se pudo limpiar el archivo de Storage.",
    };
  }


  return {
    success:
      true,

    message:
      "Imagen eliminada correctamente.",
  };
}
