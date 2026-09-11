import { createClient } from "@/lib/supabase/server";

export type AdminRecipeListItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type AdminRecipe = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  image_path: string | null;
  image_alt: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export async function getAdminRecipeById(
  recipeId: string,
): Promise<AdminRecipe | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(`
      id,
      author_id,
      title,
      slug,
      status,
      image_path,
      image_alt,
      featured,
      created_at,
      updated_at
    `)
    .eq("id", recipeId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `No se pudo obtener la receta: ${error.message}`,
    );
  }

  return data;
}

export async function updateRecipeImagePath(
  recipeId: string,
  imagePath: string | null,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .update({
      image_path: imagePath,
    })
    .eq("id", recipeId)
    .select("id, image_path")
    .single();

  if (error) {
    throw new Error(
      `No se pudo actualizar la imagen de la receta: ${error.message}`,
    );
  }

  return data;
}

type CreateRecipeDraftInput = {
  title: string;
  slug: string;
};

export async function createRecipeDraft(
  input: CreateRecipeDraftInput,
) {
  const supabase = await createClient();

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const userId =
    claimsData?.claims?.sub;

  if (
    claimsError ||
    !userId
  ) {
    throw new Error(
      "No existe una sesión válida.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("recipes")
    .insert({
      author_id: userId,

      title:
        input.title.trim(),

      slug:
        input.slug.trim(),

      status: "draft",

      featured: false,
    })
    .select(
      `
        id,
        title,
        slug,
        status
      `,
    )
    .single();

  if (error) {
    throw new Error(
      `No se pudo crear la receta: ${error.message}`,
    );
  }

  return data;
}


export async function getAdminRecipes(): Promise<
  AdminRecipeListItem[]
> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("recipes")
    .select(
      `
        id,
        title,
        slug,
        status,
        featured,
        image_path,
        created_at,
        updated_at,
        published_at
      `,
    )
    .order(
      "updated_at",
      {
        ascending: false,
      },
    );

  if (error) {
    throw new Error(
      `No se pudieron obtener las recetas: ${error.message}`,
    );
  }

  return data ?? [];
}