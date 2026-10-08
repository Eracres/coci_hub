import {
  ArrowLeft,
  Eye,
  Settings2,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  AdminRecipeEditorStepper,
  type AdminRecipeEditorStep,
} from "@/components/admin/recipes/admin-recipe-editor-stepper";

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


type AdminEditorStepKey =
  | "basic"
  | "servings"
  | "classification"
  | "ingredients"
  | "steps"
  | "times"
  | "image"
  | "additional"
  | "allergens"
  | "publication";


type EditRecipePageProps = {
  params:
    Promise<{
      id:
        string;
    }>;

  searchParams:
    Promise<{
      step?:
        string;
    }>;
};


const editorSteps: {
  key:
    AdminEditorStepKey;

  label:
    string;

  optional?:
    boolean;
}[] = [
  {
    key:
      "basic",

    label:
      "Información básica",
  },

  {
    key:
      "servings",

    label:
      "Raciones",
  },

  {
    key:
      "classification",

    label:
      "Clasificación",
  },

  {
    key:
      "ingredients",

    label:
      "Ingredientes",
  },

  {
    key:
      "steps",

    label:
      "Elaboración",
  },

  {
    key:
      "times",

    label:
      "Tiempos",
  },

  {
    key:
      "image",

    label:
      "Imagen",
  },

  {
    key:
      "additional",

    label:
      "Información adicional",

    optional:
      true,
  },

  {
    key:
      "allergens",

    label:
      "Alérgenos",

    optional:
      true,
  },

  {
    key:
      "publication",

    label:
      "Publicación",
  },
];


function isAdminEditorStep(
  value:
    string | undefined,
): value is AdminEditorStepKey {
  return editorSteps.some(
    (
      step,
    ) =>
      step.key ===
      value,
  );
}


export default async function EditRecipePage({
  params,
  searchParams,
}: EditRecipePageProps) {
  const {
    id,
  } =
    await params;


  const {
    step:
      requestedStep,
  } =
    await searchParams;


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


  /* =====================================================
     STATUS
  ===================================================== */

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


  /* =====================================================
     COUNTS
  ===================================================== */

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


  /* =====================================================
     PUBLICATION READINESS
  ===================================================== */

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


  /* =====================================================
     COMPLETION
  ===================================================== */

  const additionalInfoComplete =
    Boolean(
      recipe.tips?.trim() ||
        recipe.substitutions?.trim() ||
        recipe.storage?.trim() ||
        recipe.freezing?.trim() ||
        recipe.reheating?.trim() ||
        recipe.source_type ||
        recipe.source_title?.trim() ||
        recipe.source_author?.trim() ||
        recipe.source_page ||
        recipe.source_url?.trim() ||
        recipe.source_notes?.trim(),
    );


  const completion:
    Record<
      AdminEditorStepKey,
      boolean
    > = {
    basic:
      Boolean(
        recipe.title.trim(),
      ) &&
      Boolean(
        recipe.slug.trim(),
      ) &&
      Boolean(
        recipe
          .short_description
          ?.trim(),
      ),

    servings:
      recipe.base_servings !==
        null &&
      recipe.base_servings >
        0,

    classification:
      Boolean(
        recipe.recipe_type_id,
      ) &&
      Boolean(
        recipe.difficulty,
      ) &&
      classificationRelations
        .categoryIds
        .length >
        0,

    ingredients:
      ingredientCount >
      0,

    steps:
      recipeSteps.length >
      0,

    times:
      recipe.preparation_minutes !==
        null &&
      recipe.preparation_minutes >
        0,

    image:
      Boolean(
        recipe
          .image_path
          ?.trim(),
      ),

    additional:
      additionalInfoComplete,

    allergens:
      recipeAllergens.length >
      0,

    publication:
      publicationReadiness.canPublish,
  };


  /* =====================================================
     PENDING REVIEW
  ===================================================== */

  if (
    isPendingReview
  ) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-foreground">

        <div className="mx-auto w-full max-w-5xl">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <Link
              href="/admin/recipes"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >

              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />

              Volver a recetas

            </Link>


            <Link
              href={`/admin/recipes/${recipe.id}/preview`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
            >

              <Eye
                className="size-4"
                aria-hidden="true"
              />

              Vista previa

            </Link>

          </div>


          <header className="mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm">

            <div className="flex flex-wrap items-center gap-3">

              <span className="inline-flex rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-sm font-semibold text-brand">
                {
                  statusLabel
                }
              </span>


              <span className="text-sm text-muted-foreground">
                Pendiente de decisión administrativa
              </span>

            </div>


            <h1 className="mt-4 font-serif text-3xl font-semibold">
              {
                recipe.title
              }
            </h1>


            <p className="mt-2 text-sm text-muted-foreground">
              /recipes/
              {
                recipe.slug
              }
            </p>

          </header>


          <div className="mt-6">

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

        </div>

      </main>
    );
  }


  /* =====================================================
     DEFAULT STEP
  ===================================================== */

  const requiredSteps:
    AdminEditorStepKey[] = [
      "basic",
      "servings",
      "classification",
      "ingredients",
      "steps",
      "times",
      "image",
    ];


  const firstIncompleteStep =
    requiredSteps.find(
      (
        step,
      ) =>
        !completion[
          step
        ],
    ) ??
    "publication";


  if (
    !isAdminEditorStep(
      requestedStep,
    )
  ) {
    redirect(
      `/admin/recipes/${recipe.id}/edit?step=${firstIncompleteStep}`,
    );
  }


  const activeStep =
    requestedStep;


  const stepperItems:
    AdminRecipeEditorStep[] =
      editorSteps.map(
        (
          step,
        ) => ({
          key:
            step.key,

          label:
            step.label,

          optional:
            step.optional,

          completed:
            completion[
              step.key
            ],

          current:
            activeStep ===
            step.key,

          href:
            `/admin/recipes/${recipe.id}/edit?step=${step.key}`,
        }),
      );


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">

      <div className="mx-auto w-full max-w-7xl">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-4">

          <Link
            href="/admin/recipes"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a recetas

          </Link>


          <Link
            href={`/admin/recipes/${recipe.id}/preview`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
          >

            <Eye
              className="size-4"
              aria-hidden="true"
            />

            Vista previa

          </Link>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">

          <div className="flex items-start gap-4">

            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-inverse">

              <Settings2
                className="size-6"
                aria-hidden="true"
              />

            </span>


            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-3">

                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                  Editor administrativo
                </p>


                <span className="rounded-full border border-border bg-page-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {
                    statusLabel
                  }
                </span>

              </div>


              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {
                  recipe.title
                }
              </h1>


              <p className="mt-2 text-sm text-muted-foreground">
                /recipes/
                {
                  recipe.slug
                }
              </p>


              <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                Gestiona cada apartado de la receta
                desde un único editor organizado.
                Los cambios se guardan de forma
                independiente en cada sección.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            EDITOR
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">

          <AdminRecipeEditorStepper
            steps={
              stepperItems
            }
          />


          <div className="min-w-0">

            {/* =============================================
                01 BASIC
            ============================================= */}

            {activeStep ===
              "basic" && (
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

                nextStepHref={
                  `/admin/recipes/${recipe.id}/edit?step=servings`
                }
              />
            )}


            {/* =============================================
                02 SERVINGS
            ============================================= */}

            {activeStep ===
              "servings" && (
              <RecipeServingsForm
                recipeId={
                  recipe.id
                }

                initialValue={
                  recipe.base_servings
                }

                previousStepHref={
                  `/admin/recipes/${recipe.id}/edit?step=basic`
                }

                nextStepHref={
                  `/admin/recipes/${recipe.id}/edit?step=classification`
                }
              />
            )}


            {/* =============================================
                03 CLASSIFICATION
            ============================================= */}

            {activeStep ===
              "classification" && (
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

                previousStepHref={
                  `/admin/recipes/${recipe.id}/edit?step=servings`
                }

                nextStepHref={
                  `/admin/recipes/${recipe.id}/edit?step=ingredients`
                }
              />
            )}


            {/* =============================================
                04 INGREDIENTS
            ============================================= */}

            {activeStep ===
              "ingredients" && (
              <RecipeIngredientsForm
                recipeId={
                  recipe.id
                }

                initialGroups={
                  ingredientGroups
                }
              />
            )}


            {/* =============================================
                05 STEPS
            ============================================= */}

            {activeStep ===
              "steps" && (
              <RecipeStepsForm
                recipeId={
                  recipe.id
                }

                initialSteps={
                  recipeSteps
                }
              />
            )}


            {/* =============================================
                06 TIMES
            ============================================= */}

            {activeStep ===
              "times" && (
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
            )}


            {/* =============================================
                07 IMAGE
            ============================================= */}

            {activeStep ===
              "image" && (
              <RecipeImageUploader
                recipeId={
                  recipe.id
                }

                initialImagePath={
                  recipe.image_path
                }
              />
            )}


            {/* =============================================
                08 ADDITIONAL
            ============================================= */}

            {activeStep ===
              "additional" && (
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
            )}


            {/* =============================================
                09 ALLERGENS
            ============================================= */}

            {activeStep ===
              "allergens" && (
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
            )}


            {/* =============================================
                10 PUBLICATION
            ============================================= */}

            {activeStep ===
              "publication" && (
              <div className="space-y-8">

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

          </div>

        </div>

      </div>

    </main>
  );
}