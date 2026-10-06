"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Clock3,
  Flame,
  Hourglass,
  Timer,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  communityRecipeTimesSchema,
  type CommunityRecipeTimesFormData,
} from "@/schemas/community-recipe-times-schema";

import {
  updateMyRecipeTimesAction,
} from "./times-actions";


type TimesFormProps = {
  recipeId:
    string;

  initialValues: {
    preparationMinutes:
      number | null;

    cookingMinutes:
      number | null;

    additionalMinutes:
      number | null;
  };

  previousStepHref:
    string;

  nextStepHref:
    string;
};


function parseMinutes(
  value:
    string,
) {
  if (
    !/^\d+$/.test(
      value,
    )
  ) {
    return 0;
  }


  return Number(
    value,
  );
}


export function TimesForm({
  recipeId,
  initialValues,
  previousStepHref,
  nextStepHref,
}: TimesFormProps) {
  const router =
    useRouter();


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    watch,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<
      CommunityRecipeTimesFormData
    >({
      resolver:
        zodResolver(
          communityRecipeTimesSchema,
        ),

      defaultValues: {
        preparationMinutes:
          initialValues
            .preparationMinutes ===
          null
            ? ""
            : String(
                initialValues
                  .preparationMinutes,
              ),

        additionalMinutes:
          initialValues
            .additionalMinutes ===
          null
            ? ""
            : String(
                initialValues
                  .additionalMinutes,
              ),
      },
    });


  const preparationMinutes =
    watch(
      "preparationMinutes",
    );


  const additionalMinutes =
    watch(
      "additionalMinutes",
    );


  const cookingMinutes =
    initialValues
      .cookingMinutes;


  const totalMinutes =
    parseMinutes(
      preparationMinutes,
    ) +
    (
      cookingMinutes ??
      0
    ) +
    parseMinutes(
      additionalMinutes,
    );


  async function onSubmit(
    values:
      CommunityRecipeTimesFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    /*
     * cooking_minutes es derivado de los pasos.
     *
     * Si vale NULL significa que:
     *
     * - no existen pasos, o
     * - alguno de ellos no tiene duración.
     *
     * En ambos casos no permitimos cerrar Tiempos todavía.
     */

    if (
      cookingMinutes ===
      null
    ) {
      setMessage(
        "Completa la duración de todos los pasos de elaboración para calcular el tiempo de cocinado.",
      );

      return;
    }


    const result =
      await updateMyRecipeTimesAction(
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
              field as
                keyof CommunityRecipeTimesFormData,
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


      if (
        result.message
      ) {
        setMessage(
          result.message,
        );
      }


      return;
    }


    reset(
      values,
    );


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 6 de 8
        </p>


        <div className="mt-2 flex items-center gap-2">

          <Timer
            className="size-5 text-brand"
            aria-hidden="true"
          />


          <h2 className="font-serif text-2xl font-semibold">
            Tiempos
          </h2>

        </div>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Indica cuánto tiempo necesitas antes y después
          del cocinado. El tiempo de cocinado se calcula
          automáticamente desde la elaboración.
        </p>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-8 space-y-6"
      >

        {/* =================================================
            PREPARATION
        ================================================= */}

        <div className="rounded-2xl border border-border bg-page-muted/30 p-5">

          <div className="flex items-start gap-3">

            <Clock3
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="min-w-0 flex-1">

              <label
                htmlFor="preparationMinutes"
                className="block font-semibold"
              >
                Tiempo de preparación
              </label>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tiempo necesario para preparar los
                ingredientes antes del cocinado.
              </p>


              <div className="mt-4 flex max-w-xs items-center gap-3">

                <input
                  id="preparationMinutes"
                  type="number"
                  min={
                    0
                  }
                  max={
                    10080
                  }
                  step={
                    1
                  }
                  inputMode="numeric"
                  {...register(
                    "preparationMinutes",
                  )}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  placeholder="Ej. 15"
                />


                <span className="shrink-0 text-sm text-muted-foreground">
                  min
                </span>

              </div>


              {errors.preparationMinutes && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-700"
                >
                  {
                    errors
                      .preparationMinutes
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            COOKING — DERIVED
        ================================================= */}

        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">

          <div className="flex items-start gap-3">

            <Flame
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="min-w-0 flex-1">

              <p className="font-semibold">
                Tiempo de cocinado
              </p>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Se calcula automáticamente sumando
                la duración de todos los pasos de elaboración.
              </p>


              <div className="mt-4">

                {cookingMinutes ===
                null ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                    <p className="text-sm font-medium text-amber-900">
                      Tiempo pendiente de cálculo
                    </p>


                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Revisa Elaboración y asigna una
                      duración a todos los pasos.
                    </p>

                  </div>
                ) : (
                  <div className="inline-flex items-baseline gap-2 rounded-xl border border-border bg-surface px-5 py-3">

                    <span className="font-serif text-3xl font-semibold text-brand">
                      {
                        cookingMinutes
                      }
                    </span>


                    <span className="text-sm text-muted-foreground">
                      min
                    </span>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            ADDITIONAL
        ================================================= */}

        <div className="rounded-2xl border border-border bg-page-muted/30 p-5">

          <div className="flex items-start gap-3">

            <Hourglass
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="min-w-0 flex-1">

              <label
                htmlFor="additionalMinutes"
                className="block font-semibold"
              >
                Tiempo adicional
              </label>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Reposo, marinado, enfriado u otros
                tiempos que no forman parte del cocinado.
                Si no existe, escribe 0.
              </p>


              <div className="mt-4 flex max-w-xs items-center gap-3">

                <input
                  id="additionalMinutes"
                  type="number"
                  min={
                    0
                  }
                  max={
                    10080
                  }
                  step={
                    1
                  }
                  inputMode="numeric"
                  {...register(
                    "additionalMinutes",
                  )}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  placeholder="Ej. 0"
                />


                <span className="shrink-0 text-sm text-muted-foreground">
                  min
                </span>

              </div>


              {errors.additionalMinutes && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-700"
                >
                  {
                    errors
                      .additionalMinutes
                      .message
                  }
                </p>
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            TOTAL
        ================================================= */}

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>

              <p className="text-sm font-medium text-muted-foreground">
                Tiempo total estimado
              </p>


              <p className="mt-1 text-xs text-muted-foreground">
                Preparación + cocinado + tiempo adicional
              </p>

            </div>


            <div className="text-right">

              <span className="font-serif text-4xl font-semibold text-brand">
                {
                  totalMinutes
                }
              </span>


              <span className="ml-2 text-sm text-muted-foreground">
                min
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {message && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {
              message
            }
          </p>
        )}


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">

          <Link
            href={
              previousStepHref
            }
            className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
          >
            ← Anterior
          </Link>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : isDirty
                ? "Guardar y continuar →"
                : "Continuar →"}
          </button>

        </div>

      </form>

    </section>
  );
}
