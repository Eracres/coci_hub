import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChefHat,
  Clock3,
  Flame,
  Lightbulb,
  MessageCircle,
  Snowflake,
  Star,
  Tag,
  Timer,
  TriangleAlert,
  Users,
} from "lucide-react";

import {
  RecipeCommentsSection,
} from "@/components/recipes/recipe-comments-section";

import {
  RecipeIngredients,
} from "@/components/recipes/recipe-ingredients";

import {
  RecipeRatingSummary,
} from "@/components/recipes/recipe-rating-summary";

import {
  RecipeShareActions,
} from "@/components/recipes/recipe-share-actions";

import {
  getRelatedPublishedRecipes,
} from "@/services/recipes/public-related-recipe-service";

import {
  getPublishedRecipeBySlug,
} from "@/services/recipes/public-recipe-service";

import type {
  PublicRecipeDetail,
  PublicRecipeDifficulty,
  PublicRecipeSourceType,
} from "@/types/public-recipe";


type RecipePageProps = {
  params:
    Promise<{
      slug:
        string;
    }>;
};


/* =========================================================
   HELPERS
========================================================= */

function getDifficultyLabel(
  difficulty:
    PublicRecipeDifficulty | null,
) {
  switch (
    difficulty
  ) {
    case "easy":
      return "Fácil";

    case "medium":
      return "Media";

    case "hard":
      return "Difícil";

    default:
      return null;
  }
}


function getSourceTypeLabel(
  sourceType:
    PublicRecipeSourceType | null,
) {
  switch (
    sourceType
  ) {
    case "own":
      return "Receta propia";

    case "family":
      return "Receta familiar";

    case "book":
      return "Libro";

    case "magazine":
      return "Revista";

    case "web":
      return "Web";

    case "handwritten":
      return "Receta manuscrita";

    case "other":
      return "Otra fuente";

    default:
      return null;
  }
}


function formatMinutes(
  minutes:
    number,
) {
  if (
    minutes <
    60
  ) {
    return `${minutes} min`;
  }


  const hours =
    Math.floor(
      minutes /
        60,
    );


  const remainingMinutes =
    minutes %
    60;


  if (
    remainingMinutes ===
    0
  ) {
    return `${hours} h`;
  }


  return `${hours} h ${remainingMinutes} min`;
}


function hasAdditionalInfo(
  recipe:
    PublicRecipeDetail,
) {
  return Boolean(
    recipe.tips ||
      recipe.substitutions ||
      recipe.storage ||
      recipe.freezing ||
      recipe.reheating,
  );
}


function hasSource(
  recipe:
    PublicRecipeDetail,
) {
  return Boolean(
    recipe.sourceType ||
      recipe.sourceTitle ||
      recipe.sourceAuthor ||
      recipe.sourcePage ||
      recipe.sourceUrl ||
      recipe.sourceNotes,
  );
}


/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const recipe =
    await getPublishedRecipeBySlug(
      slug,
    );


  if (
    !recipe
  ) {
    return {
      title:
        "Receta no encontrada",
    };
  }


  return {
    title:
      recipe.title,

    description:
      recipe.shortDescription ??
      `Descubre cómo preparar ${recipe.title} en CociHub.`,
  };
}


/* =========================================================
   PAGE
========================================================= */

export default async function RecipePage({
  params,
}: RecipePageProps) {
  const {
    slug,
  } =
    await params;


  const recipe =
    await getPublishedRecipeBySlug(
      slug,
    );


  if (
    !recipe
  ) {
    notFound();
  }


  const relatedRecipes =
    await getRelatedPublishedRecipes(
      recipe,
      3,
    );


  const difficultyLabel =
    getDifficultyLabel(
      recipe.difficulty,
    );


  const sourceTypeLabel =
    getSourceTypeLabel(
      recipe.sourceType,
    );


  const additionalInfo =
    hasAdditionalInfo(
      recipe,
    );


  const sourceAvailable =
    hasSource(
      recipe,
    );


  return (
    <main className="pb-14 md:pb-16">
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="border-b border-border bg-page-muted/30">
        <div className="mx-auto w-full max-w-[1660px] px-4 py-4 sm:px-5 lg:px-6 xl:px-8 2xl:px-10 md:py-5">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-foreground transition hover:bg-surface/70 hover:text-brand"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a recetas
          </Link>


          <article className="mt-2 overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <header className="grid items-stretch lg:grid-cols-[minmax(0,1.24fr)_minmax(500px,0.76fr)] xl:grid-cols-[minmax(0,1.26fr)_minmax(520px,0.74fr)]">
              {/* ===========================================
                  IMAGE
              =========================================== */}

              <div
                className="
                  relative
                  min-h-[300px]
                  bg-surface

                  sm:min-h-[340px]

                  lg:min-h-[390px]

                  xl:min-h-[410px]
                "
              >
                {/* MOBILE IMAGE */}

                <div className="absolute inset-0 lg:hidden">
                  {recipe.imageUrl ? (
                    <Image
                      src={
                        recipe.imageUrl
                      }
                      alt={
                        recipe.imageAlt ??
                        recipe.title
                      }
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-8 text-center">
                      <div>
                        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <ChefHat
                            className="size-7"
                            aria-hidden="true"
                          />
                        </span>


                        <p className="mt-4 text-sm text-muted-foreground">
                          Imagen no disponible
                        </p>
                      </div>
                    </div>
                  )}
                </div>


                {/* DESKTOP IMAGE */}

                <div
                  className="absolute inset-0 hidden lg:block"
                  style={{
                    WebkitMaskImage:
                      'url("/masks/recipe-hero-curve.svg")',

                    maskImage:
                      'url("/masks/recipe-hero-curve.svg")',

                    WebkitMaskRepeat:
                      "no-repeat",

                    maskRepeat:
                      "no-repeat",

                    WebkitMaskSize:
                      "100% 100%",

                    maskSize:
                      "100% 100%",

                    WebkitMaskPosition:
                      "center",

                    maskPosition:
                      "center",
                  }}
                >
                  {recipe.imageUrl ? (
                    <Image
                      src={
                        recipe.imageUrl
                      }
                      alt={
                        recipe.imageAlt ??
                        recipe.title
                      }
                      fill
                      priority
                      sizes="(min-width: 1280px) 62vw, (min-width: 1024px) 61vw, 100vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-8 text-center">
                      <div>
                        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                          <ChefHat
                            className="size-7"
                            aria-hidden="true"
                          />
                        </span>


                        <p className="mt-4 text-sm text-muted-foreground">
                          Imagen no disponible
                        </p>
                      </div>
                    </div>
                  )}
                </div>


                {recipe.featured ? (
                  <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/60 bg-surface/95 px-4 py-2 text-xs font-semibold text-brand shadow-sm backdrop-blur-sm">
                    <Star
                      className="size-3.5 fill-accent text-accent"
                      aria-hidden="true"
                    />

                    Destacada
                  </span>
                ) : null}
              </div>


              {/* ===========================================
                  HERO INFORMATION
              =========================================== */}

              <div className="flex min-h-full flex-col justify-center bg-surface px-6 py-6 lg:pl-8 lg:pr-7 xl:px-10">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {recipe.recipeType ? (
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
                      {
                        recipe.recipeType
                          .name
                      }
                    </span>
                  ) : null}


                  {recipe.categories.map(
                    (
                      category,
                      index,
                    ) => (
                      <span
                        key={
                          category.id
                        }
                        className="inline-flex items-center gap-3"
                      >
                        {(recipe.recipeType ||
                          index >
                            0) ? (
                          <span
                            className="size-1 rounded-full bg-border-strong"
                            aria-hidden="true"
                          />
                        ) : null}


                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {
                            category.name
                          }
                        </span>
                      </span>
                    ),
                  )}
                </div>


                <h1 className="mt-3 font-serif text-4xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-5xl xl:text-[3.5rem]">
                  {
                    recipe.title
                  }
                </h1>


                {recipe.shortDescription ? (
                  <p className="mt-3 max-w-none font-serif text-base italic leading-6 text-muted-foreground sm:text-lg">
                    {
                      recipe.shortDescription
                    }
                  </p>
                ) : null}


                <div className="mt-3">
                  <RecipeRatingSummary
                    recipeId={
                      recipe.id
                    }
                  />
                </div>


                <div className="mt-3 grid overflow-hidden rounded-xl border border-border bg-page shadow-sm sm:grid-cols-3">
                  {recipe.totalMinutes >
                  0 ? (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 sm:border-r sm:border-border">
                      <Clock3
                        className="size-4 shrink-0 text-brand"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Tiempo
                        </p>

                        <p className="font-serif text-base font-bold leading-tight text-foreground">
                          {formatMinutes(
                            recipe.totalMinutes,
                          )}
                        </p>
                      </div>
                    </div>
                  ) : null}


                  {recipe.baseServings ? (
                    <div className="flex items-center gap-2.5 border-t border-border px-3 py-2.5 sm:border-r sm:border-t-0">
                      <Users
                        className="size-4 shrink-0 text-secondary-hover"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Raciones
                        </p>

                        <p className="font-serif text-base font-bold leading-tight text-foreground">
                          {
                            recipe.baseServings
                          }
                        </p>
                      </div>
                    </div>
                  ) : null}


                  {difficultyLabel ? (
                    <div className="flex items-center gap-2.5 border-t border-border px-3 py-2.5 sm:border-t-0">
                      <ChefHat
                        className="size-4 shrink-0 text-accent"
                        aria-hidden="true"
                      />

                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Dificultad
                        </p>

                        <p className="font-serif text-base font-bold leading-tight text-foreground">
                          {
                            difficultyLabel
                          }
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>


                <div className="mt-3 border-t border-border pt-3">
                  <RecipeShareActions
                    title={
                      recipe.title
                    }
                  />
                </div>
              </div>
            </header>
          </article>
        </div>
      </section>


      {/* ===================================================
          INTRODUCTION
      =================================================== */}

      {recipe.introduction ? (
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-[1580px] px-4 py-4 sm:px-5 lg:px-6 xl:px-8 md:py-5">
            <div className="grid gap-3 md:grid-cols-[235px_minmax(0,1fr)] md:items-start md:gap-8">
              <div className="flex items-center gap-3">
                <span
                  className="h-7 w-1 rounded-full bg-brand"
                  aria-hidden="true"
                />

                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Sobre esta receta
                </h2>
              </div>


              <p className="whitespace-pre-line font-serif text-base leading-7 text-muted-foreground">
                {
                  recipe.introduction
                }
              </p>
            </div>
          </div>
        </section>
      ) : null}


      {/* ===================================================
          RECIPE BODY
      =================================================== */}

      <div className="mx-auto w-full max-w-[1580px] px-4 pt-6 sm:px-5 lg:px-6 xl:px-8 md:pt-7">
        <div className="grid items-start gap-7 lg:grid-cols-[440px_minmax(0,1fr)] xl:grid-cols-[480px_minmax(0,1fr)] 2xl:grid-cols-[500px_minmax(0,1fr)]">
          {/* =============================================
              LEFT: INGREDIENTS
          ============================================= */}

          <aside>
            <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <header className="flex items-center gap-3 border-b border-border bg-page-muted/40 px-5 py-3">
                <ChefHat
                  className="size-5 text-brand"
                  aria-hidden="true"
                />

                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Ingredientes
                </h2>
              </header>


              <div className="p-4 md:p-5">
                <RecipeIngredients
                  baseServings={
                    recipe.baseServings
                  }
                  ingredientGroups={
                    recipe.ingredientGroups
                  }
                />


                {(recipe.preparationMinutes ||
                  recipe.elaborationMinutes ||
                  recipe.totalMinutes >
                    0) ? (
                  <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
                    {recipe.preparationMinutes ? (
                      <div>
                        <dt className="text-muted-foreground">
                          Preparación
                        </dt>

                        <dd className="mt-0.5 font-semibold text-foreground">
                          {formatMinutes(
                            recipe.preparationMinutes,
                          )}
                        </dd>
                      </div>
                    ) : null}


                    {recipe.elaborationMinutes ? (
                      <div>
                        <dt className="text-muted-foreground">
                          Elaboración
                        </dt>

                        <dd className="mt-0.5 font-semibold text-foreground">
                          {formatMinutes(
                            recipe.elaborationMinutes,
                          )}
                        </dd>
                      </div>
                    ) : null}


                    {recipe.totalMinutes >
                    0 ? (
                      <div>
                        <dt className="text-muted-foreground">
                          Total
                        </dt>

                        <dd className="mt-0.5 font-bold text-brand">
                          {formatMinutes(
                            recipe.totalMinutes,
                          )}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}


                {recipe.allergens.length >
                0 ? (
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <TriangleAlert
                        className="size-4 text-warning"
                        aria-hidden="true"
                      />

                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-warning">
                        Alérgenos
                      </p>
                    </div>


                    <div className="mt-2 flex flex-wrap gap-2">
                      {recipe.allergens.map(
                        (
                          allergen,
                        ) => (
                          <span
                            key={
                              allergen.id
                            }
                            className="rounded-full border border-warning/20 bg-warning/5 px-3 py-1.5 text-xs"
                          >
                            <strong className="font-semibold text-foreground">
                              {
                                allergen.name
                              }
                            </strong>

                            <span className="ml-1 text-muted-foreground">
                              ·{" "}
                              {allergen.presence ===
                              "present"
                                ? "Contiene"
                                : "Puede contener"}
                            </span>
                          </span>
                        ),
                      )}
                    </div>


                    <p className="mt-2 text-[10px] leading-4 text-muted-foreground">
                      Información
                      orientativa.
                      Comprueba siempre
                      el etiquetado de
                      los productos.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </aside>


          {/* =============================================
              RIGHT COLUMN
          ============================================= */}

          <div className="min-w-0">
            <section>
              <header className="flex items-center gap-4">
                <div className="flex shrink-0 items-center gap-3">
                  <Flame
                    className="size-5 text-brand"
                    aria-hidden="true"
                  />

                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Elaboración
                  </h2>
                </div>


                <div
                  className="h-px flex-1 bg-border"
                  aria-hidden="true"
                />
              </header>


              {recipe.steps.length >
              0 ? (
                <ol className="mt-2">
                  {recipe.steps.map(
                    (
                      step,
                      index,
                    ) => (
                      <li
                        key={
                          step.id
                        }
                        className="relative grid grid-cols-[38px_minmax(0,1fr)] gap-4 border-b border-border py-3 first:pt-2 last:border-b-0"
                      >
                        <div className="relative">
                          <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-inverse shadow-sm">
                            {
                              index +
                              1
                            }
                          </span>


                          {index <
                          recipe.steps.length -
                            1 ? (
                            <span
                              className="absolute bottom-[-0.75rem] left-[15px] top-8 w-px bg-border"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>


                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            {step.title ? (
                              <h3 className="font-serif text-xl font-bold leading-tight text-foreground">
                                {
                                  step.title
                                }
                              </h3>
                            ) : null}


                            {step.durationMinutes ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-page-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                                <Timer
                                  className="size-3 text-brand"
                                  aria-hidden="true"
                                />

                                {
                                  step.durationMinutes
                                }{" "}
                                min
                              </span>
                            ) : null}
                          </div>


                          <p className="mt-1 whitespace-pre-line text-sm leading-[1.55rem] text-muted-foreground md:text-[0.95rem]">
                            {
                              step.instructions
                            }
                          </p>


                          {step.tip ? (
                            <aside className="mt-2.5 flex gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5">
                              <Lightbulb
                                className="mt-0.5 size-4 shrink-0 text-warning"
                                aria-hidden="true"
                              />

                              <div>
                                <span className="text-xs font-bold text-warning">
                                  Consejo
                                </span>

                                <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                                  {
                                    step.tip
                                  }
                                </p>
                              </div>
                            </aside>
                          ) : null}
                        </div>
                      </li>
                    ),
                  )}
                </ol>
              ) : (
                <p className="mt-5 text-muted-foreground">
                  No hay pasos de
                  elaboración
                  disponibles.
                </p>
              )}
            </section>


            {additionalInfo ? (
              <section className="mt-7 border-t border-border pt-6">
                <div className="flex items-center gap-3">
                  <span
                    className="h-7 w-1 rounded-full bg-accent"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary-hover">
                      Para tener en cuenta
                    </p>

                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      Información útil
                    </h2>
                  </div>
                </div>


                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {recipe.tips ? (
                    <article className="rounded-xl border border-accent/20 bg-accent/5 p-3">
                      <Lightbulb
                        className="size-4 text-warning"
                        aria-hidden="true"
                      />

                      <h3 className="mt-2 font-serif text-base font-bold text-foreground">
                        Consejos
                      </h3>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                        {
                          recipe.tips
                        }
                      </p>
                    </article>
                  ) : null}


                  {recipe.substitutions ? (
                    <article className="rounded-xl border border-brand/15 bg-brand/5 p-3">
                      <Tag
                        className="size-4 text-brand"
                        aria-hidden="true"
                      />

                      <h3 className="mt-2 font-serif text-base font-bold text-foreground">
                        Sustituciones
                      </h3>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                        {
                          recipe.substitutions
                        }
                      </p>
                    </article>
                  ) : null}


                  {recipe.storage ? (
                    <article className="rounded-xl border border-secondary/20 bg-secondary/5 p-3">
                      <BookOpen
                        className="size-4 text-secondary-hover"
                        aria-hidden="true"
                      />

                      <h3 className="mt-2 font-serif text-base font-bold text-foreground">
                        Conservación
                      </h3>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                        {
                          recipe.storage
                        }
                      </p>
                    </article>
                  ) : null}


                  {recipe.freezing ? (
                    <article className="rounded-xl border border-info/20 bg-info/5 p-3">
                      <Snowflake
                        className="size-4 text-info"
                        aria-hidden="true"
                      />

                      <h3 className="mt-2 font-serif text-base font-bold text-foreground">
                        Congelación
                      </h3>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                        {
                          recipe.freezing
                        }
                      </p>
                    </article>
                  ) : null}


                  {recipe.reheating ? (
                    <article className="rounded-xl border border-brand/20 bg-brand/5 p-3">
                      <Flame
                        className="size-4 text-brand"
                        aria-hidden="true"
                      />

                      <h3 className="mt-2 font-serif text-base font-bold text-foreground">
                        Recalentado
                      </h3>

                      <p className="mt-1 whitespace-pre-line text-xs leading-5 text-muted-foreground">
                        {
                          recipe.reheating
                        }
                      </p>
                    </article>
                  ) : null}
                </div>
              </section>
            ) : null}


            {sourceAvailable ? (
              <section className="mt-6 rounded-2xl border border-border bg-page-muted/40 px-5 py-4">
                <div className="flex gap-3">
                  <BookOpen
                    className="mt-0.5 size-5 shrink-0 text-brand"
                    aria-hidden="true"
                  />


                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-foreground">
                        Procedencia de la receta
                      </h2>


                      {sourceTypeLabel ? (
                        <span className="rounded-full border border-brand/15 bg-brand/5 px-2.5 py-1 text-[10px] font-semibold text-brand">
                          {
                            sourceTypeLabel
                          }
                        </span>
                      ) : null}
                    </div>


                    {recipe.sourceTitle ? (
                      <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                        {
                          recipe.sourceTitle
                        }
                      </p>
                    ) : null}


                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {recipe.sourceAuthor ? (
                        <span>
                          Autor:{" "}
                          {
                            recipe.sourceAuthor
                          }
                        </span>
                      ) : null}


                      {recipe.sourcePage ? (
                        <span>
                          Página:{" "}
                          {
                            recipe.sourcePage
                          }
                        </span>
                      ) : null}
                    </div>


                    {recipe.sourceNotes ? (
                      <p className="mt-2 max-w-4xl whitespace-pre-line text-xs leading-5 text-muted-foreground">
                        {
                          recipe.sourceNotes
                        }
                      </p>
                    ) : null}


                    {recipe.sourceUrl ? (
                      <a
                        href={
                          recipe.sourceUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand transition hover:text-brand-hover"
                      >
                        Consultar fuente

                        <ArrowRight
                          className="size-3.5 -rotate-45"
                          aria-hidden="true"
                        />
                      </a>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}


            <section className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 marker:hidden transition hover:bg-brand/[0.025]">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <MessageCircle
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>


                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-brand">
                        Comunidad CociHub
                      </p>


                      <h2 className="mt-0.5 font-serif text-lg font-bold text-foreground">
                        Comentarios de la comunidad
                      </h2>


                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Lee lo que opinan
                        otros cocineros o
                        comparte cómo te ha
                        quedado la receta.
                      </p>
                    </div>
                  </div>


                  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-2.5 text-xs font-semibold text-brand transition group-hover:bg-brand/10 group-open:bg-brand group-open:text-inverse">
                    Ver comentarios

                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-open:rotate-90"
                      aria-hidden="true"
                    />
                  </span>
                </summary>


                <div className="border-t border-border bg-page/40 px-5 pb-5 pt-1 md:px-6">
                  <RecipeCommentsSection
                    recipeId={
                      recipe.id
                    }
                  />
                </div>
              </details>
            </section>


            {relatedRecipes.length >
            0 ? (
              <section className="mt-6 border-t border-border pt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Star
                        className="size-4 text-brand"
                        aria-hidden="true"
                      />

                      <h2 className="font-serif text-2xl font-bold text-foreground">
                        También te puede gustar
                      </h2>
                    </div>


                    <p className="mt-1 text-xs text-muted-foreground">
                      Más ideas relacionadas
                      para seguir cocinando.
                    </p>
                  </div>


                  <Link
                    href="/recipes"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-brand transition hover:text-brand-hover"
                  >
                    Ver todas

                    <ArrowRight
                      className="size-3.5"
                      aria-hidden="true"
                    />
                  </Link>
                </div>


                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {relatedRecipes.map(
                    (
                      relatedRecipe,
                    ) => (
                      <Link
                        key={
                          relatedRecipe.id
                        }
                        href={`/recipes/${relatedRecipe.slug}`}
                        className="group grid min-h-24 grid-cols-[105px_minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
                      >
                        <div className="relative bg-page-muted">
                          {relatedRecipe.imageUrl ? (
                            <Image
                              src={
                                relatedRecipe.imageUrl
                              }
                              alt={
                                relatedRecipe.title
                              }
                              fill
                              sizes="105px"
                              className="object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ChefHat
                                className="size-5 text-muted-foreground"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </div>


                        <div className="flex min-w-0 flex-col justify-center p-3">
                          <h3 className="line-clamp-2 font-serif text-sm font-bold leading-tight text-foreground transition group-hover:text-brand">
                            {
                              relatedRecipe.title
                            }
                          </h3>


                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                            {relatedRecipe.totalMinutes >
                            0 ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock3
                                  className="size-3 text-brand"
                                  aria-hidden="true"
                                />

                                {formatMinutes(
                                  relatedRecipe.totalMinutes,
                                )}
                              </span>
                            ) : null}


                            {relatedRecipe.baseServings ? (
                              <span className="inline-flex items-center gap-1">
                                <Users
                                  className="size-3 text-secondary-hover"
                                  aria-hidden="true"
                                />

                                {
                                  relatedRecipe.baseServings
                                }
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}