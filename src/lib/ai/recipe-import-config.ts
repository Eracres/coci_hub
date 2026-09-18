export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Falta GEMINI_API_KEY en las variables de entorno.",
    );
  }

  return apiKey;
}

export function getRecipeImportModel(): string {
  return (
    process.env.GEMINI_RECIPE_IMPORT_MODEL?.trim() ||
    "gemini-3.8-flash"
  );
}