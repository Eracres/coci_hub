import {
  createClient,
} from "@/lib/supabase/server";

import {
  slugify,
} from "@/lib/recipes/slugify";

import type {
  CategoryData,
} from "@/schemas/category-schema";


/* =========================================================
   TYPES
========================================================= */

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};


/* =========================================================
   GET ADMIN CATEGORIES
========================================================= */

export async function getAdminCategories():
Promise<AdminCategory[]> {
  const supabase = await createClient();

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
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `No se pudieron obtener las categorías: ${error.message}`,
    );
  }

  return data ?? [];
}


/* =========================================================
   CREATE CATEGORY
========================================================= */

export async function createCategory(
  input: CategoryData,
): Promise<AdminCategory> {
  const supabase = await createClient();

  const slug = slugify(input.name);

  if (!slug) {
    throw new Error(
      "No se pudo generar un slug válido.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .rpc("admin_create_category", {
      p_name: input.name,
      p_slug: slug,
      p_description: input.description,
    })
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "No se recibieron los datos de la categoría creada.",
    );
  }

  return data as AdminCategory;
}


/* =========================================================
   DELETE CATEGORY
========================================================= */

export async function deleteCategory(
  categoryId: string,
): Promise<void> {
  const supabase = await createClient();

  const {
    error,
  } = await supabase.rpc(
    "admin_delete_category",
    {
      p_category_id: categoryId,
    },
  );

  if (error) {
    throw error;
  }
}