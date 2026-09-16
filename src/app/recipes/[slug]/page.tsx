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
  RecipeIngredients,
} from "@/components/recipes/recipe-ingredients";

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
    <main className="min-h-screen pb-20 pt-8 md:pb-24 md:pt-10">
      <Container>
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />

          Volver a recetas
        </Link>


        <article className="mt-8">
          <header className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center gap-2">
              {recipe.featured ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-semibold text-brand">
                  <Star
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Destacada
                </span>
              ) : null}


              {recipe.recipeType ? (
                <span className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground">
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
                    className="rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {
                      category.name
                    }
                  </span>
                ),
              )}
            </div>


            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
              {
                recipe.title
              }
            </h1>


            {recipe.shortDescription ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground md:text-xl">
                {
                  recipe.shortDescription
                }
              </p>
            ) : null}


            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {recipe.totalMinutes >
              0 ? (
                <span className="inline-flex items-center gap-2">
                  <Clock3
                    className="h-5 w-5 text-brand"
                    aria-hidden="true"
                  />

                  {formatMinutes(
                    recipe.totalMinutes,
                  )}
                </span>
              ) : null}


              {recipe.baseServings ? (
                <span className="inline-flex items-center gap-2">
                  <Users
                    className="h-5 w-5 text-brand"
                    aria-hidden="true"
                  />

                  {
                    recipe.baseServings
                  }{" "}
                  raciones
                </span>
              ) : null}


              {difficultyLabel ? (
                <span className="inline-flex items-center gap-2">
                  <ChefHat
                    className="h-5 w-5 text-brand"
                    aria-hidden="true"
                  />

                  {
                    difficultyLabel
                  }
                </span>
              ) : null}
            </div>
          </header>


          {recipe.imageUrl ? (
            <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-border bg-secondary">
              <img
                src={
                  recipe.imageUrl
                }
                alt={
                  recipe.imageAlt ??
                  recipe.title
                }
                className="max-h-[680px] w-full object-cover"
              />
            </div>
          ) : null}


          <div className="mx-auto mt-12 grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-14">
              {recipe.introduction ? (
                <section>
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Sobre esta receta
                  </h2>

                  <p className="mt-4 whitespace-pre-line leading-8 text-muted-foreground">
                    {
                      recipe.introduction
                    }
                  </p>
                </section>
              ) : null}


              <section>
                <div className="flex items-center gap-3">
                  <ChefHat
                    className="h-6 w-6 text-brand"
                    aria-hidden="true"
                  />

                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Ingredientes
                  </h2>
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


              <section>
                <div className="flex items-center gap-3">
                  <Flame
                    className="h-6 w-6 text-brand"
                    aria-hidden="true"
                  />

                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Elaboración
                  </h2>
                </div>


                {recipe.steps.length >
                0 ? (
                  <ol className="mt-7 space-y-8">
                    {recipe.steps.map(
                      (
                        step,
                        index,
                      ) => (
                        <li
                          key={
                            step.id
                          }
                          className="grid grid-cols-[44px_minmax(0,1fr)] gap-4"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand font-semibold text-inverse">
                            {
                              index +
                              1
                            }
                          </div>


                          <div className="pt-1">
                            {step.title ? (
                              <h3 className="font-serif text-xl font-bold text-foreground">
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
                              <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Timer
                                  className="h-4 w-4 text-brand"
                                  aria-hidden="true"
                                />

                                {
                                  step.durationMinutes
                                }{" "}
                                min
                              </p>
                            ) : null}


                            {step.tip ? (
                              <div className="mt-4 flex gap-3 rounded-xl bg-secondary/60 p-4">
                                <Lightbulb
                                  className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                                  aria-hidden="true"
                                />

                                <p className="text-sm leading-6 text-muted-foreground">
                                  {
                                    step.tip
                                  }
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </li>
                      ),
                    )}
                  </ol>
                ) : (
                  <p className="mt-5 text-muted-foreground">
                    No hay pasos de elaboración disponibles.
                  </p>
                )}
              </section>


              {additionalInfo ? (
                <section>
                  <h2 className="font-serif text-3xl font-bold text-foreground">
                    Información útil
                  </h2>


                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {recipe.tips ? (
                      <div className="rounded-2xl border border-border bg-white p-5">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <Lightbulb
                            className="h-5 w-5 text-brand"
                            aria-hidden="true"
                          />

                          Consejos
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.tips
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.substitutions ? (
                      <div className="rounded-2xl border border-border bg-white p-5">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <Tag
                            className="h-5 w-5 text-brand"
                            aria-hidden="true"
                          />

                          Sustituciones
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.substitutions
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.storage ? (
                      <div className="rounded-2xl border border-border bg-white p-5">
                        <div className="font-semibold text-foreground">
                          Conservación
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.storage
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.freezing ? (
                      <div className="rounded-2xl border border-border bg-white p-5">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <Snowflake
                            className="h-5 w-5 text-brand"
                            aria-hidden="true"
                          />

                          Congelación
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                          {
                            recipe.freezing
                          }
                        </p>
                      </div>
                    ) : null}


                    {recipe.reheating ? (
                      <div className="rounded-2xl border border-border bg-white p-5">
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <Flame
                            className="h-5 w-5 text-brand"
                            aria-hidden="true"
                          />

                          Recalentado
                        </div>

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
                <section>
                  <div className="flex items-center gap-3">
                    <BookOpen
                      className="h-6 w-6 text-brand"
                      aria-hidden="true"
                    />

                    <h2 className="font-serif text-3xl font-bold text-foreground">
                      Fuente
                    </h2>
                  </div>


                  <div className="mt-5 rounded-2xl border border-border bg-white p-5">
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
                        className="mt-3 inline-block text-sm font-semibold text-brand hover:text-brand-hover"
                      >
                        Consultar fuente ↗
                      </a>
                    ) : null}


                    {recipe.sourceNotes ? (
                      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                        {
                          recipe.sourceNotes
                        }
                      </p>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>


            <aside className="space-y-6">
              <div className="rounded-2xl border border-border bg-white p-5">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  Resumen
                </h2>


                <dl className="mt-5 space-y-4 text-sm">
                  {recipe.preparationMinutes ? (
                    <div className="flex justify-between gap-4">
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
                    <div className="flex justify-between gap-4">
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
                    <div className="flex justify-between gap-4">
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
                    <div className="flex justify-between gap-4 border-t border-border pt-4">
                      <dt className="font-semibold text-foreground">
                        Total
                      </dt>

                      <dd className="font-semibold text-brand">
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
                <div className="rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-center gap-2">
                    <TriangleAlert
                      className="h-5 w-5 text-brand"
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
                          className="text-sm"
                        >
                          <span className="font-semibold text-foreground">
                            {
                              allergen.name
                            }
                          </span>

                          <span className="ml-2 text-muted-foreground">
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
                <div className="rounded-2xl border border-border bg-white p-5">
                  <div className="flex items-center gap-2">
                    <Tag
                      className="h-5 w-5 text-brand"
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
                          className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
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
        </article>
      </Container>
    </main>
  );
}