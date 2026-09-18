import {
  NextResponse,
} from "next/server";

import {
  analyzeRecipeImage,
} from "@/lib/ai/analyze-recipe-image";

import {
  createClient,
} from "@/lib/supabase/server";

import type {
  AiRecipeImportApiResponse,
} from "@/types/ai-recipe-import-api";


export const runtime =
  "nodejs";


const MAX_FILE_SIZE =
  5 *
  1024 *
  1024;


const ALLOWED_FILE_TYPES =
  new Set(
    [
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  );


function jsonError(
  error:
    string,

  status:
    number,
) {
  const body:
    AiRecipeImportApiResponse =
    {
      success:
        false,

      error,
    };


  return NextResponse.json(
    body,
    {
      status,
    },
  );
}


export async function POST(
  request:
    Request,
) {
  const supabase =
    await createClient();


  const {
    data:
      authData,

    error:
      authError,
  } =
    await supabase.auth.getUser();


  if (
    authError ||
    !authData.user
  ) {
    return jsonError(
      "Debes iniciar sesión para utilizar la importación con IA.",
      401,
    );
  }


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
    adminError
  ) {
    console.error(
      "AI IMPORT ADMIN CHECK ERROR:",
      adminError,
    );


    return jsonError(
      "No se pudieron comprobar tus permisos.",
      500,
    );
  }


  if (
    !isAdmin
  ) {
    return jsonError(
      "No tienes permisos para importar recetas con IA.",
      403,
    );
  }


  let formData:
    FormData;


  try {
    formData =
      await request.formData();
  } catch (
    error
  ) {
    console.error(
      "AI IMPORT FORM DATA ERROR:",
      error,
    );


    return jsonError(
      "No se pudo procesar la imagen enviada.",
      400,
    );
  }


  const image =
    formData.get(
      "image",
    );


  if (
    !(image instanceof File)
  ) {
    return jsonError(
      "No se ha recibido ninguna imagen.",
      400,
    );
  }


  if (
    !ALLOWED_FILE_TYPES.has(
      image.type,
    )
  ) {
    return jsonError(
      "Formato no válido. Utiliza una imagen JPG, PNG o WebP.",
      415,
    );
  }


  if (
    image.size <=
    0
  ) {
    return jsonError(
      "La imagen está vacía.",
      400,
    );
  }


  if (
    image.size >
    MAX_FILE_SIZE
  ) {
    return jsonError(
      "La imagen supera el límite máximo de 5 MB.",
      413,
    );
  }


  try {
    const imageArrayBuffer =
      await image.arrayBuffer();

    const imageBuffer =
      Buffer.from(
        imageArrayBuffer,
      );

    const recipe =
      await analyzeRecipeImage(
        {
          imageBuffer,
          mimeType:
            image.type,
          fileName:
            image.name,
        },
      );


    const body:
      AiRecipeImportApiResponse =
      {
        success:
          true,

        recipe,
      };


    return NextResponse.json(
      body,
    );
  } catch (
    error
  ) {
    console.error(
      "AI RECIPE IMPORT ERROR:",
      error,
    );


    if (
      error instanceof Error &&
      error.message ===
        "Falta GEMINI_API_KEY en las variables de entorno."
    ) {
      return jsonError(
        "La integración de Gemini no está configurada en el servidor.",
        503,
      );
    }


    return jsonError(
      error instanceof Error
        ? error.message
        : "No se pudo analizar la receta. Revisa la imagen e inténtalo de nuevo.",
      502,
    );
  }
}