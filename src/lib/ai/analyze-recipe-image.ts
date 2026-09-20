import "server-only";

import {
  GoogleGenAI,
} from "@google/genai";

import {
  normalizeAiRecipeImport,
} from "@/lib/ai/normalize-ai-recipe-import";

import {
  parseAiRecipeImport,
} from "@/lib/ai/parse-ai-recipe-import";

import {
  RECIPE_IMPORT_INSTRUCTIONS,
} from "@/lib/ai/recipe-import-instructions";

import {
  getGeminiApiKey,
  getRecipeImportModel,
} from "@/lib/ai/recipe-import-config";

import {
  RECIPE_IMPORT_RESPONSE_SCHEMA,
} from "@/lib/ai/recipe-import-response-schema";

import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";


type AnalyzeRecipeImageInput = {
  imageBuffer:
    Buffer;

  mimeType:
    string;

  fileName?:
    string | null;
};


export type RecipeAiErrorCode =
  | "rate-limit"
  | "unavailable"
  | "invalid-response"
  | "provider-error";


export class RecipeAiError extends Error {
  readonly code:
    RecipeAiErrorCode;


  constructor(
    code:
      RecipeAiErrorCode,

    message:
      string,
  ) {
    super(
      message,
    );

    this.name =
      "RecipeAiError";

    this.code =
      code;
  }
}


const RECIPE_ANALYSIS_PROMPT =
  `
Analiza esta imagen como una posible receta de cocina.

Extrae únicamente la información visible o inequívocamente identificable.

Debes devolver todos los campos definidos por el esquema de CociHub.

Cuando un campo no aparezca en la imagen:

- utiliza null si el campo admite null;
- utiliza [] para listas sin información;
- nunca omitas un campo obligatorio;
- nunca inventes información para rellenarlo.

Ejemplos:

Si no aparece la dificultad:
"difficulty": null

Si no aparecen categorías:
"categories": []

Si no aparecen alérgenos explícitos:
"allergens": []

Si no aparece una fuente:
rellena todos los campos de source con null.

version siempre debe ser 1.

No añadas propiedades distintas de las definidas en el esquema.
`.trim();


function getProviderErrorText(
  error:
    unknown,
) {
  if (
    error instanceof
    Error
  ) {
    return error.message;
  }


  try {
    return JSON.stringify(
      error,
    );
  } catch {
    return String(
      error,
    );
  }
}


function getProviderStatus(
  error:
    unknown,
) {
  if (
    typeof error !==
      "object" ||
    error ===
      null
  ) {
    return null;
  }


  const candidate =
    error as {
      status?:
        unknown;

      code?:
        unknown;
    };


  if (
    typeof candidate.status ===
      "number"
  ) {
    return candidate.status;
  }


  if (
    typeof candidate.code ===
      "number"
  ) {
    return candidate.code;
  }


  return null;
}


function normalizeProviderError(
  error:
    unknown,
): RecipeAiError {
  const status =
    getProviderStatus(
      error,
    );


  const errorText =
    getProviderErrorText(
      error,
    );


  const normalizedText =
    errorText.toLowerCase();


  const isRateLimit =
    status ===
      429 ||
    normalizedText.includes(
      "resource_exhausted",
    ) ||
    normalizedText.includes(
      "quota exceeded",
    ) ||
    normalizedText.includes(
      "rate limit",
    ) ||
    normalizedText.includes(
      "too many requests",
    );


  if (
    isRateLimit
  ) {
    return new RecipeAiError(
      "rate-limit",
      "Se ha alcanzado temporalmente el límite de uso del servicio de IA.",
    );
  }


  const isUnavailable =
    status ===
      503 ||
    normalizedText.includes(
      "unavailable",
    ) ||
    normalizedText.includes(
      "high demand",
    ) ||
    normalizedText.includes(
      "temporarily unavailable",
    ) ||
    normalizedText.includes(
      "service unavailable",
    );


  if (
    isUnavailable
  ) {
    return new RecipeAiError(
      "unavailable",
      "El servicio de IA está temporalmente saturado.",
    );
  }


  return new RecipeAiError(
    "provider-error",
    "No se pudo completar el análisis con el servicio de IA.",
  );
}


export async function analyzeRecipeImage(
  input:
    AnalyzeRecipeImageInput,
): Promise<
  AiRecipeImport
> {
  const client =
    new GoogleGenAI(
      {
        apiKey:
          getGeminiApiKey(),
      },
    );


  const base64Image =
    input.imageBuffer.toString(
      "base64",
    );


  let response:
    Awaited<
      ReturnType<
        typeof client.models.generateContent
      >
    >;


  try {
    response =
      await client.models.generateContent(
        {
          model:
            getRecipeImportModel(),

          contents: [
            {
              inlineData: {
                mimeType:
                  input.mimeType,

                data:
                  base64Image,
              },
            },

            {
              text:
                RECIPE_ANALYSIS_PROMPT,
            },
          ],

          config: {
            systemInstruction:
              RECIPE_IMPORT_INSTRUCTIONS,

            responseMimeType:
              "application/json",

            responseJsonSchema:
              RECIPE_IMPORT_RESPONSE_SCHEMA,

            temperature:
              0.1,
          },
        },
      );
  } catch (
    error
  ) {
    console.error(
      "GEMINI PROVIDER ERROR:",
      error,
    );


    throw normalizeProviderError(
      error,
    );
  }


  const rawText =
    response.text?.trim();


  if (
    !rawText
  ) {
    console.error(
      "GEMINI EMPTY RESPONSE",
      {
        fileName:
          input.fileName ??
          null,

        mimeType:
          input.mimeType,
      },
    );


    throw new RecipeAiError(
      "invalid-response",
      "La IA no devolvió contenido utilizable.",
    );
  }


  let parsed:
    unknown;


  try {
    parsed =
      JSON.parse(
        rawText,
      );
  } catch (
    error
  ) {
    console.error(
      "GEMINI RECIPE JSON PARSE ERROR:",
      error,
    );


    console.error(
      "GEMINI RAW RESPONSE:",
      rawText,
    );


    throw new RecipeAiError(
      "invalid-response",
      "La IA devolvió una respuesta que CociHub no pudo interpretar.",
    );
  }


  const validation =
    parseAiRecipeImport(
      parsed,
    );


  if (
    !validation.success
  ) {
    console.error(
      "GEMINI RECIPE VALIDATION ERROR:",
      validation.errors,
    );


    console.error(
      "GEMINI RECIPE RECEIVED:",
      JSON.stringify(
        parsed,
        null,
        2,
      ),
    );


    throw new RecipeAiError(
      "invalid-response",
      "La respuesta de la IA no cumple el formato esperado por CociHub.",
    );
  }


  /*
   * Gemini extrae el contenido.
   *
   * A partir de aquí CociHub impone
   * su propia normalización visual y
   * ortotipográfica antes de mostrar
   * los datos al administrador.
   */
  return normalizeAiRecipeImport(
    validation.data,
  );
}