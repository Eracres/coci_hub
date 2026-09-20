/* eslint-disable @next/next/no-img-element */

import type {
  Metadata,
} from "next";

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
  Snowflake,
  Star,
  Tag,
  Timer,
  TriangleAlert,
  Users,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";

import {
  RecipeCard,
} from "@/components/recipes/recipe-card";

import {
  RecipeIngredients,
} from "@/components/recipes/recipe-ingredients";

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
      slug: string;
    }>;
};


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
  minutes: number,
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


  if (!recipe) {
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


  if (!recipe) {
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
    <main className="pb-20 md:pb-24">
      <section className="border-b border-border bg-page-muted/40">
        <Container className="py-8 md:py-10">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-brand-hover"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver a recetas
          </Link>


          <article className="mt-5">
            <header className="grid overflow-hidden rounded-3xl border border-border bg-surface shadow-lg lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="relative min-h-[300px] overflow-hidden bg-page-muted sm:min-h-[400px] lg:min-h-[520px]">
                {recipe.imageUrl ? (
                  <img
                    src={
                      recipe.imageUrl
                    }
                    alt={
                      recipe.imageAlt ??
                      recipe.title
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[300px] items-center justify-center p-8 text-center">
                    <div>
                      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                        <ChefHat
                          className="size-8"
                          aria-hidden="true"
                        />
                      </span>

                      <p className="mt-4 text-sm text-muted-foreground">
                        Imagen no
                        disponible
                      </p>
                    </div>
                  </div>
                )}


                {recipe.featured ? (
                  <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-surface/95 px-3 py-1.5 text-xs font-semibold text-brand shadow-sm backdrop-blur-sm">
                    <Star
                      className="size-3.5 fill-accent text-accent"
                      aria-hidden="true"
                    />

                    Destacada
                  </div>
                ) : null}
              </div>


              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2">
                  {recipe.recipeType ? (
                    <span className="rounded-full bg-secondary/20 px-3 py-1.5 text-xs font-semibold text-secondary-hover">
                      {
                        recipe.recipeType
                          .name
                      }
                    </span>
                  ) : null}


                  {recipe.categories.map(
                    (
                      category,
                    ) => (
                      <span
                        key={
                          category.id
                        }
                        className="rounded-full border border-border bg-page px-3 py-1.5 text-xs font-medium text-muted-foreground"
                      >
                        {
                          category.name
                        }
                      </span>
                    ),
                  )}
                </div>


                <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  {
                    recipe.title
                  }
                </h1>


                {recipe.shortDescription ? (
                  <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                    {
                      recipe.shortDescription
                    }
                  </p>
                ) : null}


                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {recipe.totalMinutes >
                  0 ? (
                    <div className="rounded-2xl bg-page-muted p-4">
                      <Clock3
                        className="size-5 text-brand"
                        aria-hidden="true"
                      />

                      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Tiempo
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {formatMinutes(
                          recipe.totalMinutes,
                        )}
                      </p>
                    </div>
                  ) : null}


                  {recipe.baseServings ? (
                    <div className="rounded-2xl bg-page-muted p-4">
                      <Users
                        className="size-5 text-secondary-hover"
                        aria-hidden="true"
                      />

                      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Raciones
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {
                          recipe.baseServings
                        }
                      </p>
                    </div>
                  ) : null}


                  {difficultyLabel ? (
                    <div className="rounded-2xl bg-page-muted p-4">
                      <ChefHat
                        className="size-5 text-accent"
                        aria-hidden="true"
                      />

                      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Dificultad
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {
                          difficultyLabel
                        }
                      </p>
                    </div>
                  ) : null}
                </div>


                <RecipeShareActions
                  title={
                    recipe.title
                  }
                />
              </div>
            </header>
          </article>
        </Container>
      </section>


      <Container className="pt-12 md:pt-16">
        <div className="mx-auto max-w-6xl">
          {recipe.introduction ? (
            <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Antes de empezar
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                Sobre esta receta
              </h2>

              <p className="mt-5 max-w-4xl whitespace-pre-line text-base leading-8 text-muted-foreground">
                {
                  recipe.introduction
                }
              </p>
            </section>
          ) : null}


          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-10">
              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <ChefHat
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                      Preparación
                    </p>

                    <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">
                      Ingredientes
                    </h2>
                  </div>
                </div>


                <RecipeIngredients
                  baseServings={
                    recipe.baseServings
                  }
                  ingredientGroups={
                    recipe.ingredientGroups
                  }
                />
              </section>


              <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Flame
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                      Paso a paso
                    </p>

                    <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">
                      Elaboración
                    </h2>
                  </div>
                </div>


                {recipe.steps.length >
                0 ? (
                  <ol className="mt-8 space-y-8">
                    {recipe.steps.map(
                      (
                        step,
                        index,
                      ) => (
                        <li
                          key={
                            step.id
                          }
                          className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-4 md:grid-cols-[52px_minmax(0,1fr)] md:gap-5"
                        >
                          {index <
                          recipe.steps.length -
                            1 ? (
                            <div
                              className="absolute bottom-[-2rem] left-[21px] top-11 w-px bg-border md:left-[25px] md:top-13"
                              aria-hidden="true"
                            />
                          ) : null}


                          <div className="relative z-10 flex size-11 items-center justify-center rounded-full bg-brand font-semibold text-inverse shadow-sm md:size-13">
                            {
                              index +
                              1
                            }
                          </div>


                          <div className="pb-1 pt-1">
                            {step.title ? (
                              <h3 className="font-serif text-xl font-bold text-foreground md:text-2xl">
                                {
                                  step.title
                                }
                              </h3>
                            ) : null}


                            <p className="mt-2 whitespace-pre-line leading-7 text-muted-foreground">
                              {
                                step.instructions
                              }
                            </p>


                            {step.durationMinutes ? (
                              <div className="mt-4">
                                <span className="inline-flex items-center gap-2 rounded-full bg-page-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                                  <Timer
                                    className="size-4 text-brand"
                                    aria-hidden="true"
                                  />

                                  {
                                    step.durationMinutes
                                  }{" "}
                                  min
                                </span>
                              </div>
                            ) : null}


                            {step.tip ? (
                              <div className="mt-4 flex gap-3 rounded-2xl border border-accent/25 bg-accent/10 p-4">
                                <Lightbulb
                                  className="mt-0.5 size-5 shrink-0 text-warning"
                                  aria-hidden="true"
                                />

                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider text-warning">
                                    Consejo
                                  </p>

                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {
                                      step.tip
                                    }
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ),
                    )}
                  </ol>
                ) : (
                  <p className="mt-6 text-muted-foreground">
                    No hay pasos de
                    elaboración
                    disponibles.
                  </p>
                )}
              </section>


              {additionalInfo ? (
                <section>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                      Para tener en
                      cuenta
                    </p>

                    <h2 className="mt-2 font-serif text-3xl font-bold text-foreground">
                      Información útil
                    </h2>
                  </div>


                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {recipe.tips ? (
                      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-accent/15 text-warning">
                          <Lightbulb
                            className="size-5"
                            aria-hidden="true"
                          />
                        </span>

                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                          Consejos
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.tips
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.substitutions ? (
                      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                          <Tag
                            className="size-5"
                            aria-hidden="true"
                          />
                        </span>

                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                          Sustituciones
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.substitutions
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.storage ? (
                      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-page-muted text-brand">
                          <BookOpen
                            className="size-5"
                            aria-hidden="true"
                          />
                        </span>

                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                          Conservación
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.storage
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.freezing ? (
                      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-info/10 text-info">
                          <Snowflake
                            className="size-5"
                            aria-hidden="true"
                          />
                        </span>

                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                          Congelación
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.freezing
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.reheating ? (
                      <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                          <Flame
                            className="size-5"
                            aria-hidden="true"
                          />
                        </span>

                        <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
                          Recalentado
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.reheating
                          }
                        </p>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}


              {sourceAvailable ? (
                <section className="rounded-3xl border border-border bg-page-muted/50 p-6 md:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                      <BookOpen
                        className="size-5"
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-hover">
                        Procedencia
                      </p>

                      <h2 className="mt-1 font-serif text-2xl font-bold text-foreground">
                        Fuente
                      </h2>
                    </div>
                  </div>


                  <div className="mt-5">
                    {sourceTypeLabel ? (
                      <p className="font-semibold text-foreground">
                        {
                          sourceTypeLabel
                        }
                      </p>
                    ) : null}


                    {recipe.sourceTitle ? (
                      <p className="mt-2 text-muted-foreground">
                        {
                          recipe.sourceTitle
                        }
                      </p>
                    ) : null}


                    {recipe.sourceAuthor ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Autor:{" "}
                        {
                          recipe.sourceAuthor
                        }
                      </p>
                    ) : null}


                    {recipe.sourcePage ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Página:{" "}
                        {
                          recipe.sourcePage
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
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
                      >
                        Consultar fuente

                        <ArrowRight
                          className="size-4 -rotate-45"
                          aria-hidden="true"
                        />
                      </a>
                    ) : null}


                    {recipe.sourceNotes ? (
                      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                        {
                          recipe.sourceNotes
                        }
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>


            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  De un vistazo
                </p>

                <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
                  Resumen
                </h2>


                <dl className="mt-5 divide-y divide-border text-sm">
                  {recipe.preparationMinutes ? (
                    <div className="flex justify-between gap-4 py-3 first:pt-0">
                      <dt className="text-muted-foreground">
                        Preparación
                      </dt>

                      <dd className="font-semibold text-foreground">
                        {
                          recipe.preparationMinutes
                        }{" "}
                        min
                      </dd>
                    </div>
                  ) : null}


                  {recipe.cookingMinutes ? (
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-muted-foreground">
                        Cocción
                      </dt>

                      <dd className="font-semibold text-foreground">
                        {
                          recipe.cookingMinutes
                        }{" "}
                        min
                      </dd>
                    </div>
                  ) : null}


                  {recipe.additionalMinutes ? (
                    <div className="flex justify-between gap-4 py-3">
                      <dt className="text-muted-foreground">
                        Adicional
                      </dt>

                      <dd className="font-semibold text-foreground">
                        {
                          recipe.additionalMinutes
                        }{" "}
                        min
                      </dd>
                    </div>
                  ) : null}


                  {recipe.totalMinutes >
                  0 ? (
                    <div className="flex justify-between gap-4 pt-4">
                      <dt className="font-semibold text-foreground">
                        Tiempo total
                      </dt>

                      <dd className="font-bold text-brand">
                        {formatMinutes(
                          recipe.totalMinutes,
                        )}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>


              {recipe.allergens.length >
              0 ? (
                <div className="rounded-3xl border border-warning/25 bg-warning/5 p-5">
                  <div className="flex items-center gap-2">
                    <TriangleAlert
                      className="size-5 text-warning"
                      aria-hidden="true"
                    />

                    <h2 className="font-serif text-xl font-bold text-foreground">
                      Alérgenos
                    </h2>
                  </div>


                  <ul className="mt-4 space-y-3">
                    {recipe.allergens.map(
                      (
                        allergen,
                      ) => (
                        <li
                          key={
                            allergen.id
                          }
                          className="rounded-xl bg-surface/80 px-3 py-2.5 text-sm"
                        >
                          <span className="font-semibold text-foreground">
                            {
                              allergen.name
                            }
                          </span>

                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {allergen.presence ===
                            "present"
                              ? "Contiene"
                              : "Puede contener"}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>


                  <p className="mt-5 text-xs leading-5 text-muted-foreground">
                    Información
                    orientativa.
                    Comprueba siempre
                    el etiquetado de
                    los productos
                    utilizados.
                  </p>
                </div>
              ) : null}


              {recipe.tags.length >
              0 ? (
                <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Tag
                      className="size-5 text-secondary-hover"
                      aria-hidden="true"
                    />

                    <h2 className="font-serif text-xl font-bold text-foreground">
                      Etiquetas
                    </h2>
                  </div>


                  <div className="mt-4 flex flex-wrap gap-2">
                    {recipe.tags.map(
                      (
                        tag,
                      ) => (
                        <span
                          key={
                            tag.id
                          }
                          className="rounded-full bg-secondary/15 px-3 py-1.5 text-xs font-semibold text-secondary-hover"
                        >
                          {
                            tag.name
                          }
                        </span>
                      ),
                    )}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>


          {relatedRecipes.length >
          0 ? (
            <section className="mt-20 border-t border-border pt-14">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-2xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                    Sigue cocinando
                  </p>

                  <h2 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
                    También te puede
                    gustar
                  </h2>

                  <p className="mt-3 leading-7 text-muted-foreground">
                    Más ideas
                    relacionadas con
                    esta receta para
                    seguir explorando
                    CociHub.
                  </p>
                </div>


                <Link
                  href="/recipes"
                  className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-brand-hover"
                >
                  Ver todas las recetas

                  <ArrowRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>
              </div>


              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {relatedRecipes.map(
                  (
                    relatedRecipe,
                  ) => (
                    <RecipeCard
                      key={
                        relatedRecipe.id
                      }
                      recipe={
                        relatedRecipe
                      }
                    />
                  ),
                )}
              </div>
            </section>
          ) : null}
        </div>
      </Container>
    </main>
  );
}