import {
  NextResponse,
} from "next/server";

import {
  parseAiRecipeImport,
} from "@/lib/ai/parse-ai-recipe-import";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  createAiRecipeDraft,
} from "@/services/recipes/ai-recipe-draft-service";

import type {
  AiRecipeDraftApiResponse,
} from "@/types/ai-recipe-draft-api";


export const runtime =
  "nodejs";


function jsonError(
  error:
    string,

  status:
    number,

  validationErrors?:
    string[],
) {
  const body:
    AiRecipeDraftApiResponse =
    {
      success:
        false,

      error,

      ...(validationErrors
        ? {
            validationErrors,
          }
        : {}),
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
      "Debes iniciar sesión para crear una receta.",
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
      "AI DRAFT ADMIN CHECK ERROR:",
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
      "No tienes permisos para crear recetas.",
      403,
    );
  }


  let payload:
    unknown;


  try {
    payload =
      await request.json();
  } catch (
    error
  ) {
    console.error(
      "AI DRAFT JSON ERROR:",
      error,
    );


    return jsonError(
      "Los datos enviados no son válidos.",
      400,
    );
  }


  const validation =
    parseAiRecipeImport(
      payload,
    );


  if (
    !validation.success
  ) {
    return jsonError(
      "La receta revisada contiene datos que no son válidos.",
      400,
      validation.errors,
    );
  }


  try {
    const result =
      await createAiRecipeDraft(
        validation.data,
        authData.user.id,
      );


    const body:
      AiRecipeDraftApiResponse =
      {
        success:
          true,

        recipeId:
          result.recipeId,

        slug:
          result.slug,

        unmatched:
          result.unmatched,
      };


    return NextResponse.json(
      body,
      {
        status:
          201,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "AI CREATE DRAFT ERROR:",
      error,
    );


    return jsonError(
      error instanceof Error
        ? error.message
        : "No se pudo crear el borrador.",
      500,
    );
  }
}