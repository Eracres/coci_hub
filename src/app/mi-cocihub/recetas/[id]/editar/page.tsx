import {
  ArrowLeft,
  Check,
  FilePenLine,
  UserRound,
} from "lucide-react";

import Image from "next/image";
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

import { AdditionalInfoForm } from "./additional-info-form";
import { BasicInfoForm } from "./basic-info-form";
import { ClassificationForm } from "./classification-form";
import { ImageForm } from "./image-form";
import { IngredientsForm } from "./ingredients-form";
import { ReviewForm } from "./review-form";
import { ServingsForm } from "./servings-form";
import { StepsForm } from "./steps-form";
import { TimesForm } from "./times-form";

/* =========================================================
   TYPES
========================================================= */

type EditorStep =
  | "basic"
  | "servings"
  | "classification"
  | "ingredients"
  | "steps"
  | "times"
  | "image"
  | "additional"
  | "review";

type EditMyRecipePageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    step?: string;
  }>;
};

type RecipeEditorDetailsRow = {
  preparation_minutes: number | null;
  elaboration_minutes: number | null;

  tips: string | null;
  substitutions: string | null;
  storage: string | null;
  freezing: string | null;
  reheating: string | null;

  source_type: string | null;
  source_title: string | null;
  source_author: string | null;
  source_page: string | null;
  source_url: string | null;
  source_notes: string | null;
};

type ProfileRow = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

/* =========================================================
   EDITOR STEPS
========================================================= */

const editorSteps: EditorStep[] = [
  "basic",
  "servings",
  "classification",
  "ingredients",
  "steps",
  "times",
  "image",
  "additional",
  "review",
];

const stepLabels: Record<EditorStep, string> = {
  basic: "Información básica",
  servings: "Raciones",
  classification: "Clasificación",
  ingredients: "Ingredientes",
  steps: "Elaboración",
  times: "Tiempos",
  image: "Imagen",
  additional: "Información adicional",
  review: "Revisar y enviar",
};

/* =========================================================
   HELPERS
========================================================= */

function isEditorStep(
  value: string | undefined,
): value is EditorStep {
  return editorSteps.includes(
    value as EditorStep,
  );
}

function normalizeExternalUrl(
  value: string | null | undefined,
) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

function getMetadataAvatar(claims: unknown) {
  if (
    !claims ||
    typeof claims !== "object"
  ) {
    return null;
  }

  const claimsRecord =
    claims as Record<string, unknown>;

  const metadata =
    claimsRecord.user_metadata;

  if (
    !metadata ||
    typeof metadata !== "object"
  ) {
    return null;
  }

  const metadataRecord =
    metadata as Record<string, unknown>;

  const avatarUrl =
    typeof metadataRecord.avatar_url === "string"
      ? metadataRecord.avatar_url
      : null;

  const picture =
    typeof metadataRecord.picture === "string"
      ? metadataRecord.picture
      : null;

  return (
    normalizeExternalUrl(avatarUrl) ??
    normalizeExternalUrl(picture)
  );
}

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

/* =========================================================
   PAGE
========================================================= */

export default async function EditMyRecipePage({
  params,
  searchParams,
}: EditMyRecipePageProps) {
  const { id } = await params;

  const { step: requestedStep } =
    await searchParams;

  const supabase = await createClient();

  /* =======================================================
     AUTHENTICATION
  ======================================================= */

  const {
    data: claimsData,
    error: claimsError,
  } = await supabase.auth.getClaims();

  const claims =
    claimsData?.claims as
      | Record<string, unknown>
      | undefined;

  const userId =
    typeof claims?.sub === "string"
      ? claims.sub
      : null;

  if (claimsError || !userId) {
    redirect("/login?error=session-required");
  }

  /* =======================================================
     RECIPE
  ======================================================= */

  const recipe =
    await getMyRecipeForEditor(id, userId);

  if (!recipe) {
    notFound();
  }

  if (recipe.status !== "draft") {
    redirect("/mi-cocihub/recetas");
  }

  /* =======================================================
     RECIPE DATA + PROFILE
  ======================================================= */

  const [
    classificationRelations,
    ingredientGroups,
    recipeSteps,
    recipeDetailsResult,
    profileResult,
  ] = await Promise.all([
    getRecipeClassificationRelations(recipe.id),

    getRecipeIngredients(recipe.id),

    getRecipeSteps(recipe.id),

    supabase
      .from("recipes")
      .select(`
        preparation_minutes,
        elaboration_minutes,
        tips,
        substitutions,
        storage,
        freezing,
        reheating,
        source_type,
        source_title,
        source_author,
        source_page,
        source_url,
        source_notes
      `)
      .eq("id", recipe.id)
      .eq("author_id", userId)
      .single(),

    supabase
      .from("profiles")
      .select(
        "display_name, username, avatar_url",
      )
      .eq("id", userId)
      .single(),
  ]);

  if (recipeDetailsResult.error) {
    throw new Error(
      `No se pudieron obtener los datos complementarios de la receta: ${recipeDetailsResult.error.message}`,
    );
  }

  if (
    profileResult.error ||
    !profileResult.data
  ) {
    redirect("/login?error=profile-missing");
  }

  const recipeDetails =
    recipeDetailsResult.data as
      RecipeEditorDetailsRow;

  const profile =
    profileResult.data as ProfileRow;

  if (!profile.username) {
    redirect("/complete-profile");
  }

  /* =======================================================
     PROFILE
  ======================================================= */

  const displayName =
    profile.display_name?.trim() ||
    profile.username;

  const storedAvatar =
    profile.avatar_url?.trim() || null;

  let profileAvatarUrl: string | null = null;

  if (storedAvatar) {
    const externalAvatar =
      normalizeExternalUrl(storedAvatar);

    if (externalAvatar) {
      profileAvatarUrl = externalAvatar;
    } else {
      profileAvatarUrl =
        supabase.storage
          .from("profile-avatars")
          .getPublicUrl(storedAvatar)
          .data.publicUrl;
    }
  }

  const avatarUrl =
    profileAvatarUrl ??
    getMetadataAvatar(claims);

  /* =======================================================
     IMAGE URL
  ======================================================= */

  const imageUrl = recipe.image_path
    ? supabase.storage
        .from("recipe-images")
        .getPublicUrl(recipe.image_path)
        .data.publicUrl
    : null;

  /* =======================================================
     REAL COMPLETION
  ======================================================= */

  const basicInfoComplete =
    Boolean(recipe.title.trim()) &&
    Boolean(recipe.slug.trim()) &&
    Boolean(recipe.short_description?.trim());

  const servingsComplete =
    recipe.base_servings !== null &&
    recipe.base_servings > 0;

  const classificationComplete =
    Boolean(recipe.recipe_type_id) &&
    Boolean(recipe.difficulty) &&
    classificationRelations.categoryIds.length > 0;

  const ingredientCount =
    ingredientGroups.reduce(
      (total, group) =>
        total + group.ingredients.length,
      0,
    );

  const ingredientsComplete =
    ingredientCount > 0;

  const stepsComplete =
    recipeSteps.length > 0;

  /* =======================================================
     TIMES VALIDATION
  ======================================================= */

  const stepDurations = recipeSteps.map(
    (step) => {
      const value =
        step.durationMinutes.trim();

      if (!/^\d+$/.test(value)) {
        return null;
      }

      const duration = Number(value);

      return Number.isSafeInteger(duration) &&
        duration >= 0
        ? duration
        : null;
    },
  );

  const allStepDurationsKnown =
    stepDurations.length > 0 &&
    stepDurations.every(
      (duration) => duration !== null,
    );

  const stepDurationTotal =
    stepDurations.reduce<number>(
      (total, duration) =>
        total + (duration ?? 0),
      0,
    );

  const timesComplete =
    recipeDetails.preparation_minutes !== null &&
    Number.isInteger(
      recipeDetails.preparation_minutes,
    ) &&
    recipeDetails.preparation_minutes >= 1 &&
    recipeDetails.preparation_minutes <= 10080 &&
    recipeDetails.elaboration_minutes !== null &&
    allStepDurationsKnown &&
    recipeDetails.elaboration_minutes ===
      stepDurationTotal;

  /* =======================================================
     IMAGE COMPLETION
  ======================================================= */

  const imageComplete =
    Boolean(recipe.image_path) &&
    Boolean(recipe.image_alt?.trim());

  /* =======================================================
     ADDITIONAL INFORMATION
  ======================================================= */

  const additionalInfoComplete =
    hasText(recipeDetails.tips) ||
    hasText(recipeDetails.substitutions) ||
    hasText(recipeDetails.storage) ||
    hasText(recipeDetails.freezing) ||
    hasText(recipeDetails.reheating) ||
    hasText(recipeDetails.source_type) ||
    hasText(recipeDetails.source_title) ||
    hasText(recipeDetails.source_author) ||
    hasText(recipeDetails.source_page) ||
    hasText(recipeDetails.source_url) ||
    hasText(recipeDetails.source_notes);

  /* =======================================================
     TOTAL TIME
  ======================================================= */

  const totalMinutes =
    (recipeDetails.preparation_minutes ?? 0) +
    (recipeDetails.elaboration_minutes ?? 0);

  /* =======================================================
     REVIEW CHECKLIST
  ======================================================= */

  const reviewChecklist = [
    {
      key: "basic",

      label: "Información básica",

      complete: basicInfoComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=basic`,
    },

    {
      key: "servings",

      label: "Raciones",

      complete: servingsComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=servings`,
    },

    {
      key: "classification",

      label: "Clasificación",

      complete: classificationComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=classification`,
    },

    {
      key: "ingredients",

      label: "Ingredientes",

      complete: ingredientsComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=ingredients`,
    },

    {
      key: "steps",

      label: "Elaboración",

      complete: stepsComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=steps`,
    },

    {
      key: "times",

      label: "Tiempos",

      complete: timesComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=times`,
    },

    {
      key: "image",

      label: "Imagen",

      complete: imageComplete,

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=image`,
    },
  ];

  /* =======================================================
     REQUIRED PROGRESS
  ======================================================= */

  const requiredTotal =
    reviewChecklist.length;

  const completedRequired =
    reviewChecklist.filter(
      (item) => item.complete,
    ).length;

  const progressPercentage = Math.round(
    (completedRequired / requiredTotal) * 100,
  );

  /* =======================================================
     CAN SUBMIT
  ======================================================= */

  const canSubmitForReview =
    reviewChecklist.every(
      (item) => item.complete,
    );

  /* =======================================================
     DEFAULT STEP
  ======================================================= */

  let defaultStep: EditorStep = "review";

  if (!basicInfoComplete) {
    defaultStep = "basic";
  } else if (!servingsComplete) {
    defaultStep = "servings";
  } else if (!classificationComplete) {
    defaultStep = "classification";
  } else if (!ingredientsComplete) {
    defaultStep = "ingredients";
  } else if (!stepsComplete) {
    defaultStep = "steps";
  } else if (!timesComplete) {
    defaultStep = "times";
  } else if (!imageComplete) {
    defaultStep = "image";
  }

  /* =======================================================
     CURRENT STEP
  ======================================================= */

  if (!isEditorStep(requestedStep)) {
    redirect(
      `/mi-cocihub/recetas/${recipe.id}/editar?step=${defaultStep}`,
    );
  }

  const activeStep = requestedStep;

  /* =======================================================
     CLASSIFICATION OPTIONS
  ======================================================= */

  const classificationOptions =
    activeStep === "classification"
      ? await getRecipeClassificationOptions()
      : null;

  /* =======================================================
     STEPPER
  ======================================================= */

  const completion: Record<EditorStep, boolean> = {
    basic: basicInfoComplete,

    servings: servingsComplete,

    classification: classificationComplete,

    ingredients: ingredientsComplete,

    steps: stepsComplete,

    times: timesComplete,

    image: imageComplete,

    additional: additionalInfoComplete,

    review: false,
  };

  const stepperItems: RecipeEditorStep[] =
    editorSteps.map((step) => ({
      key: step,

      label: stepLabels[step],

      href: `/mi-cocihub/recetas/${recipe.id}/editar?step=${step}`,

      completed: completion[step],

      current: step === activeStep,

      optional: step === "additional",

      final: step === "review",
    }));

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-page text-foreground">

      {/* PERSONAL NAVIGATION */}

      <header className="border-b border-border bg-surface/95 shadow-sm">

        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >

            <Image
              src="/brand/cocihub-logo.png"
              alt="CociHub"
              width={154}
              height={54}
              priority
              className="h-auto w-[142px]"
            />

          </Link>

          <nav
            className="hidden items-center rounded-2xl border border-border bg-surface px-2 py-1 shadow-sm lg:flex"
            aria-label="Navegación principal"
          >

            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Inicio
            </Link>

            <Link
              href="/recipes"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Recetas
            </Link>

            <Link
              href="/categories"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Categorías
            </Link>

            <Link
              href="/about"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-page-muted hover:text-brand"
            >
              Sobre CociHub
            </Link>

          </nav>

          <div className="flex items-center gap-3">

            <Link
              href="/mi-cocihub/recetas"
              className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-page-muted sm:inline-flex"
            >
              Mis recetas
            </Link>

            <Link
              href="/mi-cocihub/perfil"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 shadow-sm transition hover:bg-page-muted"
            >

              <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-page-muted">

                {avatarUrl ? (

                  /* eslint-disable-next-line @next/next/no-img-element */

                  <img
                    src={avatarUrl}
                    alt=""
                    className="size-full object-cover"
                  />

                ) : (

                  <UserRound
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />

                )}

              </span>

              <span className="hidden text-left sm:block">

                <span className="block text-[10px] leading-none text-muted-foreground">
                  Hola,
                </span>

                <span className="mt-0.5 block max-w-28 truncate text-sm font-semibold leading-none">

                  {displayName}

                </span>

              </span>

            </Link>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* BACK */}

        <Link
          href="/mi-cocihub/recetas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-brand"
        >

          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Volver a Mis recetas

        </Link>

        {/* EDITOR HEADER */}

        <section className="mt-5 grid gap-6 border-b border-border pb-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">

          <div className="flex min-w-0 items-center gap-5">

            <span className="flex size-24 shrink-0 items-center justify-center rounded-[1.6rem] border border-brand/15 bg-brand/[0.04] shadow-sm">

              <Image
                src="/brand/cocihub-mark-outline.png"
                alt=""
                width={68}
                height={68}
                className="size-[68px] object-contain"
                aria-hidden="true"
              />

            </span>

            <div className="min-w-0">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                Editor de recetas
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">

                <h1 className="min-w-0 font-serif text-4xl font-bold tracking-tight sm:text-5xl">

                  {recipe.title}

                </h1>

                <span className="inline-flex items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-warning">

                  <FilePenLine
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  Borrador

                </span>

              </div>

              <p className="mt-3 max-w-3xl font-serif text-base italic leading-7 text-muted-foreground">
                Completa tu receta paso a paso.
                Puedes editarla en cualquier momento
                antes de enviarla a revisión.
              </p>

            </div>

          </div>

          {/* REQUIRED PROGRESS */}

          <div className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">

            <div className="flex items-center justify-between gap-4">

              <div className="flex items-center gap-2.5">

                <span className="flex size-7 items-center justify-center rounded-full bg-secondary-hover text-inverse">

                  <Check
                    className="size-4"
                    aria-hidden="true"
                  />

                </span>

                <p className="text-sm font-bold">

                  {completedRequired} de{" "}
                  {requiredTotal} apartados
                  obligatorios

                </p>

              </div>

              <span className="rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-sm font-bold text-secondary-hover">

                {progressPercentage} %

              </span>

            </div>

            <div
              className="mt-4 h-3 overflow-hidden rounded-full bg-page-muted"
              role="progressbar"
              aria-label="Progreso de la receta"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercentage}
            >

              <div
                className="h-full rounded-full bg-secondary-hover transition-[width]"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

          </div>

        </section>

        {/* EDITOR */}

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">

          <RecipeEditorStepper
            steps={stepperItems}
          />

          <div className="min-w-0">

            {/* 01 BASIC */}

            {activeStep === "basic" ? (

              <BasicInfoForm
                recipeId={recipe.id}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=servings`}
                initialValues={{
                  title: recipe.title,

                  slug: recipe.slug,

                  shortDescription:
                    recipe.short_description,

                  introduction:
                    recipe.introduction,
                }}
              />

            ) : null}

            {/* 02 SERVINGS */}

            {activeStep === "servings" ? (

              <ServingsForm
                recipeId={recipe.id}
                initialValue={
                  recipe.base_servings
                }
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=basic`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=classification`}
              />

            ) : null}

            {/* 03 CLASSIFICATION */}

            {activeStep === "classification" &&
            classificationOptions ? (

              <ClassificationForm
                recipeId={recipe.id}
                recipeTypes={
                  classificationOptions.recipeTypes
                }
                categories={
                  classificationOptions.categories
                }
                tags={
                  classificationOptions.tags
                }
                initialValues={{
                  recipeTypeId:
                    recipe.recipe_type_id,

                  difficulty:
                    recipe.difficulty,

                  categoryIds:
                    classificationRelations.categoryIds,

                  tagIds:
                    classificationRelations.tagIds,
                }}
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=servings`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=ingredients`}
              />

            ) : null}

            {/* 04 INGREDIENTS */}

            {activeStep === "ingredients" ? (

              <IngredientsForm
                recipeId={recipe.id}
                initialGroups={ingredientGroups}
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=classification`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=steps`}
              />

            ) : null}

            {/* 05 STEPS */}

            {activeStep === "steps" ? (

              <StepsForm
                recipeId={recipe.id}
                initialSteps={recipeSteps}
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=ingredients`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=times`}
              />

            ) : null}

            {/* 06 TIMES */}

            {activeStep === "times" ? (

              <TimesForm
                recipeId={recipe.id}
                recipeSteps={recipeSteps}
                initialValues={{
                  preparationMinutes:
                    recipeDetails.preparation_minutes,

                  elaborationMinutes:
                    recipeDetails.elaboration_minutes,
                }}
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=steps`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=image`}
              />

            ) : null}

            {/* 07 IMAGE */}

            {activeStep === "image" ? (

              <ImageForm
                recipeId={recipe.id}
                initialImagePath={
                  recipe.image_path
                }
                initialImageUrl={imageUrl}
                initialImageAlt={
                  recipe.image_alt
                }
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=times`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=additional`}
              />

            ) : null}

            {/* 08 ADDITIONAL INFO */}

            {activeStep === "additional" ? (

              <AdditionalInfoForm
                recipeId={recipe.id}
                initialValues={{
                  tips:
                    recipeDetails.tips,

                  substitutions:
                    recipeDetails.substitutions,

                  storage:
                    recipeDetails.storage,

                  freezing:
                    recipeDetails.freezing,

                  reheating:
                    recipeDetails.reheating,

                  sourceType:
                    recipeDetails.source_type,

                  sourceTitle:
                    recipeDetails.source_title,

                  sourceAuthor:
                    recipeDetails.source_author,

                  sourcePage:
                    recipeDetails.source_page,

                  sourceUrl:
                    recipeDetails.source_url,

                  sourceNotes:
                    recipeDetails.source_notes,
                }}
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=image`}
                nextStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=review`}
              />

            ) : null}

            {/* 09 REVIEW */}

            {activeStep === "review" ? (

              <ReviewForm
                recipeId={recipe.id}
                title={recipe.title}
                shortDescription={
                  recipe.short_description
                }
                imageUrl={imageUrl}
                imageAlt={recipe.image_alt}
                baseServings={
                  recipe.base_servings
                }
                difficulty={recipe.difficulty}
                ingredientCount={ingredientCount}
                stepCount={recipeSteps.length}
                times={{
                  preparationMinutes:
                    recipeDetails.preparation_minutes,

                  elaborationMinutes:
                    recipeDetails.elaboration_minutes,

                  totalMinutes,
                }}
                checklist={reviewChecklist}
                canSubmit={canSubmitForReview}
                previousStepHref={`/mi-cocihub/recetas/${recipe.id}/editar?step=additional`}
              />

            ) : null}

          </div>

        </div>

      </div>

    </main>
  );
}