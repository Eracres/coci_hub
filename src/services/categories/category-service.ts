
import {
  createClient,
} from "@/lib/supabase/server";

import {
  slugify,
} from "@/lib/recipes/slugify";

import type {
  CategoryData,
} from "@/schemas/category-schema";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;

  description:
    string | null;

  created_at: string;
  updated_at: string;
};


export async function getAdminCategories():
Promise<AdminCategory[]> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      created_at,
      updated_at
    `)
    .order(
      "name",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `No se pudieron obtener las categorías: ${error.message}`,
    );
  }

  return data ?? [];
}


export async function createCategory(
  input: CategoryData,
) {
  const supabase =
    await createClient();

  const slug =
    slugify(input.name);

  if (!slug) {
    throw new Error(
      "No se pudo generar un slug válido.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .insert({
      name:
        input.name,

      slug,

      description:
        input.description,
    })
    .select(`
      id,
      name,
      slug,
      description,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return data;
}


export async function deleteCategory(
  categoryId: string,
) {
  const supabase =
    await createClient();

  const {
    error,
  } = await supabase
    .from("categories")
    .delete()
    .eq(
      "id",
      categoryId,
    );

  if (error) {
    throw error;
  }
}