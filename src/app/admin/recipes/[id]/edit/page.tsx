import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  RecipeAdditionalInfoForm,
} from "@/components/admin/recipes/recipe-additional-info-form";

import {
  RecipeAllergensForm,
} from "@/components/admin/recipes/recipe-allergens-form";

import {
  RecipeBasicInfoForm,
} from "@/components/admin/recipes/recipe-basic-info-form";

import {
  RecipeClassificationForm,
} from "@/components/admin/recipes/recipe-classification-form";

import {
  RecipeDeleteForm,
} from "@/components/admin/recipes/recipe-delete-form";

import {
  RecipeImageUploader,
} from "@/components/admin/recipes/recipe-image-uploader";

import {
  RecipeIngredientsForm,
} from "@/components/admin/recipes/recipe-ingredients-form";

import {
  RecipePublicationForm,
} from "@/components/admin/recipes/recipe-publication-form";

import {
  RecipeReviewForm,
} from "@/components/admin/recipes/recipe-review-form";

import {
  RecipeServingsForm,
} from "@/components/admin/recipes/recipe-servings-form";

import {
  RecipeStepsForm,
} from "@/components/admin/recipes/recipe-steps-form";

import {
  RecipeTimesForm,
} from "@/components/admin/recipes/recipe-times-form";

import {
  getPublicationReadiness,
} from "@/lib/recipes/get-publication-readiness";

import {
  getAdminRecipeReviewInfo,
} from "@/services/recipes/recipe-review-service";

import {
  getAdminRecipeById,
  getAllergenOptions,
  getRecipeAllergens,
  getRecipeClassificationOptions,
  getRecipeClassificationRelations,
  getRecipeIngredients,
  getRecipeSteps,
} from "@/services/recipes/recipe-service";


type EditRecipePageProps = {
  params:
    Promise<{
      id:
        string;
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
    recipeSteps,
    allergenOptions,
    recipeAllergens,
    reviewInfo,
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

      getRecipeSteps(
        id,
      ),

      getAllergenOptions(),

      getRecipeAllergens(
        id,
      ),

      getAdminRecipeReviewInfo(
        id,
      ),
    ]);


  if (
    !recipe ||
    !reviewInfo
  ) {
    notFound();
  }


  /*
   * IMPORTANTE:
   *
   * recipe.status utiliza todavía el tipo administrativo
   * antiguo RecipeStatus, que no contempla pending_review.
   *
   * reviewInfo.status sí representa todos los estados reales
   * de una receta comunitaria, incluido pending_review.
   */

  const moderationStatus =
    reviewInfo.status;


  const statusLabel =
    moderationStatus ===
      "draft"
      ? "Borrador"
      : moderationStatus ===
          "pending_review"
        ? "En revisión"
        : moderationStatus ===
            "published"
          ? "Publicada"
          : "Archivada";


  const isPendingReview =
    moderationStatus ===
    "pending_review";


  const ingredientCount =
    ingredientGroups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group
          .ingredients
          .length,
      0,
    );


  const publicationReadiness =
    getPublicationReadiness({
      recipe,

      categoryCount:
        classificationRelations
          .categoryIds
          .length,

      ingredientCount,

      stepCount:
        recipeSteps.length,
    });


  return (
    <main className="mx-auto max-w-5xl p-8">

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <Link
          href="/admin/recipes"
          className="text-sm underline"
        >
          ← Volver a recetas
        </Link>


        <Link
          href={`/admin/recipes/${recipe.id}/preview`}
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Vista previa
        </Link>

      </div>


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="mt-6">

        <div className="flex flex-wrap items-center gap-3">

          <span
            className={
              isPendingReview
                ? "inline-flex rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-sm font-semibold text-brand"
                : "text-sm"
            }
          >
            {
              statusLabel
            }
          </span>


          {isPendingReview && (
            <span className="text-sm text-muted-foreground">
              Pendiente de decisión administrativa
            </span>
          )}

        </div>


        <h1 className="mt-2 text-3xl font-bold">
          {
            recipe.title
          }
        </h1>


        <p className="mt-2 text-sm">
          /recipes/
          {
            recipe.slug
          }
        </p>

      </header>


      {/* =================================================
          PENDING REVIEW MODE
      ================================================= */}

      {isPendingReview ? (

        <div className="mt-10">

          <RecipeReviewForm
            recipeId={
              recipe.id
            }
            recipeTitle={
              recipe.title
            }
            submittedAt={
              reviewInfo
                .submitted_at
            }
          />

        </div>

      ) : (

        /* =================================================
           NORMAL ADMIN EDITOR
        ================================================= */

        <div className="mt-10 space-y-8">

          {/* 01. INFORMACIÓN BÁSICA */}

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


          {/* 02. IMAGEN PRINCIPAL */}

          <RecipeImageUploader
            recipeId={
              recipe.id
            }

            initialImagePath={
              recipe.image_path
            }
          />


          {/* 03. CLASIFICACIÓN */}

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


          {/* 04. RACIONES */}

          <RecipeServingsForm
            recipeId={
              recipe.id
            }

            initialValue={
              recipe.base_servings
            }
          />


          {/* 05. TIEMPOS */}

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


          {/* 06. INGREDIENTES */}

          <RecipeIngredientsForm
            recipeId={
              recipe.id
            }

            initialGroups={
              ingredientGroups
            }
          />


          {/* 07. ELABORACIÓN */}

          <RecipeStepsForm
            recipeId={
              recipe.id
            }

            initialSteps={
              recipeSteps
            }
          />


          {/* 08. INFORMACIÓN ADICIONAL */}

          <RecipeAdditionalInfoForm
            recipeId={
              recipe.id
            }

            initialValues={{
              tips:
                recipe.tips,

              substitutions:
                recipe.substitutions,

              storage:
                recipe.storage,

              freezing:
                recipe.freezing,

              reheating:
                recipe.reheating,

              sourceType:
                recipe.source_type,

              sourceTitle:
                recipe.source_title,

              sourceAuthor:
                recipe.source_author,

              sourcePage:
                recipe.source_page,

              sourceUrl:
                recipe.source_url,

              sourceNotes:
                recipe.source_notes,
            }}
          />


          {/* 09. ALÉRGENOS */}

          <RecipeAllergensForm
            recipeId={
              recipe.id
            }

            allergens={
              allergenOptions
            }

            initialValues={
              recipeAllergens
            }
          />


          {/* 10. PUBLICACIÓN */}

          <RecipePublicationForm
            recipeId={
              recipe.id
            }

            status={
              recipe.status
            }

            readiness={
              publicationReadiness
            }
          />


          {/* ZONA PELIGROSA */}

          <RecipeDeleteForm
            recipeId={
              recipe.id
            }

            recipeTitle={
              recipe.title
            }

            status={
              recipe.status
            }
          />

        </div>
      )}

    </main>
  );
}