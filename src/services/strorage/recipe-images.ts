import { createClient } from "@/lib/supabase/client";

const BUCKET = "recipe-images";

export async function uploadRecipeImage(
  recipeId: string,
  file: File,
) {
  const supabase = createClient();

  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase() ?? "webp";

  const path =
    `recipes/${recipeId}/main.${extension}`;

  const { data, error } =
    await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
      });

  if (error) {
    throw new Error(
      `No se pudo subir la imagen: ${error.message}`,
    );
  }

  return data.path;
}


export function getRecipeImagePath(
  path: string,
) {
  const supabase = createClient();

  const { data } =
    supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

  return data.publicUrl;
}


export async function deleteRecipeImage(
  path: string,
) {
  const supabase = createClient();

  const { error } =
    await supabase.storage
      .from(BUCKET)
      .remove([path]);

  if (error) {
    throw new Error(
      `No se pudo eliminar la imagen: ${error.message}`,
    );
  }
}