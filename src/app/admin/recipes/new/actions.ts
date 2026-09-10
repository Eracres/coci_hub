"use server";

import { redirect } from "next/navigation";

import { slugify } from "@/lib/recipes/slugify";

import {
  createRecipeDraft,
} from "@/services/recipes/recipe-service";

export async function createDraftAction(
  formData: FormData,
): Promise<void> {
  const title =
    formData.get("title");

  if (
    typeof title !== "string" ||
    title.trim().length < 3 ||
    title.trim().length > 120
  ) {
    redirect(
      "/admin/recipes/new?error=invalid-title",
    );
  }

  const cleanTitle =
    title.trim();

  const slug =
    slugify(cleanTitle);

  if (!slug) {
    redirect(
      "/admin/recipes/new?error=invalid-title",
    );
  }

  try {
    await createRecipeDraft({
      title: cleanTitle,
      slug,
    });
  } catch (error) {
    console.error(
      "CREATE RECIPE ERROR:",
      error,
    );

    redirect(
      "/admin/recipes/new?error=create-failed",
    );
  }

  redirect(
    "/admin/recipes?created=1",
  );
}