import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  RecipeBasicInfoForm,
} from "@/components/admin/recipes/recipe-basic-info-form";

import {
  RecipeClassificationForm,
} from "@/components/admin/recipes/recipe-classification-form";

import {
  RecipeImageUploader,
} from "@/components/admin/recipes/recipe-image-uploader";

import {
  RecipeIngredientsForm,
} from "@/components/admin/recipes/recipe-ingredients-form";

import {
  RecipeServingsForm,
} from "@/components/admin/recipes/recipe-servings-form";

import {
  RecipeTimesForm,
} from "@/components/admin/recipes/recipe-times-form";

import {
  getAdminRecipeById,
  getRecipeClassificationOptions,
  getRecipeClassificationRelations,
  getRecipeIngredients,
} from "@/services/recipes/recipe-service";


type EditRecipePageProps = {
  params: Promise<{
    id: string;
  }>;
};


export default async function EditRecipePage({
  params,
}: EditRecipePageProps) {
  const {
    id,
  } =
    await params;


  const [
    recipe,
    classificationOptions,
    classificationRelations,
    ingredientGroups,
  ] =
    await Promise.all([
      getAdminRecipeById(
        id,
      ),

      getRecipeClassificationOptions(),

      getRecipeClassificationRelations(
        id,
      ),

      getRecipeIngredients(
        id,
      ),
    ]);


  if (
    !recipe
  ) {
    notFound();
  }


  const statusLabel =
    recipe.status ===
    "draft"
      ? "Borrador"
      : recipe.status ===
          "published"
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
          /recipes/
          {recipe.slug}
        </p>
      </header>


      <div className="mt-10 space-y-8">

        {/* =============================================
            01. INFORMACIÓN BÁSICA
        ============================================= */}

        <RecipeBasicInfoForm
          recipeId={
            recipe.id
          }

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


        {/* =============================================
            02. IMAGEN PRINCIPAL
        ============================================= */}

        <RecipeImageUploader
          recipeId={
            recipe.id
          }

          initialImagePath={
            recipe.image_path
          }
        />


        {/* =============================================
            03. CLASIFICACIÓN
        ============================================= */}

        <RecipeClassificationForm
          recipeId={
            recipe.id
          }

          recipeTypes={
            classificationOptions
              .recipeTypes
          }

          categories={
            classificationOptions
              .categories
          }

          tags={
            classificationOptions
              .tags
          }

          initialValues={{
            recipeTypeId:
              recipe.recipe_type_id,

            difficulty:
              recipe.difficulty,

            categoryIds:
              classificationRelations
                .categoryIds,

            tagIds:
              classificationRelations
                .tagIds,

            featured:
              recipe.featured,
          }}
        />


        {/* =============================================
            04. RACIONES
        ============================================= */}

        <RecipeServingsForm
          recipeId={
            recipe.id
          }

          initialValue={
            recipe.base_servings
          }
        />


        {/* =============================================
            05. TIEMPOS
        ============================================= */}

        <RecipeTimesForm
          recipeId={
            recipe.id
          }

          initialValues={{
            preparationMinutes:
              recipe.preparation_minutes,

            cookingMinutes:
              recipe.cooking_minutes,

            additionalMinutes:
              recipe.additional_minutes,
          }}
        />


        {/* =============================================
            06. INGREDIENTES
        ============================================= */}

        <RecipeIngredientsForm
          recipeId={
            recipe.id
          }

          initialGroups={
            ingredientGroups
          }
        />

      </div>
    </main>
  );
}