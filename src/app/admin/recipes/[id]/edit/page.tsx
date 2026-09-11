import Link from "next/link";
import { notFound } from "next/navigation";

import {
  RecipeBasicInfoForm,
} from "@/components/admin/recipes/recipe-basic-info-form";

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
  const { id } = await params;

  const recipe =
    await getAdminRecipeById(id);

  if (!recipe) {
    notFound();
  }

  const statusLabel =
    recipe.status === "draft"
      ? "Borrador"
      : recipe.status === "published"
        ? "Publicada"
        : "Archivada";

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link
        href="/admin/recipes"
        className="text-sm underline"
      >
        ← Volver a recetas
      </Link>

      <header className="mt-6">
        <p className="text-sm">
          {statusLabel}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {recipe.title}
        </h1>

        <p className="mt-2 text-sm">
          /recipes/{recipe.slug}
        </p>
      </header>

      <div className="mt-10 space-y-8">
        <RecipeBasicInfoForm
          recipeId={recipe.id}
          initialValues={{
            title:
              recipe.title,

            slug:
              recipe.slug,

            shortDescription:
              recipe.short_description,

            introduction:
              recipe.introduction,
          }}
        />

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