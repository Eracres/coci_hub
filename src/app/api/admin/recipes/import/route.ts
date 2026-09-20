import {
  NextResponse,
} from "next/server";

import {
  analyzeRecipeImage,
  RecipeAiError,
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


    /*
     * =====================================================
     * CONFIGURATION
     * =====================================================
     */

    if (
      error instanceof
        Error &&
      error.message ===
        "Falta GEMINI_API_KEY en las variables de entorno."
    ) {
      return jsonError(
        "El servicio de análisis con IA no está disponible en este momento.",
        503,
      );
    }


    /*
     * =====================================================
     * KNOWN AI ERRORS
     * =====================================================
     */

    if (
      error instanceof
      RecipeAiError
    ) {
      if (
        error.code ===
        "rate-limit"
      ) {
        return jsonError(
          "Has alcanzado temporalmente el límite de análisis con IA. Inténtalo de nuevo más tarde.",
          429,
        );
      }


      if (
        error.code ===
        "unavailable"
      ) {
        return jsonError(
          "El servicio de análisis con IA está temporalmente saturado. Espera unos instantes y vuelve a intentarlo.",
          503,
        );
      }


      if (
        error.code ===
        "invalid-response"
      ) {
        return jsonError(
          "La IA no pudo interpretar correctamente la receta. Prueba con una imagen más clara o completa.",
          502,
        );
      }


      return jsonError(
        "No se pudo completar el análisis con IA en este momento. Inténtalo de nuevo más tarde.",
        502,
      );
    }


    /*
     * =====================================================
     * UNKNOWN ERROR
     * =====================================================
     */

    return jsonError(
      "No se pudo analizar la receta en este momento. Inténtalo de nuevo más tarde.",
      500,
    );
  }
}