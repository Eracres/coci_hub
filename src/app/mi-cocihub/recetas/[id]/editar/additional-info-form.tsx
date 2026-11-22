"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CircleAlert,
  Info,
  Lightbulb,
  Loader2,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
  useTransition,
} from "react";

import type {
  RecipeAdditionalInfoFormData,
} from "@/schemas/recipe-additional-info-schema";

import {
  updateMyRecipeAdditionalInfoAction,
  type UpdateMyRecipeAdditionalInfoResult,
} from "./additional-info-actions";


type AdditionalInfoFormProps = {
  recipeId:
    string;

  initialValues: {
    tips:
      string | null;

    substitutions:
      string | null;

    storage:
      string | null;

    freezing:
      string | null;

    reheating:
      string | null;

    sourceType:
      string | null;

    sourceTitle:
      string | null;

    sourceAuthor:
      string | null;

    sourcePage:
      string | null;

    sourceUrl:
      string | null;

    sourceNotes:
      string | null;
  };

  previousStepHref:
    string;

  nextStepHref:
    string;
};


const sourceOptions = [
  {
    value:
      "own",

    label:
      "Receta propia",
  },

  {
    value:
      "family",

    label:
      "Receta familiar",
  },

  {
    value:
      "book",

    label:
      "Libro",
  },

  {
    value:
      "magazine",

    label:
      "Revista",
  },

  {
    value:
      "web",

    label:
      "Web",
  },

  {
    value:
      "handwritten",

    label:
      "Receta manuscrita",
  },

  {
    value:
      "other",

    label:
      "Otra fuente",
  },
] as const;


function firstError(
  errors:
    string[] |
    undefined,
) {
  return errors?.[0] ??
    null;
}


export function AdditionalInfoForm({
  recipeId,
  initialValues,
  previousStepHref,
  nextStepHref,
}: AdditionalInfoFormProps) {
  const router =
    useRouter();


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    values,
    setValues,
  ] =
    useState({
      tips:
        initialValues.tips ??
        "",

      substitutions:
        initialValues.substitutions ??
        "",

      storage:
        initialValues.storage ??
        "",

      freezing:
        initialValues.freezing ??
        "",

      reheating:
        initialValues.reheating ??
        "",

      sourceType:
        initialValues.sourceType ??
        "",

      sourceTitle:
        initialValues.sourceTitle ??
        "",

      sourceAuthor:
        initialValues.sourceAuthor ??
        "",

      sourcePage:
        initialValues.sourcePage ??
        "",

      sourceUrl:
        initialValues.sourceUrl ??
        "",

      sourceNotes:
        initialValues.sourceNotes ??
        "",
    });


  const [
    result,
    setResult,
  ] =
    useState<
      UpdateMyRecipeAdditionalInfoResult | null
    >(
      null,
    );


  function updateValue(
    field:
      keyof typeof values,

    value:
      string,
  ) {
    setValues(
      (
        current,
      ) => ({
        ...current,

        [field]:
          value,
      }),
    );


    if (
      result
    ) {
      setResult(
        null,
      );
    }
  }


  function handleContinue() {
    startTransition(
      async () => {
        const response =
          await updateMyRecipeAdditionalInfoAction(
            recipeId,
            values as RecipeAdditionalInfoFormData,
          );


        setResult(
          response,
        );


        if (
          response.success
        ) {
          router.push(
            nextStepHref,
          );


          router.refresh();
        }
      },
    );
  }


  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm">
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="border-b border-border px-5 py-6 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Info
              className="size-5"
              aria-hidden="true"
            />
          </span>


          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-3xl font-bold">
                Información adicional
              </h2>


              <span className="rounded-full border border-accent/35 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-warning">
                Opcional
              </span>
            </div>


            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Añade contexto, consejos y
              el origen de la receta.
              Esta información ayuda a
              CociHub a moderar y enriquecer
              la publicación.
            </p>
          </div>
        </div>


        <div className="mt-5 flex gap-3 rounded-2xl border border-accent/30 bg-accent/[0.06] p-4">
          <CircleAlert
            className="mt-0.5 size-5 shrink-0 text-warning"
            aria-hidden="true"
          />

          <p className="text-sm leading-6 text-muted-foreground">
            Este apartado es opcional y
            no bloquea el envío de la
            receta a revisión.
          </p>
        </div>
      </header>


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="grid gap-5 p-5 sm:p-7 xl:grid-cols-2">
        {/* ===============================================
            ADVICE + PRESERVATION
        =============================================== */}

        <section className="rounded-2xl border border-border bg-page/35 p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary-hover">
              <Lightbulb
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <div>
              <h3 className="font-serif text-2xl font-bold">
                Consejos y conservación
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Comparte tus trucos,
                alternativas y cómo conservar
                correctamente la receta.
              </p>
            </div>
          </div>


          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="additional-tips"
                className="mb-2 block text-sm font-semibold"
              >
                Consejos
              </label>

              <textarea
                id="additional-tips"
                rows={3}
                value={
                  values.tips
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "tips",
                    event.target.value,
                  )
                }
                placeholder="Por ejemplo, usa limón recién exprimido, no de bote..."
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.tips,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.tips,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div>
              <label
                htmlFor="additional-substitutions"
                className="mb-2 block text-sm font-semibold"
              >
                Sustituciones
              </label>

              <textarea
                id="additional-substitutions"
                rows={3}
                value={
                  values.substitutions
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "substitutions",
                    event.target.value,
                  )
                }
                placeholder="Por ejemplo, puedes usar pavo en lugar de pollo..."
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.substitutions,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.substitutions,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div>
              <label
                htmlFor="additional-storage"
                className="mb-2 block text-sm font-semibold"
              >
                Conservación
              </label>

              <textarea
                id="additional-storage"
                rows={3}
                value={
                  values.storage
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "storage",
                    event.target.value,
                  )
                }
                placeholder="Por ejemplo, se conserva 2–3 días en la nevera..."
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.storage,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.storage,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div>
              <label
                htmlFor="additional-freezing"
                className="mb-2 block text-sm font-semibold"
              >
                Congelación
              </label>

              <textarea
                id="additional-freezing"
                rows={3}
                value={
                  values.freezing
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "freezing",
                    event.target.value,
                  )
                }
                placeholder="Por ejemplo, se puede congelar una vez cocinada..."
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.freezing,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.freezing,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div>
              <label
                htmlFor="additional-reheating"
                className="mb-2 block text-sm font-semibold"
              >
                Recalentado
              </label>

              <textarea
                id="additional-reheating"
                rows={3}
                value={
                  values.reheating
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "reheating",
                    event.target.value,
                  )
                }
                placeholder="Por ejemplo, calienta en sartén a fuego medio..."
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.reheating,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.reheating,
                    )
                  }
                </p>
              ) : null}
            </div>
          </div>
        </section>


        {/* ===============================================
            SOURCE
        =============================================== */}

        <section className="rounded-2xl border border-border bg-page/35 p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <BookOpen
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <div>
              <h3 className="font-serif text-2xl font-bold">
                Origen de la receta
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Indica de dónde procede:
                tradición familiar, creación
                propia, libro, web u otra fuente.
              </p>
            </div>
          </div>


          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="additional-source-type"
                className="mb-2 block text-sm font-semibold"
              >
                Tipo de fuente
              </label>

              <select
                id="additional-source-type"
                value={
                  values.sourceType
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "sourceType",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              >
                <option value="">
                  Sin indicar
                </option>

                {sourceOptions.map(
                  (
                    option,
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>


              {firstError(
                result
                  ?.fieldErrors
                  ?.sourceType,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.sourceType,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div>
              <label
                htmlFor="additional-source-title"
                className="mb-2 block text-sm font-semibold"
              >
                Título o nombre de la fuente
              </label>

              <input
                id="additional-source-title"
                type="text"
                value={
                  values.sourceTitle
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "sourceTitle",
                    event.target.value,
                  )
                }
                placeholder="Por ejemplo, Cocina de casa"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.sourceTitle,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.sourceTitle,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="additional-source-author"
                  className="mb-2 block text-sm font-semibold"
                >
                  Autor
                </label>

                <input
                  id="additional-source-author"
                  type="text"
                  value={
                    values.sourceAuthor
                  }
                  onChange={(
                    event,
                  ) =>
                    updateValue(
                      "sourceAuthor",
                      event.target.value,
                    )
                  }
                  placeholder="Por ejemplo, María Pérez"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />

                {firstError(
                  result
                    ?.fieldErrors
                    ?.sourceAuthor,
                ) ? (
                  <p className="mt-2 text-xs text-red-700">
                    {
                      firstError(
                        result
                          ?.fieldErrors
                          ?.sourceAuthor,
                      )
                    }
                  </p>
                ) : null}
              </div>


              <div>
                <label
                  htmlFor="additional-source-page"
                  className="mb-2 block text-sm font-semibold"
                >
                  Página
                </label>

                <input
                  id="additional-source-page"
                  type="text"
                  value={
                    values.sourcePage
                  }
                  onChange={(
                    event,
                  ) =>
                    updateValue(
                      "sourcePage",
                      event.target.value,
                    )
                  }
                  placeholder="Por ejemplo, pág. 124"
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />

                {firstError(
                  result
                    ?.fieldErrors
                    ?.sourcePage,
                ) ? (
                  <p className="mt-2 text-xs text-red-700">
                    {
                      firstError(
                        result
                          ?.fieldErrors
                          ?.sourcePage,
                      )
                    }
                  </p>
                ) : null}
              </div>
            </div>


            <div>
              <label
                htmlFor="additional-source-url"
                className="mb-2 block text-sm font-semibold"
              >
                URL
              </label>

              <input
                id="additional-source-url"
                type="url"
                value={
                  values.sourceUrl
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "sourceUrl",
                    event.target.value,
                  )
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.sourceUrl,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.sourceUrl,
                    )
                  }
                </p>
              ) : null}
            </div>


            <div>
              <label
                htmlFor="additional-source-notes"
                className="mb-2 block text-sm font-semibold"
              >
                Notas sobre la fuente
              </label>

              <textarea
                id="additional-source-notes"
                rows={5}
                value={
                  values.sourceNotes
                }
                onChange={(
                  event,
                ) =>
                  updateValue(
                    "sourceNotes",
                    event.target.value,
                  )
                }
                placeholder="Añade cualquier detalle relevante sobre el origen o las adaptaciones que hayas hecho..."
                className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />

              {firstError(
                result
                  ?.fieldErrors
                  ?.sourceNotes,
              ) ? (
                <p className="mt-2 text-xs text-red-700">
                  {
                    firstError(
                      result
                        ?.fieldErrors
                        ?.sourceNotes,
                    )
                  }
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>


      {/* ===================================================
          RESULT
      =================================================== */}

      {result?.message ? (
        <div
          role="status"
          className={`mx-5 mb-5 rounded-xl border px-4 py-3 text-sm sm:mx-7 ${
            result.success
              ? "border-secondary/30 bg-secondary/[0.07] text-secondary-hover"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {
            result.message
          }
        </div>
      ) : null}


      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <footer className="flex flex-col gap-3 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <Link
          href={
            previousStepHref
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold transition hover:bg-page-muted"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Imagen
        </Link>


        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Info
              className="size-4"
              aria-hidden="true"
            />

            Este apartado es opcional.
          </span>


          <button
            type="button"
            disabled={
              isPending
            }
            onClick={
              handleContinue
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />

                Guardando...
              </>
            ) : (
              <>
                Guardar y continuar

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        </div>
      </footer>
    </section>
  );
}
