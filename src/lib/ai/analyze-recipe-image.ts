import "server-only";

import {
  GoogleGenAI,
} from "@google/genai";

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


  const response =
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


  const rawText =
    response.text?.trim();


  if (
    !rawText
  ) {
    throw new Error(
      "Gemini no devolvió contenido al analizar la receta.",
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


    throw new Error(
      "Gemini devolvió una respuesta que no es JSON válido.",
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


    throw new Error(
      "La respuesta de Gemini no cumple el formato esperado por CociHub.",
    );
  }


  return validation.data;
}