import {
  createClient,
} from "@/lib/supabase/client";


const BUCKET =
  "recipe-images";


const MAX_FILE_SIZE =
  5 *
  1024 *
  1024;


const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


export async function uploadRecipeImage(
  recipeId: string,
  file: File,
) {
  if (
    !ALLOWED_TYPES.includes(
      file.type,
    )
  ) {
    throw new Error(
      "Formato no permitido. Utiliza JPEG, PNG o WebP.",
    );
  }


  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "La imagen no puede superar los 5 MB.",
    );
  }


  const supabase =
    createClient();


  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ??
    "webp";


  const path =
    `recipes/${recipeId}/main.${extension}`;


  const {
    data,
    error,
  } =
    await supabase.storage
      .from(
        BUCKET,
      )
      .upload(
        path,
        file,
        {
          /*
           * Permite sustituir:
           *
           * recipes/{id}/main.jpg
           *
           * por otra imagen en la misma ruta.
           *
           * Para ello Storage necesita policy UPDATE.
           */
          upsert:
            true,

          cacheControl:
            "3600",

          contentType:
            file.type,
        },
      );


  if (error) {
    throw new Error(
      `No se pudo subir la imagen: ${error.message}`,
    );
  }


  return data.path;
}


export function getRecipeImageUrl(
  path: string,
  version?: number,
) {
  const supabase =
    createClient();


  const {
    data,
  } =
    supabase.storage
      .from(
        BUCKET,
      )
      .getPublicUrl(
        path,
      );


  /*
   * El parámetro v evita que el navegador/CDN
   * muestre una versión antigua cuando
   * sustituimos un archivo manteniendo la
   * misma ruta.
   */
  if (
    version ===
    undefined
  ) {
    return data.publicUrl;
  }


  return `${data.publicUrl}?v=${version}`;
}


export async function deleteRecipeImage(
  path: string,
) {
  const supabase =
    createClient();


  const {
    error,
  } =
    await supabase.storage
      .from(
        BUCKET,
      )
      .remove([
        path,
      ]);


  if (error) {
    throw new Error(
      `No se pudo eliminar la imagen: ${error.message}`,
    );
  }
}