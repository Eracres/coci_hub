"use client";

import {
  Archive,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Flame,
  Lightbulb,
  RefreshCw,
  Snowflake,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  updateRecipeAdditionalInfoAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeAdditionalInfoSchema,
  type RecipeAdditionalInfoFormData,
  type RecipeSourceType,
} from "@/schemas/recipe-additional-info-schema";


type RecipeAdditionalInfoFormProps = {
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
      RecipeSourceType | null;

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
};


const sourceTypeOptions: {
  value:
    RecipeSourceType;

  label:
    string;
}[] = [
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
];


export function RecipeAdditionalInfoForm({
  recipeId,
  initialValues,
}: RecipeAdditionalInfoFormProps) {
  const router =
    useRouter();


  const previousStepHref =
    `/admin/recipes/${recipeId}/edit?step=image`;


  const nextStepHref =
    `/admin/recipes/${recipeId}/edit?step=allergens`;


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeAdditionalInfoFormData>({
      resolver:
        zodResolver(
          recipeAdditionalInfoSchema,
        ),

      defaultValues: {
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
      },
    });


  async function onSubmit(
    values:
      RecipeAdditionalInfoFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    /*
     * Este paso es opcional.
     *
     * Si no existen cambios pendientes,
     * simplemente avanzamos.
     */
    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );

      return;
    }


    const result =
      await updateRecipeAdditionalInfoAction(
        recipeId,
        values,
      );


    if (
      !result.success
    ) {
      if (
        result.fieldErrors
      ) {
        Object.entries(
          result.fieldErrors,
        ).forEach(
          ([
            field,
            messages,
          ]) => {
            const fieldMessage =
              messages?.[0];


            if (
              !fieldMessage
            ) {
              return;
            }


            setError(
              field as keyof RecipeAdditionalInfoFormData,
              {
                type:
                  "server",

                message:
                  fieldMessage,
              },
            );
          },
        );
      }


      setMessage(
        result.message ??
        "No se pudo guardar la información adicional.",
      );


      return;
    }


    /*
     * Los valores actuales pasan a
     * considerarse guardados.
     */
    reset(
      values,
    );


    router.refresh();


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <div className="flex flex-wrap items-center gap-3">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 8 de 10
          </p>


          <span className="rounded-full border border-border bg-page-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Opcional
          </span>

        </div>


        <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
          Información adicional
        </h2>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Añade consejos, alternativas,
          conservación y la procedencia de
          la receta. Ninguno de estos campos
          es obligatorio para publicarla.
        </p>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-7 space-y-7"
      >

        {/* =================================================
            COOKING NOTES
        ================================================= */}

        <section className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

              <Lightbulb
                className="size-5"
                aria-hidden="true"
              />

            </span>


            <div>

              <h3 className="font-serif text-xl font-semibold text-foreground">
                Consejos y alternativas
              </h3>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Información útil para ayudar
                a preparar o adaptar la receta.
              </p>

            </div>

          </div>


          <div className="mt-6 space-y-5">

            {/* TIPS */}

            <div>

              <label
                htmlFor="tips"
                className="text-sm font-semibold text-foreground"
              >
                Consejos
              </label>


              <textarea
                id="tips"
                rows={
                  4
                }
                {...register(
                  "tips",
                )}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. La salsa queda mejor si se añade al final y se cocina solo un par de minutos."
              />


              {errors.tips && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .tips
                      .message
                  }
                </p>
              )}

            </div>


            {/* SUBSTITUTIONS */}

            <div>

              <div className="flex items-center gap-2">

                <RefreshCw
                  className="size-4 text-brand"
                  aria-hidden="true"
                />


                <label
                  htmlFor="substitutions"
                  className="text-sm font-semibold text-foreground"
                >
                  Sustituciones
                </label>

              </div>


              <textarea
                id="substitutions"
                rows={
                  4
                }
                {...register(
                  "substitutions",
                )}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Puedes sustituir el cerdo por pollo manteniendo el resto de la elaboración."
              />


              {errors.substitutions && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .substitutions
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            STORAGE
        ================================================= */}

        <section className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

              <Archive
                className="size-5"
                aria-hidden="true"
              />

            </span>


            <div>

              <h3 className="font-serif text-xl font-semibold text-foreground">
                Conservación
              </h3>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Explica cómo guardar la receta
                una vez preparada y cómo consumirla
                posteriormente.
              </p>

            </div>

          </div>


          <div className="mt-6 space-y-5">

            {/* STORAGE */}

            <div>

              <label
                htmlFor="storage"
                className="text-sm font-semibold text-foreground"
              >
                Conservación
              </label>


              <textarea
                id="storage"
                rows={
                  3
                }
                {...register(
                  "storage",
                )}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Guardar en un recipiente hermético en la nevera durante un máximo de 3 días."
              />


              {errors.storage && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .storage
                      .message
                  }
                </p>
              )}

            </div>


            {/* FREEZING */}

            <div>

              <div className="flex items-center gap-2">

                <Snowflake
                  className="size-4 text-brand"
                  aria-hidden="true"
                />


                <label
                  htmlFor="freezing"
                  className="text-sm font-semibold text-foreground"
                >
                  Congelación
                </label>

              </div>


              <textarea
                id="freezing"
                rows={
                  3
                }
                {...register(
                  "freezing",
                )}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Puede congelarse sin la guarnición durante aproximadamente 2 meses."
              />


              {errors.freezing && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .freezing
                      .message
                  }
                </p>
              )}

            </div>


            {/* REHEATING */}

            <div>

              <div className="flex items-center gap-2">

                <Flame
                  className="size-4 text-brand"
                  aria-hidden="true"
                />


                <label
                  htmlFor="reheating"
                  className="text-sm font-semibold text-foreground"
                >
                  Recalentado
                </label>

              </div>


              <textarea
                id="reheating"
                rows={
                  3
                }
                {...register(
                  "reheating",
                )}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Recalentar a fuego suave añadiendo una cucharada de agua si la salsa está demasiado espesa."
              />


              {errors.reheating && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .reheating
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            SOURCE
        ================================================= */}

        <section className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

              <BookOpen
                className="size-5"
                aria-hidden="true"
              />

            </span>


            <div>

              <h3 className="font-serif text-xl font-semibold text-foreground">
                Fuente o inspiración
              </h3>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Registra el origen de la receta
                cuando proceda: creación propia,
                tradición familiar, libro, web
                u otra referencia.
              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* SOURCE TYPE */}

            <div>

              <label
                htmlFor="sourceType"
                className="text-sm font-semibold text-foreground"
              >
                Tipo de fuente
              </label>


              <select
                id="sourceType"
                {...register(
                  "sourceType",
                )}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              >

                <option value="">
                  Sin indicar
                </option>


                {sourceTypeOptions.map(
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


              {errors.sourceType && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .sourceType
                      .message
                  }
                </p>
              )}

            </div>


            {/* SOURCE TITLE */}

            <div>

              <label
                htmlFor="sourceTitle"
                className="text-sm font-semibold text-foreground"
              >
                Título de la fuente
              </label>


              <input
                id="sourceTitle"
                type="text"
                {...register(
                  "sourceTitle",
                )}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Cocina tradicional asiática"
              />


              {errors.sourceTitle && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .sourceTitle
                      .message
                  }
                </p>
              )}

            </div>


            {/* SOURCE AUTHOR */}

            <div>

              <label
                htmlFor="sourceAuthor"
                className="text-sm font-semibold text-foreground"
              >
                Autor
              </label>


              <input
                id="sourceAuthor"
                type="text"
                {...register(
                  "sourceAuthor",
                )}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Nombre del autor"
              />


              {errors.sourceAuthor && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .sourceAuthor
                      .message
                  }
                </p>
              )}

            </div>


            {/* SOURCE PAGE */}

            <div>

              <label
                htmlFor="sourcePage"
                className="text-sm font-semibold text-foreground"
              >
                Página o referencia
              </label>


              <input
                id="sourcePage"
                type="text"
                {...register(
                  "sourcePage",
                )}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. pág. 128"
              />


              {errors.sourcePage && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .sourcePage
                      .message
                  }
                </p>
              )}

            </div>


            {/* SOURCE URL */}

            <div className="md:col-span-2">

              <label
                htmlFor="sourceUrl"
                className="text-sm font-semibold text-foreground"
              >
                URL
              </label>


              <input
                id="sourceUrl"
                type="url"
                {...register(
                  "sourceUrl",
                )}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="https://..."
              />


              {errors.sourceUrl && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .sourceUrl
                      .message
                  }
                </p>
              )}

            </div>


            {/* SOURCE NOTES */}

            <div className="md:col-span-2">

              <label
                htmlFor="sourceNotes"
                className="text-sm font-semibold text-foreground"
              >
                Notas sobre la fuente
              </label>


              <textarea
                id="sourceNotes"
                rows={
                  3
                }
                {...register(
                  "sourceNotes",
                )}
                className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. Receta familiar adaptada con algunos cambios personales."
              />


              {errors.sourceNotes && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .sourceNotes
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <p
            role="status"
            className="rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
          >
            {
              message
            }
          </p>
        )}


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() =>
              router.push(
                previousStepHref,
              )
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted"
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Anterior

          </button>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isSubmitting
              ? "Guardando..."
              : isDirty
                ? "Guardar y continuar"
                : "Continuar"}


            {!isSubmitting && (
              <ArrowRight
                className="size-4"
                aria-hidden="true"
              />
            )}

          </button>

        </div>

      </form>

    </section>
  );
}