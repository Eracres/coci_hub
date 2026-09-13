/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  getRecipePreview,
} from "@/services/recipes/recipe-preview-service";


type RecipePreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};


function formatDifficulty(
  difficulty:
    "easy" |
    "medium" |
    "hard" |
    null,
) {
  if (
    difficulty ===
    "easy"
  ) {
    return "Fácil";
  }

  if (
    difficulty ===
    "medium"
  ) {
    return "Media";
  }

  if (
    difficulty ===
    "hard"
  ) {
    return "Difícil";
  }

  return null;
}


function formatMinutes(
  minutes:
    number | null,
) {
  if (
    minutes === null
  ) {
    return null;
  }


  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }


  const hours =
    Math.floor(
      minutes / 60,
    );

  const remaining =
    minutes % 60;


  if (
    remaining === 0
  ) {
    return `${hours} h`;
  }


  return `${hours} h ${remaining} min`;
}


function getStatusLabel(
  status:
    "draft" |
    "published" |
    "archived",
) {
  if (
    status ===
    "published"
  ) {
    return "Publicada";
  }

  if (
    status ===
    "archived"
  ) {
    return "Archivada";
  }

  return "Borrador";
}


export default async function RecipePreviewPage({
  params,
}: RecipePreviewPageProps) {
  const {
    id,
  } =
    await params;


  const preview =
    await getRecipePreview(
      id,
    );


  if (!preview) {
    notFound();
  }


  const {
    recipe,
    imageUrl,
    recipeType,
    categories,
    tags,
    ingredientGroups,
    steps,
    allergens,
  } =
    preview;


  const totalMinutes =
    (
      recipe
        .preparation_minutes ??
      0
    ) +
    (
      recipe
        .cooking_minutes ??
      0
    ) +
    (
      recipe
        .additional_minutes ??
      0
    );


  const difficultyLabel =
    formatDifficulty(
      recipe.difficulty,
    );


  const presentAllergens =
    allergens.filter(
      (allergen) =>
        allergen.presence ===
        "present",
    );


  const possibleAllergens =
    allergens.filter(
      (allergen) =>
        allergen.presence ===
        "possible",
    );


  return (
    <main className="min-h-screen bg-[#FFF9F2] text-[#292522]">

      {/* =============================================
          ADMIN PREVIEW BAR
      ============================================= */}

      <div className="border-b bg-white">

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">

          <div>
            <p className="text-sm font-semibold">
              Vista previa administrativa
            </p>

            <p className="text-xs text-[#6F675F]">
              Esta página no forma parte todavía del área pública.
            </p>
          </div>


          <div className="flex flex-wrap gap-3">

            <Link
              href={`/admin/recipes/${recipe.id}/edit`}
              className="rounded-lg border border-[#DED3C8] bg-white px-4 py-2 text-sm font-medium"
            >
              ← Volver a editar
            </Link>


            <Link
              href="/admin/recipes"
              className="rounded-lg border border-[#DED3C8] bg-white px-4 py-2 text-sm"
            >
              Recetas
            </Link>

          </div>

        </div>

      </div>


      <article className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">

        {/* =============================================
            STATUS
        ============================================= */}

        <div className="mb-6 flex flex-wrap items-center gap-3">

          <span className="rounded-full bg-[#F4E9DC] px-3 py-1 text-sm font-medium">
            {
              getStatusLabel(
                recipe.status,
              )
            }
          </span>


          {recipe.featured && (
            <span className="rounded-full bg-[#E5A93D] px-3 py-1 text-sm font-medium">
              Destacada
            </span>
          )}

        </div>


        {/* =============================================
            HERO
        ============================================= */}

        <header>

          {recipeType && (
            <p className="text-sm font-semibold uppercase tracking-wide text-[#A63F25]">
              {
                recipeType.name
              }
            </p>
          )}


          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            {recipe.title}
          </h1>


          {recipe.short_description && (
            <p className="mt-5 max-w-3xl text-lg text-[#6F675F]">
              {
                recipe.short_description
              }
            </p>
          )}


          {categories.length >
            0 && (
            <div className="mt-5 flex flex-wrap gap-2">

              {categories.map(
                (
                  category,
                ) => (
                  <span
                    key={
                      category.id
                    }
                    className="rounded-full border border-[#DED3C8] bg-white px-3 py-1 text-sm"
                  >
                    {
                      category.name
                    }
                  </span>
                ),
              )}

            </div>
          )}

        </header>


        {/* =============================================
            MAIN IMAGE
        ============================================= */}

        {imageUrl && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-[#F4E9DC]">

            <img
              src={
                imageUrl
              }
              alt={
                recipe.image_alt ??
                recipe.title
              }
              className="aspect-[16/9] w-full object-cover"
            />

          </div>
        )}


        {/* =============================================
            RECIPE DATA
        ============================================= */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-xl border border-[#DED3C8] bg-white p-4">
            <p className="text-sm text-[#6F675F]">
              Raciones
            </p>

            <p className="mt-1 font-semibold">
              {
                recipe.base_servings ??
                "—"
              }
            </p>
          </div>


          <div className="rounded-xl border border-[#DED3C8] bg-white p-4">
            <p className="text-sm text-[#6F675F]">
              Preparación
            </p>

            <p className="mt-1 font-semibold">
              {
                formatMinutes(
                  recipe
                    .preparation_minutes,
                ) ??
                "—"
              }
            </p>
          </div>


          <div className="rounded-xl border border-[#DED3C8] bg-white p-4">
            <p className="text-sm text-[#6F675F]">
              Cocción
            </p>

            <p className="mt-1 font-semibold">
              {
                formatMinutes(
                  recipe
                    .cooking_minutes,
                ) ??
                "—"
              }
            </p>
          </div>


          <div className="rounded-xl border border-[#DED3C8] bg-white p-4">
            <p className="text-sm text-[#6F675F]">
              Tiempo total
            </p>

            <p className="mt-1 font-semibold">
              {
                totalMinutes >
                0
                  ? formatMinutes(
                      totalMinutes,
                    )
                  : "—"
              }
            </p>
          </div>


          <div className="rounded-xl border border-[#DED3C8] bg-white p-4">
            <p className="text-sm text-[#6F675F]">
              Dificultad
            </p>

            <p className="mt-1 font-semibold">
              {
                difficultyLabel ??
                "—"
              }
            </p>
          </div>

        </section>


        {/* =============================================
            INTRODUCTION
        ============================================= */}

        {recipe.introduction && (
          <section className="mx-auto mt-10 max-w-3xl">

            <p className="whitespace-pre-wrap text-lg leading-8">
              {
                recipe.introduction
              }
            </p>

          </section>
        )}


        {/* =============================================
            CONTENT
        ============================================= */}

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">

          {/* ===========================================
              INGREDIENTS
          =========================================== */}

          <section>

            <h2 className="text-2xl font-bold">
              Ingredientes
            </h2>


            <div className="mt-6 space-y-8">

              {ingredientGroups.length ===
              0 ? (
                <p className="text-[#6F675F]">
                  No hay ingredientes.
                </p>
              ) : (
                ingredientGroups.map(
                  (
                    group,
                    groupIndex,
                  ) => (
                    <div
                      key={`${group.name}-${groupIndex}`}
                    >

                      <h3 className="font-semibold">
                        {
                          group.name
                        }
                      </h3>


                      <ul className="mt-3 space-y-3">

                        {group.ingredients.map(
                          (
                            ingredient,
                            ingredientIndex,
                          ) => (
                            <li
                              key={`${ingredient.name}-${ingredientIndex}`}
                              className="border-b border-[#DED3C8] pb-3"
                            >

                              <p>
                                <strong>
                                  {ingredient.quantity &&
                                    `${ingredient.quantity} `}

                                  {ingredient.unit &&
                                    `${ingredient.unit} `}
                                </strong>

                                {
                                  ingredient.name
                                }
                              </p>


                              {ingredient.notes && (
                                <p className="mt-1 text-sm text-[#6F675F]">
                                  {
                                    ingredient.notes
                                  }
                                </p>
                              )}

                            </li>
                          ),
                        )}

                      </ul>

                    </div>
                  ),
                )
              )}

            </div>

          </section>


          {/* ===========================================
              STEPS
          =========================================== */}

          <section>

            <h2 className="text-2xl font-bold">
              Elaboración
            </h2>


            <div className="mt-6 space-y-5">

              {steps.length ===
              0 ? (
                <p className="text-[#6F675F]">
                  No hay pasos de elaboración.
                </p>
              ) : (
                steps.map(
                  (
                    step,
                    index,
                  ) => (
                    <article
                      key={
                        index
                      }
                      className="rounded-xl border border-[#DED3C8] bg-white p-5"
                    >

                      <div className="flex gap-4">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D95D39] font-semibold text-white">
                          {
                            index +
                            1
                          }
                        </div>


                        <div>

                          {step.title && (
                            <h3 className="font-semibold">
                              {
                                step.title
                              }
                            </h3>
                          )}


                          <p className="mt-2 whitespace-pre-wrap leading-7">
                            {
                              step.instructions
                            }
                          </p>


                          {step.durationMinutes && (
                            <p className="mt-3 text-sm text-[#6F675F]">
                              Duración aproximada:{" "}
                              {
                                step.durationMinutes
                              }{" "}
                              min
                            </p>
                          )}


                          {step.tip && (
                            <div className="mt-4 rounded-lg bg-[#FFF4E8] p-4">

                              <p className="text-sm font-semibold">
                                Consejo
                              </p>

                              <p className="mt-1 text-sm">
                                {
                                  step.tip
                                }
                              </p>

                            </div>
                          )}

                        </div>

                      </div>

                    </article>
                  ),
                )
              )}

            </div>

          </section>

        </div>


        {/* =============================================
            ADDITIONAL INFO
        ============================================= */}

        {(
          recipe.tips ||
          recipe.substitutions ||
          recipe.storage ||
          recipe.freezing ||
          recipe.reheating
        ) && (
          <section className="mt-12">

            <h2 className="text-2xl font-bold">
              Información adicional
            </h2>


            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {recipe.tips && (
                <div className="rounded-xl border border-[#DED3C8] bg-white p-5">
                  <h3 className="font-semibold">
                    Consejos
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {
                      recipe.tips
                    }
                  </p>
                </div>
              )}


              {recipe.substitutions && (
                <div className="rounded-xl border border-[#DED3C8] bg-white p-5">
                  <h3 className="font-semibold">
                    Sustituciones
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {
                      recipe.substitutions
                    }
                  </p>
                </div>
              )}


              {recipe.storage && (
                <div className="rounded-xl border border-[#DED3C8] bg-white p-5">
                  <h3 className="font-semibold">
                    Conservación
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {
                      recipe.storage
                    }
                  </p>
                </div>
              )}


              {recipe.freezing && (
                <div className="rounded-xl border border-[#DED3C8] bg-white p-5">
                  <h3 className="font-semibold">
                    Congelación
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {
                      recipe.freezing
                    }
                  </p>
                </div>
              )}


              {recipe.reheating && (
                <div className="rounded-xl border border-[#DED3C8] bg-white p-5">
                  <h3 className="font-semibold">
                    Recalentado
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                    {
                      recipe.reheating
                    }
                  </p>
                </div>
              )}

            </div>

          </section>
        )}


        {/* =============================================
            ALLERGENS
        ============================================= */}

        {allergens.length >
          0 && (
          <section className="mt-12 rounded-xl border border-[#DED3C8] bg-white p-6">

            <h2 className="text-2xl font-bold">
              Alérgenos
            </h2>


            {presentAllergens.length >
              0 && (
              <div className="mt-5">

                <p className="font-semibold">
                  Contiene
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {presentAllergens.map(
                    (
                      allergen,
                    ) => (
                      <span
                        key={
                          allergen.id
                        }
                        className="rounded-full bg-[#F4E9DC] px-3 py-1 text-sm"
                      >
                        {
                          allergen.name
                        }
                      </span>
                    ),
                  )}

                </div>

              </div>
            )}


            {possibleAllergens.length >
              0 && (
              <div className="mt-5">

                <p className="font-semibold">
                  Puede contener
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {possibleAllergens.map(
                    (
                      allergen,
                    ) => (
                      <span
                        key={
                          allergen.id
                        }
                        className="rounded-full border border-[#DED3C8] px-3 py-1 text-sm"
                      >
                        {
                          allergen.name
                        }
                      </span>
                    ),
                  )}

                </div>

              </div>
            )}


            <p className="mt-5 text-sm text-[#6F675F]">
              Información orientativa. Comprueba siempre el etiquetado de los productos utilizados en caso de alergia o intolerancia.
            </p>

          </section>
        )}


        {/* =============================================
            SOURCE
        ============================================= */}

        {(
          recipe.source_type ||
          recipe.source_title ||
          recipe.source_author ||
          recipe.source_url ||
          recipe.source_notes
        ) && (
          <section className="mt-12 border-t border-[#DED3C8] pt-8">

            <h2 className="text-lg font-semibold">
              Fuente de la receta
            </h2>


            {recipe.source_title && (
              <p className="mt-3">
                {
                  recipe.source_title
                }
              </p>
            )}


            {recipe.source_author && (
              <p className="mt-1 text-sm text-[#6F675F]">
                Autor:{" "}
                {
                  recipe.source_author
                }
              </p>
            )}


            {recipe.source_page && (
              <p className="mt-1 text-sm text-[#6F675F]">
                Página:{" "}
                {
                  recipe.source_page
                }
              </p>
            )}


            {recipe.source_url && (
              <a
                href={
                  recipe.source_url
                }
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm underline"
              >
                Ver fuente original
              </a>
            )}


            {recipe.source_notes && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-[#6F675F]">
                {
                  recipe.source_notes
                }
              </p>
            )}

          </section>
        )}


        {/* =============================================
            TAGS
        ============================================= */}

        {tags.length >
          0 && (
          <footer className="mt-12 border-t border-[#DED3C8] pt-8">

            <p className="text-sm font-semibold">
              Etiquetas
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              {tags.map(
                (
                  tag,
                ) => (
                  <span
                    key={
                      tag.id
                    }
                    className="rounded-full border border-[#DED3C8] px-3 py-1 text-sm"
                  >
                    #
                    {
                      tag.name
                    }
                  </span>
                ),
              )}

            </div>

          </footer>
        )}

      </article>

    </main>
  );
}