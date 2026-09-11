import Link from "next/link";

import { notFound } from "next/navigation";

import {
  RecipeImageUploader,
} from "@/components/admin/recipes/recipe-image-uploader";

import {
  getAdminRecipeById,
} from "@/services/recipes/recipe-service";

type EditRecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRecipePage({
  params,
}: EditRecipePageProps) {
  const { id } =
    await params;

  const recipe =
    await getAdminRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link
        href="/admin/recipes"
        className="text-sm underline"
      >
        ← Volver a recetas
      </Link>

      <div className="mt-6">
        <p className="text-sm">
          {recipe.status === "draft"
            ? "Borrador"
            : recipe.status ===
                "published"
              ? "Publicada"
              : "Archivada"}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {recipe.title}
        </h1>

        <p className="mt-2 text-sm">
          /recipes/{recipe.slug}
        </p>
      </div>

      <div className="mt-10">
        <RecipeImageUploader
          recipeId={recipe.id}
          initialImagePath={
            recipe.image_path
          }
        />
      </div>
    </main>
  );
}