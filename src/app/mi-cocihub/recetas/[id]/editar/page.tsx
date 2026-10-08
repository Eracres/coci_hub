import {
  ArrowLeft,
  ChefHat,
  FilePenLine,
} from "lucide-react";

import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  RecipeEditorStepper,
  type RecipeEditorStep,
} from "@/components/recipes/recipe-editor-stepper";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  getMyRecipeForEditor,
} from "@/services/recipes/community-recipe-service";

import {
  getRecipeClassificationOptions,
  getRecipeClassificationRelations,
  getRecipeIngredients,
  getRecipeSteps,
} from "@/services/recipes/recipe-service";

import {
  BasicInfoForm,
} from "./basic-info-form";

import {
  ClassificationForm,
} from "./classification-form";

import {
  ImageForm,
} from "./image-form";

import {
  IngredientsForm,
} from "./ingredients-form";

import {
  ReviewForm,
} from "./review-form";

import {
  ServingsForm,
} from "./servings-form";

import {
  StepsForm,
} from "./steps-form";

import {
  TimesForm,
} from "./times-form";


type EditorStep =
  | "basic"
  | "servings"
  | "classification"
  | "ingredients"
  | "steps"
  | "times"
  | "image"
  | "review";


type EditMyRecipePageProps = {
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


type RecipeTimesRow = {
  preparation_minutes:
    number | null;

  cooking_minutes:
    number | null;

  additional_minutes:
    number | null;
};


const editorSteps:
  EditorStep[] = [
    "basic",
    "servings",
    "classification",
    "ingredients",
    "steps",
    "times",
    "image",
    "review",
  ];


const stepLabels:
  Record<
    EditorStep,
    string
  > = {
    basic:
      "Información básica",

    servings:
      "Raciones",

    classification:
      "Clasificación",

    ingredients:
      "Ingredientes",

    steps:
      "Elaboración",

    times:
      "Tiempos",

    image:
      "Imagen",

    review:
      "Revisión final",
  };


function isEditorStep(
  value:
    string | undefined,
): value is EditorStep {
  return editorSteps.includes(
    value as EditorStep,
  );
}


export default async function EditMyRecipePage({
  params,
  searchParams,
}: EditMyRecipePageProps) {
  const {
    id,
  } =
    await params;


  const {
    step:
      requestedStep,
  } =
    await searchParams;


  const supabase =
    await createClient();


  // =======================================================
  // AUTHENTICATION
  // =======================================================

  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase
      .auth
      .getClaims();


  const userId =
    claimsData
      ?.claims
      ?.sub;


  if (
    claimsError ||
    !userId
  ) {
    redirect(
      "/login?error=session-required",
    );
  }


  // =======================================================
  // RECIPE
  // =======================================================

  const recipe =
    await getMyRecipeForEditor(
      id,
      userId,
    );


  if (
    !recipe
  ) {
    notFound();
  }


  if (
    recipe.status !==
    "draft"
  ) {
    redirect(
      "/mi-cocihub/recetas",
    );
  }


  // =======================================================
  // RELATIONS + INGREDIENTS + STEPS + TIMES
  // =======================================================

  const [
    classificationRelations,
    ingredientGroups,
    recipeSteps,
    recipeTimesResult,
  ] =
    await Promise.all([
      getRecipeClassificationRelations(
        recipe.id,
      ),

      getRecipeIngredients(
        recipe.id,
      ),

      getRecipeSteps(
        recipe.id,
      ),

      supabase
        .from(
          "recipes",
        )
        .select(`
          preparation_minutes,
          cooking_minutes,
          additional_minutes
        `)
        .eq(
          "id",
          recipe.id,
        )
        .eq(
          "author_id",
          userId,
        )
        .single(),
    ]);


  if (
    recipeTimesResult.error
  ) {
    throw new Error(
      `No se pudieron obtener los tiempos de la receta: ${recipeTimesResult.error.message}`,
    );
  }


  const recipeTimes =
    recipeTimesResult.data as
      RecipeTimesRow;


  // =======================================================
  // IMAGE URL
  // =======================================================

  const imageUrl =
    recipe.image_path
      ? supabase
          .storage
          .from(
            "recipe-images",
          )
          .getPublicUrl(
            recipe.image_path,
          )
          .data
          .publicUrl
      : null;


  // =======================================================
  // REAL COMPLETION
  // =======================================================

  const basicInfoComplete =
    Boolean(
      recipe.title
        .trim(),
    ) &&
    Boolean(
      recipe.slug
        .trim(),
    ) &&
    Boolean(
      recipe
        .short_description
        ?.trim(),
    );


  const servingsComplete =
    recipe.base_servings !==
      null &&
    recipe.base_servings >
      0;


  const classificationComplete =
    Boolean(
      recipe.recipe_type_id,
    ) &&
    Boolean(
      recipe.difficulty,
    ) &&
    classificationRelations
      .categoryIds
      .length >
      0;


  const ingredientCount =
    ingredientGroups.reduce(
      (
        total,
        group,
      ) =>
        total +
        group.ingredients.length,
      0,
    );


  const ingredientsComplete =
    ingredientCount >
    0;


  const stepsComplete =
    recipeSteps.length >
    0;


  const timesComplete =
    recipeTimes
      .preparation_minutes !==
      null &&
    recipeTimes
      .preparation_minutes >
      0 &&
    recipeTimes
      .cooking_minutes !==
      null &&
    recipeTimes
      .additional_minutes !==
      null;


  const imageComplete =
    Boolean(
      recipe.image_path,
    ) &&
    Boolean(
      recipe.image_alt
        ?.trim(),
    );


  // =======================================================
  // TOTAL TIME
  // =======================================================

  const totalMinutes =
    (
      recipeTimes
        .preparation_minutes ??
      0
    ) +
    (
      recipeTimes
        .cooking_minutes ??
      0
    ) +
    (
      recipeTimes
        .additional_minutes ??
      0
    );


  // =======================================================
  // REVIEW CHECKLIST
  // =======================================================

  const reviewChecklist = [
    {
      key:
        "basic",

      label:
        "Información básica",

      complete:
        basicInfoComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=basic`,
    },

    {
      key:
        "servings",

      label:
        "Raciones",

      complete:
        servingsComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=servings`,
    },

    {
      key:
        "classification",

      label:
        "Clasificación",

      complete:
        classificationComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=classification`,
    },

    {
      key:
        "ingredients",

      label:
        "Ingredientes",

      complete:
        ingredientsComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=ingredients`,
    },

    {
      key:
        "steps",

      label:
        "Elaboración",

      complete:
        stepsComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=steps`,
    },

    {
      key:
        "times",

      label:
        "Tiempos",

      complete:
        timesComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=times`,
    },

    {
      key:
        "image",

      label:
        "Imagen",

      complete:
        imageComplete,

      href:
        `/mi-cocihub/recetas/${recipe.id}/editar?step=image`,
    },
  ];


  // =======================================================
  // CAN SUBMIT
  // =======================================================
  //
  // La interfaz utiliza exactamente los mismos apartados
  // que se muestran al usuario.
  //
  // PostgreSQL realizará después la validación definitiva
  // mediante submit_my_recipe_for_review().
  // =======================================================

  const canSubmitForReview =
    reviewChecklist.every(
      (
        item,
      ) =>
        item.complete,
    );


  // =======================================================
  // DEFAULT STEP
  // =======================================================

  let defaultStep:
    EditorStep =
      "review";


  if (
    !basicInfoComplete
  ) {
    defaultStep =
      "basic";

  } else if (
    !servingsComplete
  ) {
    defaultStep =
      "servings";

  } else if (
    !classificationComplete
  ) {
    defaultStep =
      "classification";

  } else if (
    !ingredientsComplete
  ) {
    defaultStep =
      "ingredients";

  } else if (
    !stepsComplete
  ) {
    defaultStep =
      "steps";

  } else if (
    !timesComplete
  ) {
    defaultStep =
      "times";

  } else if (
    !imageComplete
  ) {
    defaultStep =
      "image";
  }


  // =======================================================
  // CURRENT STEP
  // =======================================================

  if (
    !isEditorStep(
      requestedStep,
    )
  ) {
    redirect(
      `/mi-cocihub/recetas/${recipe.id}/editar?step=${defaultStep}`,
    );
  }


  const activeStep =
    requestedStep;


  // =======================================================
  // CLASSIFICATION OPTIONS
  // =======================================================

  const classificationOptions =
    activeStep ===
      "classification"
      ? await getRecipeClassificationOptions()
      : null;


  // =======================================================
  // STEPPER COMPLETION
  // =======================================================

  const completion:
    Record<
      EditorStep,
      boolean
    > = {
    basic:
      basicInfoComplete,

    servings:
      servingsComplete,

    classification:
      classificationComplete,

    ingredients:
      ingredientsComplete,

    steps:
      stepsComplete,

    times:
      timesComplete,

    image:
      imageComplete,

    review:
      false,
  };


  const stepperItems:
    RecipeEditorStep[] =
      editorSteps.map(
        (
          step,
        ) => ({
          key:
            step,

          label:
            stepLabels[
              step
            ],

          href:
            `/mi-cocihub/recetas/${recipe.id}/editar?step=${step}`,

          completed:
            completion[
              step
            ],

          current:
            step ===
            activeStep,
        }),
      );


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <main className="min-h-screen bg-page px-4 py-8 text-foreground">

      <div className="mx-auto w-full max-w-6xl">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/mi-cocihub/recetas"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a Mis recetas
          </Link>


          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium">

            <FilePenLine
              className="size-4 text-brand"
              aria-hidden="true"
            />

            Borrador

          </span>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-inverse">

              <ChefHat
                className="size-6"
                aria-hidden="true"
              />

            </div>


            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
                Editor de recetas
              </p>


              <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
                {
                  recipe.title
                }
              </h1>


              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Completa tu receta paso a paso.
                Puedes moverte libremente entre
                las secciones mientras siga
                siendo un borrador.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            EDITOR
        ================================================= */}

        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          <RecipeEditorStepper
            steps={
              stepperItems
            }
          />


          <div>

            {/* =============================================
                BASIC
            ============================================= */}

            {activeStep ===
              "basic" && (
                <BasicInfoForm
                  recipeId={
                    recipe.id
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=servings`
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
              )}


            {/* =============================================
                SERVINGS
            ============================================= */}

            {activeStep ===
              "servings" && (
                <ServingsForm
                  recipeId={
                    recipe.id
                  }
                  initialValue={
                    recipe.base_servings
                  }
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=basic`
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=classification`
                  }
                />
              )}


            {/* =============================================
                CLASSIFICATION
            ============================================= */}

            {activeStep ===
              "classification" &&
              classificationOptions && (
                <ClassificationForm
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
                  }}
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=servings`
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=ingredients`
                  }
                />
              )}


            {/* =============================================
                INGREDIENTS
            ============================================= */}

            {activeStep ===
              "ingredients" && (
                <IngredientsForm
                  recipeId={
                    recipe.id
                  }
                  initialGroups={
                    ingredientGroups
                  }
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=classification`
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=steps`
                  }
                />
              )}


            {/* =============================================
                STEPS
            ============================================= */}

            {activeStep ===
              "steps" && (
                <StepsForm
                  recipeId={
                    recipe.id
                  }
                  initialSteps={
                    recipeSteps
                  }
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=ingredients`
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=times`
                  }
                />
              )}


            {/* =============================================
                TIMES
            ============================================= */}

            {activeStep ===
              "times" && (
                <TimesForm
                  recipeId={
                    recipe.id
                  }
                  initialValues={{
                    preparationMinutes:
                      recipeTimes
                        .preparation_minutes,

                    cookingMinutes:
                      recipeTimes
                        .cooking_minutes,

                    additionalMinutes:
                      recipeTimes
                        .additional_minutes,
                  }}
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=steps`
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=image`
                  }
                />
              )}


            {/* =============================================
                IMAGE
            ============================================= */}

            {activeStep ===
              "image" && (
                <ImageForm
                  recipeId={
                    recipe.id
                  }
                  initialImagePath={
                    recipe.image_path
                  }
                  initialImageUrl={
                    imageUrl
                  }
                  initialImageAlt={
                    recipe.image_alt
                  }
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=times`
                  }
                  nextStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=review`
                  }
                />
              )}


            {/* =============================================
                REVIEW
            ============================================= */}

            {activeStep ===
              "review" && (
                <ReviewForm
                  recipeId={
                    recipe.id
                  }
                  title={
                    recipe.title
                  }
                  shortDescription={
                    recipe.short_description
                  }
                  imageUrl={
                    imageUrl
                  }
                  imageAlt={
                    recipe.image_alt
                  }
                  baseServings={
                    recipe.base_servings
                  }
                  difficulty={
                    recipe.difficulty
                  }
                  ingredientCount={
                    ingredientCount
                  }
                  stepCount={
                    recipeSteps.length
                  }
                  times={{
                    preparationMinutes:
                      recipeTimes
                        .preparation_minutes,

                    cookingMinutes:
                      recipeTimes
                        .cooking_minutes,

                    additionalMinutes:
                      recipeTimes
                        .additional_minutes,

                    totalMinutes,
                  }}
                  checklist={
                    reviewChecklist
                  }
                  canSubmit={
                    canSubmitForReview
                  }
                  previousStepHref={
                    `/mi-cocihub/recetas/${recipe.id}/editar?step=image`
                  }
                />
              )}

          </div>

        </div>

      </div>

    </main>
  );
}