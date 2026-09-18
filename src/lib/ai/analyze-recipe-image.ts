import "server-only";

import OpenAI from "openai";

import {
  zodTextFormat,
} from "openai/helpers/zod";

import {
  parseAiRecipeImport,
} from "@/lib/ai/parse-ai-recipe-import";

import {
  RECIPE_IMPORT_INSTRUCTIONS,
} from "@/lib/ai/recipe-import-instructions";

import {
  aiRecipeImportSchema,
} from "@/schemas/ai-recipe-import-schema";

import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";


const DEFAULT_RECIPE_IMPORT_MODEL =
  "gpt-5.6-luna";


function getOpenAiClient() {
  const apiKey =
    process.env.OPENAI_API_KEY;


  if (
    !apiKey
  ) {
    throw new Error(
      "OPENAI_API_KEY_NOT_CONFIGURED",
    );
  }


  return new OpenAI({
    apiKey,
  });
}


function getRecipeImportModel() {
  const configuredModel =
    process.env
      .OPENAI_RECIPE_IMPORT_MODEL
      ?.trim();


  return (
    configuredModel ||
    DEFAULT_RECIPE_IMPORT_MODEL
  );
}


function fileToDataUrl(
  file:
    File,

  base64:
    string,
) {
  return `data:${file.type};base64,${base64}`;
}


export async function analyzeRecipeImage(
  file:
    File,
): Promise<
  AiRecipeImport
> {
  const client =
    getOpenAiClient();


  const buffer =
    Buffer.from(
      await file.arrayBuffer(),
    );


  const imageDataUrl =
    fileToDataUrl(
      file,
      buffer.toString(
        "base64",
      ),
    );


  const response =
    await client.responses.parse(
      {
        model:
          getRecipeImportModel(),

        instructions:
          RECIPE_IMPORT_INSTRUCTIONS,

        input: [
          {
            role:
              "user",

            content: [
              {
                type:
                  "input_text",

                text:
                  "Analiza esta imagen como una posible receta de cocina. Extrae únicamente la información visible o inequívocamente identificable y devuelve la estructura CociHub solicitada.",
              },

              {
                type:
                  "input_image",

                image_url:
                  imageDataUrl,

                detail:
                  "high",
              },
            ],
          },
        ],

        text: {
          format:
            zodTextFormat(
              aiRecipeImportSchema,
              "cocihub_recipe_import",
            ),
        },
      },
    );


  if (
    response.status !==
    "completed"
  ) {
    throw new Error(
      "AI_RESPONSE_NOT_COMPLETED",
    );
  }


  if (
    !response.output_parsed
  ) {
    throw new Error(
      "AI_RESPONSE_NOT_PARSED",
    );
  }


  /*
   * responses.parse() ya valida contra Zod,
   * pero mantenemos nuestra propia frontera
   * de validación de CociHub.
   */
  const validation =
    parseAiRecipeImport(
      response.output_parsed,
    );


  if (
    !validation.success
  ) {
    console.error(
      "COCIHUB AI RECIPE VALIDATION ERROR:",
      validation.errors,
    );


    throw new Error(
      "AI_RESPONSE_INVALID",
    );
  }


  return validation.data;
}