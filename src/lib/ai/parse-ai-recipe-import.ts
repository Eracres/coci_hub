import {
  aiRecipeImportSchema,
} from "@/schemas/ai-recipe-import-schema";

import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";


export type AiRecipeImportParseResult =
  | {
      success:
        true;

      data:
        AiRecipeImport;

      errors:
        [];
    }
  | {
      success:
        false;

      data:
        null;

      errors:
        string[];
    };


function formatIssuePath(
  path:
    PropertyKey[],
) {
  if (
    path.length ===
    0
  ) {
    return "root";
  }


  return path
    .map(
      (
        part,
      ) =>
        String(
          part,
        ),
    )
    .join(
      ".",
    );
}


export function parseAiRecipeImport(
  value: unknown,
): AiRecipeImportParseResult {
  const result =
    aiRecipeImportSchema.safeParse(
      value,
    );


  if (
    result.success
  ) {
    return {
      success:
        true,

      data:
        result.data,

      errors:
        [],
    };
  }


  return {
    success:
      false,

    data:
      null,

    errors:
      result.error.issues.map(
        (
          issue,
        ) =>
          `${formatIssuePath(
            issue.path,
          )}: ${issue.message}`,
      ),
  };
}